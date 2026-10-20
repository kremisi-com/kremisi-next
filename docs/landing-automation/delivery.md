# Consegna — landing automazioni aziendali

Implementata e pronta per revisione locale. Nessun deploy, nuova dipendenza, modifica di segreti o invio reale di email/conversioni.

## URL e struttura

- Italiano: `/it/automazioni-aziendali`.
- Inglese: `/en/automazioni-aziendali` (anche il toggle lingua mantiene lo slug).
- Anteprima della build finale: `http://127.0.0.1:3001/it/automazioni-aziendali` finché il processo locale resta attivo.
- Sezioni: hero → problemi e soluzioni accoppiati → caso BPMN2Petri → metodo in tre passi → contatto.

## Scelte e componenti

Overview riusata tramite slot opzionale: sfondo, font e animazioni coerenti con la homepage; H1 della landing visibile già nell'HTML server, senza dipendere da GSAP. MainSlider resta nel suo contesto portfolio con scroll-lock. Riusi: Navbar/Footer globali, Overview, GitButton, ContactForm, Turnstile, server action, Resend, consenso e analytics esistenti.

Nuovi elementi: pagina server e CSS Module; piccolo CampaignLink per eventi CTA senza PII; namespace automation IT/EN. Nessun nuovo asset frontend: screenshot autentico BPMN2Petri in WebP esistente, Next/Image responsive e lazy sotto la hero, dimensioni verificate 1440×960.

ContactForm espone `variant="automation"`: nome, email e dettagli richiesti, azienda e telefono opzionali, privacy richiesta. Rimangono honeypot e Turnstile (compact nella variante per viewport stretti), errori e successo inline, stato pending e disabled nativo. Origine `automation_landing` accettata tramite allowlist nell'email; nessun contenuto del modulo nei nuovi eventi CTA. Vista form al viewport e start deduplicato; lead solo dopo Resend, escluso per spam/errori, con il flusso Pixel/CAPI e consenso già presenti.

## Verifiche realmente eseguite

| Controllo | Esito |
| --- | --- |
| `pnpm lint` | Superato |
| `pnpm exec eslint src --ext .js,.jsx` | Superato; inclusi i JSX ignorati dal comando standard |
| ESLint mirato dopo ultimo intervento sul form | Superato |
| `pnpm test` | 36/36, inclusi due nuovi test su contratto landing, source allowlist, campi richiesti e assenza di conversioni per errori |
| `pnpm build` sulla versione finale | Superato; route automazioni inclusa, 82 pagine generate |
| `git diff --check` | Superato; solo avvisi Git di normalizzazione LF/CRLF |
| HTTP IT/EN e sitemap | 200; un H1 server, canonical corretto, origine form e entrambe le URL in sitemap |
| Browser build locale produzione | IT/EN, canonical/hreflang, anchor contatto/caso, immagine caricata e font caricati |
| Responsive | 320×740, 390×844, 768×1024, 1280×720/900 e 1440×1000 ispezionati; nessun overflow orizzontale rilevato |
| Tema | Hero e caso studio verificati in light/dark; form e focus verificati |
| Form | Etichette persistenti, email non valida rilevata dal browser, campi richiesti corretti; disabled e fallback email con configurazione assente |
| Regressioni | Homepage slider→Overview e form contatti standard (Sviluppo abilita budget/tempistiche) verificati nel browser |
| Console finale | Nuova tab sulla build finale: nessun warning/errore; nessuno script OpenAI/Google caricato con consenso rifiutato |
| QA indipendente | Report chiuso senza difetti aperti; ownership e risultati in qa-audit.md |

Il repository usa JavaScript e non espone uno script typecheck dedicato; eseguiti i controlli effettivi di Next durante build, senza dichiarare un `tsc` separato. Reduced-motion verificato nel CSS; nessuna emulazione OS del relativo media query eseguita. Nessun audit Lighthouse o verifica legale della policy dichiarato.

La prova browser a 320px ha evidenziato una CTA tagliata; corretta con tipografia mobile scoped. Misure finali IT: x26.66→278.33; EN: x16.61→288.38 dentro viewport 320px/area utile305px. Corretta inoltre l'intestazione del form desktop perché occupi una riga completa prima delle due colonne dei campi.

## Dipendenze residue

Nessun `.env.local` presente: mancano `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET_KEY` e configurazione Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL_TO`). Nessun valore creato o modificato. L'invio e la conversione server sono verificati con provider simulati; Turnstile e consegna reale vanno esercitati in un ambiente configurato. Anche la verifica di ricezione Pixel/CAPI sui pannelli esterni resta fuori dalla prova locale; il flusso esistente è coperto dai test.

## File di implementazione

Nuovi:
- `src/app/[locale]/(contents)/automazioni-aziendali/page.js`
- `src/app/[locale]/(contents)/automazioni-aziendali/page.module.css`
- `src/app/[locale]/(contents)/automazioni-aziendali/campaign-link.jsx`
- `messages/automation/it.json`
- `messages/automation/en.json`

Modificati:
- `src/components/overview/overview.jsx`
- `src/components/overview/overview.module.css`
- `src/components/contact-form/contact-form.js`
- `src/components/contact-form/contact-form.module.css`
- `src/components/contact-form/actions.js`
- `src/components/git-button/git-button.js`
- `src/components/turnstile/turnstile.js`
- `src/lib/contact-email.js`
- `src/i18n/request.js`
- `src/app/sitemap.js`
- `test/openai-ads-contact.test.mjs`

Documentazione operativa in questa cartella: design-audit.md, conversion-strategy.md, architecture.md, implementation.md, qa-audit.md e questo documento. Anteprime in screenshots/: desktop-dark.png, desktop-light.png, mobile-dark.png. Sono evidenze QA, non asset pubblicati nel frontend.
