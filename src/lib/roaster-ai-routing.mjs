export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
export const DEFAULT_OPENROUTER_FALLBACK_MODEL = "openrouter/free";
export const DEFAULT_OPENROUTER_MODEL_FALLBACK_ENABLED = true;

const RECOVERABLE_PROVIDER_STATUSES = new Set([
  408,
  409,
  425,
  429,
  500,
  502,
  503,
  504,
  529,
]);

const MODEL_FALLBACK_ERROR_CODES = new Set([
  "model_unavailable",
  "recoverable_provider_error",
  "truncated_after_retry",
  "parse_failed_after_retry",
]);

const OPENROUTER_MODEL_UNAVAILABLE_PATTERNS = [
  /\bno longer (?:available|free)\b/i,
  /\bnot available as a free model\b/i,
  /\btransitioned to a paid model\b/i,
  /\bmodel\b.*\b(?:not found|unavailable|retired|deprecated)\b/i,
  /\b(?:unknown|invalid) model\b/i,
];

export function classifyProviderFailure({
  provider,
  status,
  message = "",
}) {
  if (provider === "openrouter" && status !== 401 && status !== 403) {
    const modelBecameUnavailable =
      status === 402 ||
      status === 404 ||
      OPENROUTER_MODEL_UNAVAILABLE_PATTERNS.some((pattern) =>
        pattern.test(message),
      );

    if (modelBecameUnavailable) {
      return "model_unavailable";
    }
  }

  if (RECOVERABLE_PROVIDER_STATUSES.has(status)) {
    return "recoverable_provider_error";
  }

  return "provider_error";
}

export function canUseModelFallback({
  enabled,
  primaryModel,
  fallbackModel,
  errorCode,
}) {
  return Boolean(
    enabled &&
      fallbackModel &&
      fallbackModel !== primaryModel &&
      MODEL_FALLBACK_ERROR_CODES.has(errorCode),
  );
}
