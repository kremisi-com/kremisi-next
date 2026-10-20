import { IUBENDA_SITE_ID, IUBENDA_POLICY_ID } from "./cookie-consent.mjs";

// The existing account currently licenses only en-GB. Add languages here via
// deployment config only after enabling them in the iubenda dashboard.
export function getIubendaLanguage(locale) {
  const languages = (process.env.NEXT_PUBLIC_IUBENDA_LANGUAGES || "en-GB").split(",").map((lang) => lang.trim()).filter(Boolean);
  return languages.find((lang) => lang === locale || lang.startsWith(`${locale}-`)) || languages[0] || "en-GB";
}

export function createIubendaConfiguration(locale, onChange, onFailure) {
  const italian = getIubendaLanguage(locale).startsWith("it");
  return {
    siteId: IUBENDA_SITE_ID,
    cookiePolicyId: IUBENDA_POLICY_ID,
    lang: getIubendaLanguage(locale),
    gdprAppliesGlobally: true,
    perPurposeConsent: true,
    purposes: "1,4,5",
    storage: { useSiteId: true },
    preferenceCookie: { expireAfter: 180 },
    askConsentAtCookiePolicyUpdate: true,
    // Newly disclosed marketing must receive a fresh choice from old visitors.
    invalidateConsentBefore: "2026-10-20",
    floatingPreferencesButtonDisplay: false,
    whitelabel: false,
    banner: {
      position: "bottom",
      backgroundOverlay: true,
      closeButtonDisplay: false,
      acceptButtonDisplay: true,
      rejectButtonDisplay: true,
      customizeButtonDisplay: true,
      explicitWithdrawal: true,
      showTitle: false,
      backgroundColor: "#121212",
      textColor: "#ffffff",
      acceptButtonColor: "#ffffff",
      acceptButtonCaptionColor: "#121212",
      rejectButtonColor: "#ffffff",
      rejectButtonCaptionColor: "#121212",
      customizeButtonColor: "#303030",
      customizeButtonCaptionColor: "#ffffff",
      fontSizeBody: "15px",
      acceptButtonCaption: italian ? "Accetta tutti" : "Accept all",
      rejectButtonCaption: italian ? "Rifiuta" : "Reject",
      customizeButtonCaption: italian ? "Personalizza" : "Customize",
      content: italian
        ? 'Usiamo cookie necessari e, con il tuo consenso, strumenti per statistiche e marketing. Puoi accettare, rifiutare o scegliere quali attivare. <details><summary>Come usiamo i dati</summary><p>Le statistiche includono Google Analytics e gli strumenti Vercel. Il marketing include OpenAI Ads e i tag pubblicitari di Google Tag Manager. OpenAI Ads misura visite, progetti visualizzati e richieste di contatto; dopo l’invio di una richiesta, condividiamo anche un hash SHA-256 della tua email per attribuire la conversione. Puoi cambiare scelta da “Preferenze cookie”. Consulta la %{cookie_policy_link}.</p></details>'
        : 'We use necessary cookies and, with your consent, tools for analytics and marketing. You can accept, reject or choose which to enable. <details><summary>How we use data</summary><p>Analytics includes Google Analytics and Vercel tools. Marketing includes OpenAI Ads and advertising tags in Google Tag Manager. OpenAI Ads measures visits, project views and contact requests; after a request is submitted, we also share a SHA-256 hash of your email to attribute the conversion. You can change your choice in “Cookie preferences”. See our %{cookie_policy_link}.</p></details>',
    },
    callback: {
      onReady: onChange,
      onPreferenceExpressed: onChange,
      onStartupFailed: onFailure,
      onFatalError: onFailure,
    },
  };
}
