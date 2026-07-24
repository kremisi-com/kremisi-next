import assert from "node:assert/strict";
import test from "node:test";

import {
  canUseModelFallback,
  classifyProviderFailure,
  DEFAULT_OPENROUTER_FALLBACK_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_MODEL_FALLBACK_ENABLED,
} from "../src/lib/roaster-ai-routing.mjs";

test("OpenRouter defaults stay on the free router", () => {
  assert.equal(DEFAULT_OPENROUTER_MODEL, "openrouter/free");
  assert.equal(DEFAULT_OPENROUTER_FALLBACK_MODEL, "openrouter/free");
  assert.equal(DEFAULT_OPENROUTER_MODEL_FALLBACK_ENABLED, true);
});

test("OpenRouter payment and missing-model responses trigger model fallback", () => {
  assert.equal(
    classifyProviderFailure({
      provider: "openrouter",
      status: 402,
      message: "Payment required",
    }),
    "model_unavailable",
  );
  assert.equal(
    classifyProviderFailure({
      provider: "openrouter",
      status: 404,
      message: "Model not found",
    }),
    "model_unavailable",
  );
  assert.equal(
    classifyProviderFailure({
      provider: "openrouter",
      status: 400,
      message:
        "The configured model is no longer available as a free model. It has transitioned to a paid model.",
    }),
    "model_unavailable",
  );
});

test("OpenRouter authentication errors never trigger model fallback", () => {
  for (const status of [401, 403]) {
    const errorCode = classifyProviderFailure({
      provider: "openrouter",
      status,
      message: "Authentication failed",
    });

    assert.equal(errorCode, "provider_error");
    assert.equal(
      canUseModelFallback({
        enabled: true,
        primaryModel: "retired/model:free",
        fallbackModel: "openrouter/free",
        errorCode,
      }),
      false,
    );
  }
});

test("model fallback runs once only when the fallback differs", () => {
  assert.equal(
    canUseModelFallback({
      enabled: true,
      primaryModel: "retired/model:free",
      fallbackModel: "openrouter/free",
      errorCode: "model_unavailable",
    }),
    true,
  );
  assert.equal(
    canUseModelFallback({
      enabled: true,
      primaryModel: "openrouter/free",
      fallbackModel: "openrouter/free",
      errorCode: "model_unavailable",
    }),
    false,
  );
});
