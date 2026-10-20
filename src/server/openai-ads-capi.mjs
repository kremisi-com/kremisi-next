import { createHash } from "node:crypto";
import {
  hasAdsConsent,
  OPENAI_ADS_PIXEL_ID,
  OPENAI_ADS_SITE_ORIGIN,
  readRawCookie,
} from "../lib/openai-ads-config.mjs";

function httpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? url : null;
  } catch {
    return null;
  }
}

export function getAdsSourceUrl(sourceUrl, requestOrigin, locale) {
  const source = httpUrl(sourceUrl);
  const request = httpUrl(requestOrigin);
  const trustedOrigins = new Set([OPENAI_ADS_SITE_ORIGIN, request?.origin]);
  if (source && trustedOrigins.has(source.origin)) {
    return `${source.origin}${source.pathname}`;
  }
  return `${OPENAI_ADS_SITE_ORIGIN}/${locale === "it" ? "it" : "en"}/contacts`;
}

export function createContactConversion({
  cookieHeader, measurementConsent, requestOrigin, sourceUrl, browserObref, userAgent, email, eventId, locale,
}) {
  if (!measurementConsent || !hasAdsConsent(cookieHeader)) return undefined;
  const emailSha256 = createHash("sha256").update(email.trim().toLowerCase(), "utf8").digest("hex");
  const oppref = readRawCookie(cookieHeader, "__oppref");
  const obref = readRawCookie(cookieHeader, "__obref") ||
    (typeof browserObref === "string" && browserObref.trim() ? browserObref : undefined);
  const event = {
    id: eventId,
    type: "lead_created",
    timestamp_ms: Date.now(),
    action_source: "web",
    source_url: getAdsSourceUrl(sourceUrl, requestOrigin, locale),
    opt_out: true,
    ...(oppref ? { oppref } : {}),
    user: {
      emails_sha256: [emailSha256],
      ...(obref ? { obref } : {}),
      ...(userAgent ? { user_agent: userAgent } : {}),
    },
    data: { type: "customer_action" },
  };
  return { event, pixel: { eventId, emailSha256 } };
}

export async function sendContactConversion(event) {
  try {
    const apiKey = process.env.OPENAI_ADS_CONVERSIONS_API_KEY?.trim();
    if (!apiKey) return;
    const response = await fetch(`https://bzr.openai.com/v1/events?pid=${OPENAI_ADS_PIXEL_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: process.env.OPENAI_ADS_VALIDATE_ONLY === "true",
        events: [event],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) console.warn("[OpenAI Ads] Conversion rejected.", { status: response.status });
  } catch {
    // Never log payloads, attribution, response bodies, identifiers, or credentials.
    console.warn("[OpenAI Ads] Conversion reporting failed.");
  }
}
