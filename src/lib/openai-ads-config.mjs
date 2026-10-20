import { allowsPurpose, readIubendaPreferences, MARKETING_PURPOSE } from "./cookie-consent.mjs";

// Public identifier shared by the browser Pixel and server-side CAPI.
export const OPENAI_ADS_PIXEL_ID = "XUknsuwioN947vpX5LA4iD";
export const OPENAI_ADS_SITE_ORIGIN = "https://kremisi.com";
export const ADS_CONSENT_EVENT = "kremisi-ads-consent";
export const ADS_CONSENT_GRANTED = "v1-granted";
export const ADS_CONSENT_DENIED = "v1-denied";

// Cookie attribution values are opaque: never decode, normalize, or log them.
export function readRawCookie(cookieHeader = "", name) {
  const prefix = `${name}=`;
  const cookie = cookieHeader.split(";").map((part) => part.trimStart())
    .find((part) => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : undefined;
}

export function hasAdsConsent(cookieHeader = "") {
  return allowsPurpose(readIubendaPreferences(cookieHeader), MARKETING_PURPOSE);
}
