import {
  ADS_CONSENT_DENIED,
  ADS_CONSENT_EVENT,
  ADS_CONSENT_GRANTED,
  OPENAI_ADS_PIXEL_ID,
  readRawCookie,
} from "./openai-ads-config.mjs";
import { hasCookiePurpose, MARKETING_PURPOSE } from "./cookie-consent.mjs";

const SCRIPT_ID = "openai-ads-pixel";

export function getAdsConsent() {
  try {
    return hasCookiePurpose(MARKETING_PURPOSE) ? ADS_CONSENT_GRANTED : ADS_CONSENT_DENIED;
  } catch {
    return undefined;
  }
}

function pixelState() {
  return window.__kremisiOpenAIAds ||= {
    initialized: false,
    lastPage: null,
    leadIds: new Set(),
  };
}

function ensurePixel() {
  if (typeof window === "undefined" || getAdsConsent() !== ADS_CONSENT_GRANTED) return false;
  const state = pixelState();
  if (!window.oaiq) {
    const queue = function (...args) { queue.q.push(args); };
    queue.q = [];
    window.oaiq = queue;
  }
  if (!state.initialized) {
    window.oaiq("consent", false);
    window.oaiq("init", { pixelId: OPENAI_ADS_PIXEL_ID });
    state.initialized = true;
  }
  window.oaiq("consent", true);
  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
    script.async = true;
    // A later visit can retry a failed SDK download without a second init.
    script.onerror = () => script.remove();
    document.head.appendChild(script);
  }
  return true;
}

// Called by iubenda; no independent consent choice or cookie is persisted.
export function syncOpenAIAdsConsent() {
  try {
    const granted = getAdsConsent() === ADS_CONSENT_GRANTED;
    const state = pixelState();
    if (state.consent === granted) return;
    state.consent = granted;
    if (!granted && window.oaiq) {
      // Discard any undelivered stub events before loading the SDK.
      if (Array.isArray(window.oaiq.q)) {
        window.oaiq.q = [["consent", false], ...window.oaiq.q.filter(
          (args) => args[0] === "init" && args[1]?.pixelId,
        )];
      }
      window.oaiq("consent", false);
    }
    window.dispatchEvent(new Event(ADS_CONSENT_EVENT));
  } catch {
    // Measurement must never interfere with navigation or form submission.
  }
}

export function trackOpenAIAdsPage(pathname) {
  try {
    if (!ensurePixel()) return;
    const state = pixelState();
    if (state.lastPage === pathname) return;
    window.oaiq("measure", "page_viewed", {
      type: "contents",
      contents: [{ id: pathname, content_type: "page" }],
    }, { opt_out: true });
    state.lastPage = pathname;
  } catch { /* Optional measurement. */ }
}

export function trackOpenAIAdsContent(id, name) {
  try {
    if (!ensurePixel()) return false;
    window.oaiq("measure", "contents_viewed", {
      type: "contents",
      contents: [{ id, name, content_type: "project" }],
    }, { opt_out: true });
    return true;
  } catch {
    return false;
  }
}

export function appendOpenAIAdsContext(formData) {
  try {
    formData.delete("openaiAdsConsent");
    formData.delete("openaiAdsSourceUrl");
    formData.delete("openaiAdsObref");
    if (getAdsConsent() !== ADS_CONSENT_GRANTED) return;
    formData.set("openaiAdsConsent", ADS_CONSENT_GRANTED);
    formData.set("openaiAdsSourceUrl", `${window.location.origin}${window.location.pathname}`);
    const obref = readRawCookie(document.cookie, "__obref");
    if (obref) formData.set("openaiAdsObref", obref);
  } catch { /* The existing form still submits. */ }
}

export function trackOpenAIAdsLead(conversion) {
  try {
    if (!conversion?.eventId || !ensurePixel()) return;
    const state = pixelState();
    if (state.leadIds.has(conversion.eventId)) return;
    if (/^[a-f0-9]{64}$/.test(conversion.emailSha256 || "")) {
      window.oaiq("init", { user: { email_sha256: conversion.emailSha256 } });
    }
    window.oaiq("measure", "lead_created", { type: "customer_action" }, {
      event_id: conversion.eventId,
      opt_out: true,
    });
    state.leadIds.add(conversion.eventId);
  } catch { /* The lead is already accepted; tracking cannot change that. */ }
}
