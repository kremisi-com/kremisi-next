# Landing automazioni — contratti e ownership

## Decisione consolidata

Discovery completata prima dell'implementazione: Next.js App Router (JavaScript), CSS Modules, next-intl EN/IT, FK Grotesk, token di tema globali. Homepage iniziale MainSlider con scroll-lock; seconda hero Overview con tipografia e background coerenti con la campagna. Adattare Overview tramite composizione opzionale senza cambiare la homepage.

Percorsi: `/it/automazioni-aziendali` e `/en/automazioni-aziendali`. Cinque sezioni: hero → problemi/soluzioni → progetto BPMN2Petri verificabile → metodo → contatto. Nessun dato di performance inventato. Nessun nuovo media o servizio esterno.

## Contratti

- `Overview`: slot opzionale per contenuto della campagna, vero H1 visibile senza JS; background e reduced-motion condivisi; rendering predefinito invariato.
- `ContactForm({ locale, variant = "default" })`: `automation` mantiene nome, azienda opzionale, email, telefono opzionale, dettagli, privacy e Turnstile. `service=information` mantiene il contratto server senza imporre budget/tempistiche. Origine allowlisted `automation_landing` aggiunta all'email. Stessa server action e conversione dopo accettazione Resend.
- Namespace `automation`: JSON separati in `messages/automation/{locale}.json`, caricati dal config next-intl esistente. Metadata, canonical, hreflang, OG/Twitter e sitemap per entrambe le lingue.
- CTA: GitButton `isLinkContent` dentro anchor semantico; helper analytics esistente con consenso, nessun PII. Page view tramite layout globale. Vista form solo all'ingresso nel viewport, start una volta per tentativo nella variante; lead escluso in caso di spam/errore.

## Ownership degli agenti

- Design Auditor: `design-audit.md`, nessun codice.
- Conversion Strategist: `conversion-strategy.md`, nessun codice.
- Frontend Builder: cartella route automazioni, Overview JSX/CSS, JSON automation EN/IT, `implementation.md`.
- Orchestratore: form e integrazioni server, GitButton disabled, i18n request config, sitemap, verifiche e documentazione finale.
- QA Auditor indipendente: revisione read-only e `qa-audit.md` dopo implementazione.

## Verifica prevista

ESLint, test Node esistenti e regressioni mirate del contratto form, build Next.js. Nessun TypeScript/typecheck disponibile. Browser desktop/mobile, light/dark, CTA, form, metadata, homepage e pagina contatti. Mancano variabili locali Turnstile/Resend: nessun invio esterno reale e nessun deploy.
