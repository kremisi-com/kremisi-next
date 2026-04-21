const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function normalizeToken(token) {
  return typeof token === "string" ? token.trim() : "";
}

export async function verifyTurnstileToken({ token, ip } = {}) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim();
  const normalizedToken = normalizeToken(token);

  if (!secretKey) {
    return {
      success: false,
      reason: "missing-secret-key",
      errorCodes: ["missing-secret-key"],
    };
  }

  if (!normalizedToken) {
    return {
      success: false,
      reason: "missing-token",
      errorCodes: ["missing-token"],
    };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: normalizedToken,
  });

  if (ip) {
    body.set("remoteip", ip);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    return {
      success: Boolean(payload?.success),
      reason: payload?.success ? null : "verification-failed",
      errorCodes: Array.isArray(payload?.["error-codes"])
        ? payload["error-codes"]
        : [],
      payload,
    };
  } catch {
    return {
      success: false,
      reason: "verification-request-failed",
      errorCodes: ["verification-request-failed"],
    };
  }
}
