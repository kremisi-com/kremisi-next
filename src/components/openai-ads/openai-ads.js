"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONSENT_EVENT, ADS_CONSENT_GRANTED, ADS_CONSENT_DENIED } from "@/lib/openai-ads-config.mjs";
import { getAdsConsent, setAdsConsent, trackOpenAIAdsPage, trackOpenAIAdsContent } from "@/lib/openai-ads-browser.mjs";
import styles from "./openai-ads.module.css";

export default function OpenAIAds({ locale }) {
  const pathname = usePathname();
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);
  const isItalian = locale === "it";

  useEffect(() => {
    function sync() {
      const consent = getAdsConsent();
      setChoice(consent || "unset");
      trackOpenAIAdsPage(pathname);
    }
    sync();
    window.addEventListener(ADS_CONSENT_EVENT, sync);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, sync);
  }, [pathname]);

  function choose(granted) {
    setAdsConsent(granted);
    setOpen(false);
  }

  const hasChoice = choice === ADS_CONSENT_GRANTED || choice === ADS_CONSENT_DENIED;
  return (
    <>
      <button type="button" className={styles.preferences} onClick={() => setOpen((value) => !value)}
        aria-expanded={open || (!!choice && !hasChoice)} aria-controls="openai-ads-preferences">
        {isItalian ? "Preferenze pubblicità" : "Ad preferences"}
      </button>
      {(open || (!!choice && !hasChoice)) && (
        <section id="openai-ads-preferences" className={styles.panel} aria-labelledby="openai-ads-title">
          <h2 id="openai-ads-title">{isItalian ? "Misurazione pubblicitaria" : "Ad measurement"}</h2>
          <p>{isItalian
            ? "Con il tuo consenso, usiamo cookie OpenAI Ads per misurare visite, progetti visualizzati e richieste di contatto. Dopo l’invio, condividiamo anche un hash della tua email per attribuire la richiesta. Puoi rifiutare o cambiare scelta in qualsiasi momento."
            : "With your consent, we use OpenAI Ads cookies to measure visits, project views and contact requests. After submission, we also share a hash of your email to attribute the request. You can decline or change your choice at any time."}</p>
          <a href="https://www.iubenda.com/privacy-policy/87027585/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
          <div className={styles.actions}>
            <button type="button" onClick={() => choose(false)}>{isItalian ? "Rifiuta" : "Decline"}</button>
            <button type="button" onClick={() => choose(true)}>{isItalian ? "Accetta" : "Accept"}</button>
          </div>
        </section>
      )}
    </>
  );
}

export function OpenAIAdsContentView({ id, name }) {
  const pathname = usePathname();
  const measuredPath = useRef(null);
  useEffect(() => {
    function measure() {
      if (measuredPath.current === pathname) return;
      if (trackOpenAIAdsContent(id, name)) measuredPath.current = pathname;
    }
    measure();
    window.addEventListener(ADS_CONSENT_EVENT, measure);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, measure);
  }, [id, name, pathname]);
  return null;
}
