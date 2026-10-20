# Technical QA notes — landing automazioni aziendali

Data: 2026-10-20. Ambito: audit statico e CLI della landing IT/EN e dei componenti condivisi necessari al form e al tracking. Letto AGENTS.md. Nessun codice modificato, nessun build/dev/browser avviato, nessun form o Server Action inviato, nessuna chiamata a provider reali. I test eseguono la logica delle action esclusivamente con adattatori sostituiti da stub (test/openai-ads-contact.test.mjs:9-19,34-41).

## Esito dei controlli

- `npm run lint`: PASS, exit 0; output in `lint.txt`, codice in `lint-exit.txt`.
- `npm test`: PASS, exit 0; 36 test passati, 0 falliti; output in `test.txt`, codice in `test-exit.txt`.
- TypeScript: non applicabile come comando di validazione del progetto. Package senza dipendenza/script TypeScript; configurazione `jsconfig.json`; nessun `.ts`, `.tsx` o `tsconfig*` nel repository (esclusi artefatti/dependencies). Non eseguito `tsc` e nessun pacchetto installato.
- Metadata: titolo/descrizione locali, canonical senza query, alternate IT/EN/x-default, OpenGraph e Twitter presenti (`src/app/[locale]/(contents)/automazioni-aziendali/page.js:17-50`). Base URL dal layout (`src/app/[locale]/layout.js:80-108`). Sitemap include lo slug e alternate (`src/app/sitemap.js:9-35`); robots consente crawling (`src/app/robots.js:3-9`). Asset OG e screenshot WebP esistenti. Verifica statica; output HTML gestito dal principale.
- i18n: 42 chiavi in ciascuno dei due file `messages/automation/{it,en}.json`, nessuna chiave mancante. Namespace unito ai messaggi base in `src/i18n/request.js:11-18`.
- Accessibilità statica: un H1, sezioni con heading identificati, skip link al contatto, CTA con anchor nativi e assenza di button dentro anchor grazie a `isLinkContent`, etichette dei contatti, autocomplete, aria-label del messaggio, aria-busy e regione stato live. Regole focus-visible e reduced-motion presenti. Non certifica contrasto, focus effettivo o lettore di schermo.
- Form: variante automation imposta `service=information`, source allowlisted e campi budget/delivery esclusi. Privacy, dettagli >=5, nome >=2, email e telefono opzionale validati sul server; honeypot e Turnstile precedono invio (`src/components/contact-form/actions.js:54-150`). Invio tramite email di testo, subject normalizzato a singola riga (`src/lib/contact-email.js:5-6,76-95`). Nessuna PII nei nuovi eventi CTA.
- Conversioni: GA solo dopo consenso measurement (`src/lib/analytics.js:7-16`); lead del form solo su successo e non silentDrop (`src/components/contact-form/contact-form.js:128-142`); CAPI solo dopo email accettata (`actions.js:167-176`), consenso browser + cookie marketing + GPC server (`src/server/openai-ads.js:10-29`), email hashata, query/fragment rimossi dalla source URL (`src/server/openai-ads-capi.mjs:19-51`), invio differito e opzionale con errori isolati e timeout. Pixel e CAPI condividono event ID; dedup browser in `src/lib/openai-ads-browser.mjs:115-128`. Test coprono questi contratti con mock. Operatività esterna e configurazione dashboard non verificate.

## Findings

Nessun P0/P1 trovato nell'ambito statico/CLI.

1. **P2 — Il file di esempio non documenta la configurazione Turnstile necessaria.** `.env.example` elenca Resend e Ads ma manca `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `CLOUDFLARE_TURNSTILE_SECRET_KEY`. La prima assenza mostra un avviso e lascia il submit disabilitato (`src/components/turnstile/turnstile.js:54,118-123`; `src/components/contact-form/contact-form.js:399-402`); la seconda rende sempre negativa la verifica server (`src/lib/turnstile.js:9-17`). Un setup basato solo sul file esempio non può completare il form. Raccomandazione: aggiungere i due nomi con placeholder e istruzioni, senza valori segreti.
2. **P3 — La validazione telefono accetta solo punteggiatura.** `src/components/contact-form/actions.js:144-149` usa una allowlist con lunghezza 6-30 senza richiedere cifre; `++++++` passa la stessa regex (controllo Node puro, nessuna action chiamata). Il browser usa `type=tel` senza pattern (`src/components/contact-form/contact-form.js:344-354`). Può quindi arrivare una richiesta con telefono inutilizzabile. Raccomandazione: richiedere un numero plausibile di cifre mantenendo formati internazionali; nessuna necessità di rendere il telefono obbligatorio.

## Presenza configurazione, senza valori

Presente unicamente `.env.example`, tracciato da git; nessun `.env.local`/`.env` rilevato. Nel processo dell'audit risultano assenti: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL_TO`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET_KEY`, `OPENAI_ADS_CONVERSIONS_API_KEY`. Nessun valore letto è stato riportato o salvato nelle evidenze. È un limite dell'ambiente locale e non dimostra configurazione mancante in produzione. CAPI è opzionale; Resend e Turnstile richiedono configurazione valida per verificare consegna reale. Nessun invio reale eseguito.

## Limiti ed evidenze

Questo report non sostituisce verifica HTML, browser responsive, navigazione tastiera, contrasto, prestazioni/Lighthouse, build, configurazione provider e produzione: gestiti dal principale o non autorizzati. Nessuna falsa attestazione di consegna email o conversione ricevuta. File creati soltanto nella cartella audit-evidence.
