// Existing iubenda account. Keep storage.useSiteId aligned with this cookie.
export const IUBENDA_SITE_ID = 4256004;
export const IUBENDA_POLICY_ID = 87027585;
export const IUBENDA_CONSENT_COOKIE = `_iub_cs-s${IUBENDA_SITE_ID}`;
export const COOKIE_CONSENT_EVENT = "kremisi-cookie-consent";
export const MEASUREMENT_PURPOSE = "4";
export const MARKETING_PURPOSE = "5";

export function allowsPurpose(preferences, purpose) {
  if (preferences?.purposes?.[purpose] !== true) return false;
  // Respect iubenda's US privacy choices and GPC-normalized preferences too.
  return purpose !== MARKETING_PURPOSE ||
    !["s", "sh", "adv"].some((key) => preferences.uspr?.[key] === false);
}

export function readIubendaPreferences(cookieHeader = "") {
  try {
    const cookies = cookieHeader.split(";").map((part) => part.trimStart());
    function read(name) {
      const prefix = `${name}=`;
      const cookie = cookies.find((part) => part.startsWith(prefix));
      return cookie ? JSON.parse(decodeURIComponent(cookie.slice(prefix.length))) : undefined;
    }
    const preferences = read(IUBENDA_CONSENT_COOKIE);
    const uspr = read(`${IUBENDA_CONSENT_COOKIE}-uspr`);
    return preferences && { ...preferences, ...(uspr ? { uspr: uspr.uspr || uspr.purposes || uspr } : {}) };
  } catch {
    return undefined;
  }
}

export function getCookiePreferences() {
  try {
    if (window.__kremisiCmpFailed) return undefined;
    const api = window._iub?.cs?.api;
    // A stale cookie alone must not bypass iubenda's validation/expiry checks.
    return api?.isPreferenceExpressed() ? api.getPreferences() : undefined;
  } catch {
    return undefined;
  }
}

export function hasCookiePurpose(purpose) {
  return allowsPurpose(getCookiePreferences(), purpose);
}
