"use client";

import { useEffect, useRef, useState } from "react";
import { Cookie } from "lucide-react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { COOKIE_CONSENT_EVENT, hasCookiePurpose, MEASUREMENT_PURPOSE, MARKETING_PURPOSE } from "@/lib/cookie-consent.mjs";
import { createIubendaConfiguration, getIubendaLanguage } from "@/lib/iubenda-config.mjs";
import { GOOGLE_ANALYTICS_ID, notifyCookieConsent, syncGoogleConsent } from "@/lib/cookie-consent-browser.mjs";
import styles from "./scripts.module.css";

const SCRIPT_ID = "iubenda-cookie-solution";

export default function Scripts({ locale }) {
  const italian = locale === "it";
  const [permissions, setPermissions] = useState({ analytics: false, marketing: false });
  const [status, setStatus] = useState("loading");
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const loaded = useRef({ analytics: false, marketing: false });

  useEffect(() => {
    let timeout;
    function sync() {
      const ready = !!window._iub?.cs?.api;
      const next = {
        analytics: hasCookiePurpose(MEASUREMENT_PURPOSE),
        marketing: hasCookiePurpose(MARKETING_PURPOSE),
      };
      setStatus(window.__kremisiCmpFailed ? "error" : ready ? "ready" : "loading");
      if (ready) clearTimeout(timeout);
      // Removing a script tag cannot stop an already executed GTM container.
      // Once consent is withdrawn, restart with only the permitted scripts.
      if ((loaded.current.analytics && !next.analytics) ||
          (loaded.current.marketing && !next.marketing)) {
        window.location.reload();
        return;
      }
      loaded.current = { analytics: next.analytics, marketing: next.analytics && next.marketing };
      setPermissions(next);
    }
    function fail() {
      window.__kremisiCmpFailed = true;
      clearTimeout(timeout);
      notifyCookieConsent();
      setStatus("error");
    }
    function update() {
      window.__kremisiCmpFailed = false;
      notifyCookieConsent();
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    const lang = getIubendaLanguage(locale);
    // iubenda's UI is initialized once per document. A locale switch needs a
    // fresh localized UI, while the same native consent cookie is retained.
    if (window._iub?.cs?.api && window._iub.csConfiguration?.lang !== lang) {
      window.location.reload();
      return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
    }
    window._iub ||= [];
    window._iub.csConfiguration = createIubendaConfiguration(locale, update, fail);
    syncGoogleConsent();
    if (!document.getElementById(SCRIPT_ID) && !window._iub.cs?.api) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://cdn.iubenda.com/cs/iubenda_cs.js";
      script.async = true;
      script.onerror = fail;
      document.head.appendChild(script);
    }
    timeout = window.setTimeout(fail, 20000);
    sync();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
    };
  }, [locale, italian]);

  useEffect(() => {
    // Some iubenda plans require their own privacy widget. Enhance that same
    // control, retaining its icon and branding, rather than showing two buttons.
    function decorate() {
      const button = document.querySelector("button.iubenda-tp-btn");
      if (button) {
        const caption = italian ? "Preferenze cookie" : "Cookie preferences";
        button.id = "kremisi-cookie-preferences";
        button.classList.add(styles.button, styles.nativePreferences);
        button.setAttribute("data-cookie-caption", caption);
        button.setAttribute("aria-label", caption);
        button.setAttribute("aria-haspopup", "dialog");
        button.title = caption;
        button.style.setProperty("z-index", "1001", "important");
      }
      setNativeAvailable(!!button);
    }
    decorate();
    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [italian]);

  function openPreferences() {
    const api = window._iub?.cs?.api;
    if (api && !window.__kremisiCmpFailed) {
      api.openPreferences();
    } else if (status === "error") {
      window.location.reload();
    }
  }

  return (
    <>
      <div className={styles.preferences}>
        {!nativeAvailable && <button type="button" className={styles.button} onClick={openPreferences}
          aria-haspopup="dialog" aria-describedby={status !== "ready" ? "cookie-preferences-status" : undefined}>
          <Cookie size={16} aria-hidden="true" />
          {italian ? "Preferenze cookie" : "Cookie preferences"}
        </button>}
        {status !== "ready" && (
          <span id="cookie-preferences-status" role="status" className={styles.status}>
            {status === "error"
              ? (italian ? "Preferenze non disponibili. Premi per riprovare." : "Preferences unavailable. Press to retry.")
              : (italian ? "Caricamento preferenze…" : "Loading preferences…")}
          </span>
        )}
      </div>
      {permissions.analytics && (
        <>
          <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
          <Analytics />
          <SpeedInsights />
        </>
      )}
      {/* The remote container may contain both analytics and marketing tags. */}
      {permissions.analytics && permissions.marketing && <GoogleTagManager gtmId="GTM-5LL6LJR" />}
    </>
  );
}
