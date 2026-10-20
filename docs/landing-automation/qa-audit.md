# QA indipendente — landing automazioni

Revisione del 20 ottobre 2026, limitata al diff e ai nuovi sorgenti. Letti AGENTS.md, architecture.md, design-audit.md, conversion-strategy.md e implementation.md. Ownership di questo agente: solo questo documento; nessuna modifica al codice.

## Esito della revisione

Revisione statica indipendente completata, inclusi gli ultimi aggiustamenti responsive e del form. Nessun difetto bloccante aperto rilevato. Le verifiche browser sotto riportate sono state eseguite dall'orchestratore; questo agente non ha eseguito la build.

- Route IT/EN e namespace automation coerenti; 42 chiavi equivalenti verificate automaticamente. Metadata con canonical, hreflang IT/EN/x-default, OG/Twitter localizzati; entrambe le URL presenti nella sitemap. Un H1, sezioni etichettate, liste e link semantici, alt tradotto e focus visibile.
- Overview estesa mediante composizione opzionale; il rendering predefinito conserva contenuto e classi. La hero della campagna renderizza il titolo senza attesa dell'animazione GSAP. CSS responsive e reduced-motion presenti.
- Caso BPMN2Petri e relativo asset WebP esistenti verificati nel repository. Copy coerente con projects.json; nessuna metrica, testimonianza o dashboard inventata rilevata.
- Variante form usa lo stesso contratto server, service=information, senza budget/tempistiche obbligatori. Azienda e telefono restano opzionali; privacy, honeypot e Turnstile conservati. Origine accettata tramite allowlist e aggiunta solo all'email.
- Stato invio, disabilitazione nativa del submit, messaggi tradotti e stato persistente aria-live presenti. Il lead viene misurato dopo l'accettazione Resend e viene escluso per spam o errore; CTA e form-view/start riusano helper con consenso senza PII. Test con provider simulati: nessun invio esterno.
- Ultimo diff del form revisionato: `contactFields` applicata solo alla variante automation, intestazione a larghezza completa e quattro campi su due colonne desktop/una mobile. Label persistenti, indicazione dei campi opzionali e placeholder non duplicati; il form standard conserva la propria composizione. Turnstile usa ora `compact` solo nella variante, mentre il default resta `normal`.

## Controlli realmente eseguiti

- `node --test test/openai-ads-contact.test.mjs`: **6/6 superati**. Copertura: successo dopo Resend, nessuna conversione per honeypot/sicurezza/validazione/provider fallito, contratto landing e source allowlist, campi richiesti, consenso e deduplicazione CAPI/Pixel, isolamento degli errori analytics.
- ESLint mirato sui JS modificati, route e test: **superato**.
- ESLint esplicito con `--ext '.jsx'` su Overview e CampaignLink: **superato**. Il comando di default del repository non include questi JSX.
- Script Node: equivalenza delle 42 chiavi IT/EN e presenza dell'headerImage del case study: **superato**.
- Nessuna build, sessione browser, chiamata Resend/Turnstile reale o pubblicazione eseguita da questo agente.
- I test/lint sopra sono stati eseguiti prima degli ultimi aggiustamenti visuali; questi ultimi sono stati riesaminati staticamente. La verifica tecnica della versione finale è svolta dall'orchestratore, senza duplicare qui i comandi.

## Chiusura visuale e dipendenze residue

- CTA mobile: verifica chiusa dall'orchestratore tramite screenshot e misurazioni DOM dopo il fix del builder. A viewport 320px, EN occupa x=16,61–288,38px e IT x=26,66–278,33px, entro l'area utile di 305px; nessun overflow IT/EN rilevato. Revisione statica conferma font della CTA ridotto localmente ai breakpoint mobile senza modificare GitButton condiviso.
- Turnstile `compact` risolve il vincolo di spazio della variante a 320px. Restano non esercitati il challenge del provider e la consegna email reale, dipendenti da credenziali Turnstile/Resend valide; nessun invio reale è stato effettuato.
- Gli ulteriori esiti desktop/mobile, light/dark, homepage/contatti, anchor, metadata renderizzati e build appartengono al report finale dell'orchestratore. Nessuna nuova esecuzione test/lint svolta da questo agente durante la chiusura.
