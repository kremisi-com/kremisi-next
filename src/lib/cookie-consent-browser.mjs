import { COOKIE_CONSENT_EVENT, hasCookiePurpose, MEASUREMENT_PURPOSE, MARKETING_PURPOSE } from "./cookie-consent.mjs";
import { syncOpenAIAdsConsent } from "./openai-ads-browser.mjs";

export const GOOGLE_ANALYTICS_ID = "G-TK345YVSSJ";

export function syncGoogleConsent() {
  window.dataLayer ||= [];
  window.gtag ||= function () { window.dataLayer.push(arguments); };
  if (!window.__kremisiGoogleConsentInitialized) {
    window.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    window.__kremisiGoogleConsentInitialized = true;
  }
  const analytics = hasCookiePurpose(MEASUREMENT_PURPOSE);
  const marketing = hasCookiePurpose(MARKETING_PURPOSE);
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = !analytics;
  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
  return { analytics, marketing };
}

export function notifyCookieConsent() {
  try { syncGoogleConsent(); } catch { /* A provider failure must not block revocation. */ }
  syncOpenAIAdsConsent();
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
