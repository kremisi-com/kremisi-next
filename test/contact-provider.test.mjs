import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

// Execute production helpers with fake provider/network adapters. These tests
// cannot send commercial emails or call Cloudflare.
function loadHelper(path, dependencies, name) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8")
    .replace(/^import .*;\r?$/gm, "")
    .replace(/export async function/g, "async function");
  return runInNewContext(`${source}\n${name}`, {
    console: { info() {}, warn() {}, error() {} },
    URLSearchParams, AbortSignal,
    ...dependencies,
  });
}

const payload = {
  service: "information", details: "QA synthetic contact",
  name: "QA\r\nTest", email: "qa@example.invalid", source: "automation_landing",
};
const emailEnv = {
  RESEND_API_KEY: "test-only-placeholder",
  RESEND_FROM_EMAIL: "QA <sender@example.invalid>",
  CONTACT_EMAIL_TO: "recipient@example.invalid",
};

function emailHelper(env = emailEnv, result = { data: { id: "email-accepted" }, error: null }) {
  const calls = [];
  class FakeResend {
    constructor(apiKey) {
      assert.equal(apiKey, emailEnv.RESEND_API_KEY);
      this.emails = { send: async (...args) => { calls.push(args); return result; } };
    }
  }
  return {
    send: loadHelper("../src/lib/contact-email.js", {
      Resend: FakeResend, process: { env },
    }, "sendContactEmail"), calls,
  };
}

test("email helper fails closed for each missing configuration value", async () => {
  for (const key of Object.keys(emailEnv)) {
    const { send, calls } = emailHelper({ ...emailEnv, [key]: " " });
    await assert.rejects(send(payload), new RegExp(key));
    assert.equal(calls.length, 0);
  }
});

test("email helper rejects provider errors and missing accepted email IDs", async () => {
  for (const response of [
    { data: null, error: { name: "unavailable", message: "Synthetic provider failure" } },
    { data: null, error: null },
    { data: {}, error: null },
  ]) {
    const { send } = emailHelper(emailEnv, response);
    await assert.rejects(send(payload));
  }
});

test("email acceptance returns provider ID and routes a sanitized plain-text message", async () => {
  const { send, calls } = emailHelper();
  assert.equal(await send(payload), "email-accepted");
  assert.equal(calls.length, 1);
  const [message] = calls[0];
  assert.equal(message.to, emailEnv.CONTACT_EMAIL_TO);
  assert.equal(message.from, emailEnv.RESEND_FROM_EMAIL);
  assert.equal(message.replyTo, payload.email);
  assert.doesNotMatch(message.subject, /[\r\n]/);
  assert.match(message.text, /Landing automazioni aziendali/);
  assert.match(message.text, /QA synthetic contact/);
});

test("email retry passes the same idempotency key to the provider SDK", async () => {
  const { send, calls } = emailHelper();
  await send(payload, { requestId: "contact-stable-test-intent" });
  await send(payload, { requestId: "contact-stable-test-intent" });
  assert.equal(calls.length, 2);
  for (const [, options] of calls) {
    assert.equal(options.idempotencyKey, "contact-stable-test-intent");
  }
});

function turnstileHelper({ secret = "test-only-secret", response, fetchError } = {}) {
  const calls = [];
  const verify = loadHelper("../src/lib/turnstile.js", {
    process: { env: { CLOUDFLARE_TURNSTILE_SECRET_KEY: secret } },
    fetch: async (...args) => {
      calls.push(args);
      if (fetchError) throw fetchError;
      return response || { ok: true, status: 200, json: async () => ({ success: true }) };
    },
  }, "verifyTurnstileToken");
  return { verify, calls };
}

test("Turnstile missing secret or token is rejected before any network request", async () => {
  const missingSecret = turnstileHelper({ secret: " " });
  assert.equal((await missingSecret.verify({ token: "test-token" })).reason, "missing-secret-key");
  assert.equal(missingSecret.calls.length, 0);
  const missingToken = turnstileHelper();
  for (const token of [undefined, "", " ", 123]) {
    assert.equal((await missingToken.verify({ token })).reason, "missing-token");
  }
  assert.equal(missingToken.calls.length, 0);
});

test("Turnstile validates tokens server-side with bounded, uncached POST", async () => {
  const { verify, calls } = turnstileHelper();
  assert.equal((await verify({ token: " test-token ", ip: "192.0.2.1" })).success, true);
  const [url, options] = calls[0];
  assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(options.method, "POST");
  assert.equal(options.cache, "no-store");
  assert.equal(options.body.get("response"), "test-token");
  assert.equal(options.body.get("secret"), "test-only-secret");
  assert.equal(options.body.get("remoteip"), "192.0.2.1");
  assert.ok(options.signal instanceof AbortSignal);
});

test("Turnstile rejects invalid, expired, and already-used token responses", async () => {
  for (const code of ["invalid-input-response", "timeout-or-duplicate"]) {
    const { verify } = turnstileHelper({ response: {
      ok: true, status: 200, json: async () => ({ success: false, "error-codes": [code] }),
    } });
    const result = await verify({ token: "test-token" });
    assert.equal(result.success, false);
    assert.equal(result.errorCodes[0], code);
  }
});

test("Turnstile requires HTTP success and a strict boolean success response", async () => {
  for (const [ok, success] of [[false, true], [true, "true"], [true, 1], [true, null], [true, false]]) {
    const { verify } = turnstileHelper({ response: {
      ok, status: ok ? 200 : 503, json: async () => ({ success }),
    } });
    assert.equal((await verify({ token: "test-token" })).success, false);
  }
});

test("Turnstile JSON and network failures return security failures", async () => {
  const invalidJson = turnstileHelper({ response: {
    ok: true, status: 200, json: async () => { throw new SyntaxError("Synthetic invalid JSON"); },
  } });
  const jsonResult = await invalidJson.verify({ token: "test-token" });
  assert.equal(jsonResult.success, false);
  assert.equal(jsonResult.reason, "invalid-verification-response");
  const network = turnstileHelper({ fetchError: new Error("Synthetic network failure") });
  const networkResult = await network.verify({ token: "test-token" });
  assert.equal(networkResult.success, false);
  assert.equal(networkResult.reason, "verification-request-failed");
});
