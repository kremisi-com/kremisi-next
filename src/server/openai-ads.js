import "server-only";
import { headers } from "next/headers";
import { after } from "next/server";
import { createContactConversion, sendContactConversion } from "./openai-ads-capi.mjs";
import { ADS_CONSENT_GRANTED } from "../lib/openai-ads-config.mjs";

export async function scheduleOpenAIAdsLead({ formData, email, eventId, locale }) {
  // All context reads, hashing, URL construction, and scheduling share the same
  // failure boundary. The network request runs after the successful response.
  try {
    const requestHeaders = await headers();
    const conversion = createContactConversion({
      cookieHeader: requestHeaders.get("cookie") || "",
      measurementConsent: formData.get("openaiAdsConsent") === ADS_CONSENT_GRANTED && requestHeaders.get("sec-gpc") !== "1",
      requestOrigin: requestHeaders.get("origin"),
      sourceUrl: formData.get("openaiAdsSourceUrl"),
      browserObref: formData.get("openaiAdsObref"),
      userAgent: requestHeaders.get("user-agent"),
      email, eventId, locale,
    });
    if (!conversion) return undefined;
    if (process.env.OPENAI_ADS_CONVERSIONS_API_KEY?.trim()) {
      try {
        after(() => sendContactConversion(conversion.event));
      } catch {
        console.warn("[OpenAI Ads] Conversion scheduling failed.");
      }
    }
    return conversion.pixel;
  } catch {
    console.warn("[OpenAI Ads] Conversion setup failed.");
    return undefined;
  }
}
