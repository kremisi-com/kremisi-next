# Audit QA, UX e conversione — Automazioni aziendali

Data: 20 ottobre 2026, Europe/Rome. Pagina: <https://kremisi.com/it/automazioni-aziendali>.

## Esito

La landing è una buona base per un pilota ChatGPT Ads: offerta comprensibile, continuità con l’annuncio, identità Kremisi riconoscibile e form pertinente. L’audit ha rilevato tre gruppi di problemi P1 nella navigazione/accessibilità, corretti localmente e verificati nuovamente. Nessun P0 osservato. Restano miglioramenti P2/P3 e limiti di verifica infrastrutturale descritti sotto.

**La versione corretta non è stata pubblicata.** Il controllo della pagina live è distinto dal collaudo della build locale. Non sono state inviate richieste commerciali, email o conversioni reali. L’efficacia commerciale non può essere dedotta da un audit: manca un campione di traffico e lead qualificati.

## Metodo ed evidenze

- Agente principale: orchestrazione, Playwright, fix, regressioni e report. Tre subagenti indipendenti: [UX visiva](audit-evidence/visual-notes.md), [QA tecnica](audit-evidence/technical-notes.md), [conversione/contenuto](audit-evidence/before/conversion-notes.md). Le loro note iniziali sono integrate/superate dalle verifiche finali di questo report.
- Windows, Node 25.2.1, Next 16.2.4; Chromium headless **145.0.7632.6** pilotato da Playwright disponibile nella cache dell’ambiente. Nessuna dipendenza applicativa aggiunta.
- Progetto avviato in sviluppo; screenshot e regressioni principali eseguiti sulla **build di produzione locale**, `http://127.0.0.1:3101`. Server dev separato `:3100` esclusivamente per le simulazioni del form.
- Viewport: 1440×900, 1280×800, 768×1024, 390×844, 320×568. Aggiunti tema chiaro desktop/mobile e `prefers-reduced-motion` mobile. Otto scenari landing prima/dopo, più tre scenari homepage prima/dopo.
- Per ogni viewport: screenshot iniziale con CMP, pagina intera dopo “Reject”, DOM/overflow, immagini, console/rete e axe-core WCAG A/AA. Dopo i fix anche screenshot hero senza banner. Screenshot viewport della sezione Soluzioni distinguono difetti reali da artefatti delle catture full-page.
- Tutte le richieste non GET/HEAD intercettate e bloccate. Nei test form, solo due POST locali sono stati **soddisfatti da risposte sintetiche dentro Playwright**, senza inoltrarli al server. Usati dati fittizi con dominio `example.invalid`.
- [Risultati browser prima](audit-evidence/before/results.json), [dopo](audit-evidence/after/results.json), [interazioni prima](audit-evidence/before/interactions.json), [dopo](audit-evidence/after/interactions.json), [form e tracking simulati](audit-evidence/after/mock-form.json).
- Esito finale degli harness: **49/49 controlli di interazione e 21/21 controlli form/tracking simulati passano**, oltre ai 36 test del repository. Le due risposte di invio sono entrambe mock intercettati; nessuna Server Action commerciale è stata eseguita.
- [Controllo live desktop](audit-evidence/live-check.json): landing e homepage HTTP 200. [Controllo live mobile](audit-evidence/live-form-check.json): metadata corretti, nessuna immagine rotta/pageerror, Pixel non richiesto dopo rifiuto.

## Matrice responsive finale

| Viewport | HTTP | Overflow orizzontale | Immagini rotte | Layout/interazione | Screenshot full-page |
|---|---|---|---|---|---|
| Desktop 1440×900 | 200 | Nessuno | 0 | Hero, griglie e CTA corretti | [Desktop](audit-evidence/after/desktop-full.png) |
| Laptop 1280×800 | 200 | Nessuno | 0 | Gerarchia e allineamenti corretti | [Laptop](audit-evidence/after/laptop-full.png) |
| Tablet 768×1024 | 200 | Nessuno | 0 | Menu mobile e colonne impilate corretti | [Tablet](audit-evidence/after/tablet-full.png) |
| Mobile 390×844 | 200 | Nessuno | 0 | Testi e CTA leggibili; ingombro footer da migliorare | [Mobile](audit-evidence/after/mobile-full.png) |
| Mobile piccolo 320×568 | 200 | Nessuno | 0 | CTA iniziale richiede scroll; footer invasivo, P2 | [320 px](audit-evidence/after/small-mobile-full.png) |

Il controllo non usa solo `scrollWidth`: sono stati cercati anche elementi con bounding box fuori viewport, perché `overflow-x:hidden` potrebbe nascondere errori. Nessun elemento di contenuto risultato fuori larghezza. Il form si impila senza tagli; immagini e icone caricate; tre video riproducibili, con pausa/ripresa e arresto quando fuori viewport. Con movimento ridotto: zero animazioni CSS attive rilevate e nessun `src` MP4 caricato.

## Valutazione tecnica

- **Lint:** passa prima/dopo. [Output finale](audit-evidence/lint-after.txt).
- **Test esistenti:** 36/36 prima/dopo. Esteso un caso di validazione telefono nello stesso test. [Output finale](audit-evidence/test-after.txt).
- **Build:** passa prima/dopo, 82 pagine generate. [Build iniziale](audit-evidence/build.log), [finale](audit-evidence/build-after.log).
- **TypeScript:** repository JavaScript con `jsconfig`; nessun `.ts`/`.tsx` o `tsconfig` applicativo da controllare con un progetto `tsc` separato. Il passaggio interno di Next non equivale a una validazione tipizzata dei sorgenti JS.
- **Console/rete:** nessun `pageerror`, nessuna risposta HTTP ≥400 nei render locali della landing. Tre errori console per scenario corrispondono ai POST iubenda volutamente bloccati dal test. Alcuni `ERR_ABORTED` riguardano prefetch/range video interrotti; immagini valide e video `readyState=4`. Questi eventi non sono conteggiati come guasti dell’applicazione.
- **Link:** sette destinazioni interne distinte, incluse BPMN2Petri e Casa Palmi, rispondono con esito positivo seguendo gli eventuali redirect. Anche `robots.txt`, sitemap e immagine OG disponibili. CTA contatto e progetto raggiungono gli anchor corretti; switch IT→EN conserva la landing. Navigazione navbar e chiusura dell’overlay di transizione verificate.
- **Metadata:** un H1, `lang=it`, title e description specifici. Canonical renderizzato `https://kremisi.com/it/automazioni-aziendali`; hreflang IT/EN/x-default coerenti; OG/Twitter presenti nei sorgenti. Nessun `noindex` osservato. Non è una verifica della presenza effettiva nell’indice Google.
- **Accessibilità:** corretti nomi accessibili, semantica dei link e menu chiuso nel tab order. Dopo: zero violazioni automatiche nei due scenari chiari; nel tema scuro resta la sola regola `color-contrast`, sette nodi minori. Axe segnala anche casi di contrasto da verificare manualmente: il risultato non certifica conformità completa. Nessun collaudo con screen reader o dispositivi fisici effettuato.

## UX e confronto visivo con la homepage

Confronto effettivo dei render [homepage desktop/overview](audit-evidence/after/home-overview-desktop-hero.png), [home mobile](audit-evidence/after/home-mobile-hero.png) e landing. FK Grotesk, corsivi, palette cremisi/nero, sfondo sfumato, pill CTA, collage clienti e fascia video costruiscono una continuità riconoscibile. I fix interessano componenti condivisi; contenuti e struttura della homepage non sono stati modificati. Le catture homepage dopo il fix non mostrano regressioni visive della navigazione.

La hero comunica subito servizio e beneficio. Titoli grandi, righe numerate e griglie scandiscono bene il contenuto; la sezione Soluzioni descrive problemi concreti e il metodo chiarisce la collaborazione. La lunghezza mobile è elevata (circa 7.910 px a 390 px), ma CTA ripetute e anchor consentono di raggiungere il form senza attraversare ogni sezione.

Le parti meno convincenti sono il caso BPMN2Petri, molto tecnico per un imprenditore, e la fascia finale con lavori poco collegati al tema automazioni. La recensione Casa Palmi sostiene la fiducia nell’agenzia, ma il suo testo riguarda soprattutto il sito. Sono valutazioni UX/CRO, non prove di un calo delle conversioni.

Riutilizzo consigliato: mantenere `Overview`, `GitButton`, `SocialProof` in variante statica e `Testimonials` featured, già derivati dalla home. Per una prova più pertinente si possono valutare i progetti/testimonial esistenti Vecchi360 o Gamelia **solo dopo aver verificato quali aspetti di automazione siano documentabili**. La struttura delle righe di `Services` è un riferimento disponibile per esempi più concreti. Non serve introdurre una nuova libreria o rifare la landing.

## Simulazione del visitatore proveniente dall’annuncio

Annuncio: “Meno lavoro manuale” / “Software e automazioni per la tua azienda.”

| Domanda | Valutazione motivata |
|---|---|
| Si capisce subito cosa offre Kremisi? | Sì dopo la scelta cookie: H1 riprende l’annuncio; descrizione specifica software, collegamento strumenti e AI per PMI. La CMP occupa gran parte del primo schermo piccolo. |
| Sono chiari i problemi risolti? | Sì: reinserimento dati, software standard inadatto, informazioni difficili da usare. |
| Benefici concreti? | Abbastanza: esempi operativi verificabili; il vantaggio in tempo rimane qualitativo. Non ci sono risparmi numerici da attribuire senza evidenze. |
| CTA visibili e comprensibili? | “Parliamo del tuo processo” è coerente e ripetuta. A 320×568 serve scroll; “Parliamone” finale è meno specifica. |
| Fiducia sufficiente? | Loghi, progetto reale, recensione nominativa e contatti forniscono basi credibili. Più debole la prova di risultati specifici dell’automazione. Autenticità indipendente delle recensioni non verificata. |
| Form semplice? | Sì: messaggio, nome, email e privacy obbligatori; azienda/telefono opzionali; niente budget/tempistiche sulla variante automation. Descrizione del processo aiuta la qualificazione. |
| Distrazioni? | Navbar, WhatsApp/email fissi, cookie widget e fascia portfolio competono con il contatto principale, soprattutto su schermi bassi. Da valutare con dati. |
| Convince chi non conosce Kremisi? | L’offerta è comprensibile e professionale. Migliorabile il collegamento tra prova sociale, problemi operativi e cosa accade dopo l’invio. |

## Registro problemi per severità

Le priorità indicano impatto e urgenza, non la severità testuale assegnata da axe. “Oggettivo” significa riprodotto; “UX” significa raccomandazione da validare. I P2/P3 di design/contenuto sono solo proposti, come richiesto.

### P0 — Bloccanti

Nessuno osservato. L’invio reale e la ricezione delle conversioni non sono certificati: sono limiti della verifica, non P0 inventati.

### P1 — Importanti, tutti corretti localmente

| ID / tipo | Descrizione ed evidenza verificabile | File coinvolti | Soluzione e retest |
|---|---|---|---|
| P1-01 — Oggettivo | Controlli icona senza nome: tema e portfolio desktop; tema/menu mobile; link WhatsApp mobile. Axe iniziale `button-name` (2 nodi) e `link-name` (1 nodo) per scenario. Vedi `before/desktop.json`, `before/mobile.json`. | `src/components/navbar/navbar.js:60,124`, `navbar/theme-toggler.js:28`, `footer/footer.js:83`, `messages/{it,en}.json` | Aggiunti nomi accessibili localizzati; menu con `aria-expanded`/`aria-controls`; WhatsApp nominato. Regole assenti in tutti gli otto scenari finali. |
| P1-02 — Oggettivo | `Button` generava `<a><button>…</button></a>`: controlli interattivi annidati e duplicazione nel percorso da tastiera. `before/interactions.json`: check di semantica fallisce a tutte e tre le larghezze testate. | `src/components/button/button.js:13`, `button.module.css` | Un singolo link o pulsante, stesso stile, duplicato animato nascosto agli screen reader, focus visibile. Zero `nav a button` finali; navigazione e screenshot homepage verificati. |
| P1-03 — Oggettivo | Il menu mobile chiuso rimaneva raggiungibile con Tab; Esc non lo chiudeva. Riprodotto a 390 e 320 px in `before/interactions.json`. | `src/components/navbar/navbar.js:30,133`, `navbar.module.css` | `inert`, `aria-hidden`, visibilità CSS, handler Esc con ritorno del focus al trigger. Entrambi i test passano a 390/320; apertura da tastiera e controlli tema/lingua ancora operativi. |

### P2 — Miglioramenti

| ID / tipo / stato | Descrizione ed evidenza | File coinvolti | Soluzione proposta |
|---|---|---|---|
| P2-01 — Oggettivo, aperto | Nel tema scuro sei numeri decorativi e badge “Clienti” hanno contrasto 4,03:1 contro 4,5:1 per testo piccolo. Numeri `aria-hidden`, contenuto principale leggibile. `after/desktop.json` → axe; stesso risultato nelle altre larghezze scure. | Landing `page.module.css:168`; `src/components/social-proof/social-proof.module.css:119,337` | Aggiungere una variante del token per testo piccolo sullo scuro o usare il foreground; conservare il cremisi per accenti. Richiede scelta visiva; non applicata. |
| P2-02 — Oggettivo UX, aperto | A 320×568 footer/email/WhatsApp/cookie control occupano il fondo e attenuano parte della descrizione; CTA a y=540,6–598,6. Contenuto leggibile scorrendo. [Hero 320](audit-evidence/after/small-mobile-hero.png), [Soluzioni 390](audit-evidence/after/interaction-390-solutions.png). | `src/components/footer/footer.module.css`; `src/components/scripts/scripts.module.css`; `src/components/overview/overview.module.css` | Valutare footer più compatto o statico sulla landing/viewport bassi, coordinando i widget. Evitare una modifica globale alla home senza un confronto dedicato. |
| P2-03 — Oggettivo UX/config esterna, aperto | CMP in inglese su route italiana; a 320×568 copre quasi tutta la hero al primo accesso. Rilevata anche live e sulla home. [Primo accesso 320](audit-evidence/after/small-mobile-initial.png), `live-form-check.json` → `cmpLanguage=en-GB`. | `src/lib/iubenda-config.mjs`; piano/configurazione iubenda | Abilitare l’italiano nel piano/account e poi configurare `NEXT_PUBLIC_IUBENDA_LANGUAGES`. Valutare densità del banner mantenendo scelte chiare. Non modificato l’account esterno. |
| P2-04 — UX/CRO, aperto | BPMN/reti di Petri/analisi formale sono gergo tecnico per il pubblico dell’annuncio; il testo non espone un prima/dopo operativo facilmente trasferibile alla PMI. [Caso nel render desktop](audit-evidence/after/desktop-full.png). | `messages/automation/it.json` → `case`; landing `page.js` | Spiegare input, attività automatizzata e output in termini pratici, usando soltanto fatti documentati; mantenere il dettaglio tecnico nel progetto. |
| P2-05 — UX/CRO, aperto | La recensione Casa Palmi parla di un sito moderno; i video di chiusura mostrano altri lavori. Provano esperienza, con pertinenza limitata al beneficio “meno lavoro manuale”. | `src/components/testimonials/testimonials.jsx`; landing `page.js`; `videos-cta/videos-cta.jsx` | Valutare prove esistenti più vicine ad integrazioni/processi, verificandone i fatti. Contestualizzare i lavori o ridurre la chiusura nella variante campagna. Non cambiate testimonianze né inventati risultati. |
| P2-06 — UX/CRO, aperto | CTA e testo invitano a descrivere il processo, ma prima dell’invio non spiegano con precisione il seguito; la nota di risposta della form generica non appare nella variante automation. | `src/components/contact-form/contact-form.js`; `messages/automation/it.json` | Definire con il team il prossimo passo effettivo e comunicarlo vicino al form. Eventuali tempi/gratuità vanno confermati commercialmente, non aggiunti dall’audit. |
| P2-07 — Oggettivo prestazioni, aperto | I tre poster WebP della chiusura vengono richiesti già sopra la piega: 319.418 byte di payload, anche se gli MP4 sono differiti. Evidenza `after/performance.json` → `resources`. | `src/components/videos-cta/videos-cta.jsx` | Caricare i poster vicino all’ingresso della sezione con dimensioni responsive. Valutare anche varianti mobile dei video (~8,1 MB di sorgenti totali). Nessun asset modificato; eventuale ottimizzazione futura deve seguire AGENTS.md. |
| P2-08 — Oggettivo tecnico, corretto | `.env.example` non documentava le due chiavi Turnstile; un nuovo ambiente poteva avviarsi con form disabilitato. Evidenza diff e note tecniche. | `.env.example:7` | Aggiunti placeholder vuoti e distinzione chiave pubblica/segreto server. Nessun segreto inserito né controllo antispam aggirato. |
| P2-09 — Oggettivo tecnico di cattura, corretto | L’overlay di transizione fuori viewport appariva come rettangolo cremisi nelle catture full-page/elemento. Le screenshot viewport scorse dimostrano che non copriva le Soluzioni durante l’uso normale: non classificato come blocco utente. | `src/context/transition-context/transition-context.module.css:2` | `visibility:hidden` inattivo con ritardo coerente con l’uscita. Catture finali pulite; completamento della transizione dopo navigazione testato. |

### P3 — Rifiniture

| ID / tipo / stato | Descrizione ed evidenza | File coinvolti | Soluzione |
|---|---|---|---|
| P3-01 — Oggettivo tecnico, corretto | La regex telefono accettava `++++++`, composto solo da simboli. | `src/components/contact-form/actions.js:147`; `test/openai-ads-contact.test.mjs` | Richieste almeno sei cifre oltre al formato già previsto. Caso di regressione passa; telefono resta opzionale. |
| P3-02 — Oggettivo UX/accessibilità, corretto | Il messaggio era obbligatorio senza indicazione visibile coerente con nome/email. | `src/components/contact-form/contact-form.js:280` e CSS associato | Label esplicita collegata alla textarea e asterisco, conservando tipografia e campi esistenti. Form browser e screenshot ricontrollati. |
| P3-03 — UX, aperto | CTA finale “Parliamone” e voce navbar “Contatti” sono meno specifiche del percorso dedicato; loghi volutamente attenuati possono risultare poco riconoscibili. | Landing `page.js`; navbar; `SocialProof` CSS | Valutare label finale coerente, contatto campagna nella navbar ed enfasi dei loghi. Sono preferenze da validare, non difetti di funzionamento. |

## Form e tracciamento

Validazione browser reale: campi obbligatori vuoti invalidi, email malformata rifiutata, azienda/telefono vuoti consentiti. Tutte le CTA contatto e progetto funzionano anche da tastiera. I test server esistenti esercitano il codice reale dell’action con provider sostituiti: privacy, lunghezze, email, telefono, honeypot, sicurezza e rifiuto email non generano conversioni.

Le [simulazioni browser](audit-evidence/after/mock-form.json) verificano: CAPTCHA fittizio valido/scaduto/non disponibile; invio vuoto fermato; stato pending e blocco duplicati; conferma/reset dopo successo; errore inline con dati conservati e token da rinnovare. Le risposte RSC vengono prodotte dal test, non dal backend reale. Le [catture successo](audit-evidence/after/mock-form-success.png), [errore](audit-evidence/after/mock-form-error.png) e [sicurezza indisponibile](audit-evidence/after/mock-form-security-unavailable.png) sono evidenze di questi scenari simulati, non di consegna commerciale.

Tracciamento presente: GA `automation_cta_click` con placement, `view_contact_form`, `contact_form_start`, `generate_lead`; OpenAI Pixel/CAPI `lead_created`, stesso ID server per deduplica, invio dopo accettazione email, consenso verificato e URL ripulito. Confermati nei test del repository. Nel browser con CMP/SDK sostituiti: eventi funnel presenti, un lead soltanto dopo successo simulato, zero dopo errore. Nessun SDK di misura ha ricevuto i test. Su pagina live con rifiuto non sono osservate richieste Pixel.

**Limiti:** il locale non contiene chiavi Turnstile/Resend/CAPI e rende il form indisponibile con fallback email: comportamento atteso, non prova di guasto live. Il sito live carica Turnstile, ma i POST del challenge sono bloccati dal perimetro read-only; l’alert ottenuto in quel test non dimostra un errore della configurazione reale. Non verificati recapito email, reputazione deliverability, ricezione/deduplica nel pannello Ads o configurazione del container GTM remoto. Non è stata verificata la classificazione commerciale dei lead. Un evento tecnico di invio accettato non equivale a un contatto qualificato.

## Prestazioni e Core Web Vitals

[Sei misure ripetute](audit-evidence/after/performance.json) sulla produzione locale, contesti nuovi/cache browser disabilitata, primo accesso con CMP. Desktop senza throttling; mobile 390×844 con CPU 4×, RTT 150 ms, download 1,6 Mbps/upload 750 Kbps. La prossimità del server locale non rappresenta rete/TTFB della produzione; CAPTCHA e misurazione effettivi non sono inclusi. Queste sono misure di laboratorio, non un punteggio Lighthouse o dati CrUX.

| Profilo | LCP tre run | LCP mediano | CLS massimo osservato prima dell’interazione | Massima latenza eventi campionati |
|---|---|---|---|---|
| Desktop | 536 / 240 / 236 ms | 240 ms | 0,00020 | 24 ms |
| Mobile simulato | 1.800 / 1.792 / 1.800 ms | 1.800 ms | 0,00140 | 32 ms |

LCP rilevato su H1 desktop e descrizione mobile. Nessun MP4 richiesto prima dello scroll; i tre poster sono invece immediati (P2-07). Risorse misurate circa 836 KB desktop / 803 KB mobile, escluso documento HTML e con possibili limiti di Resource Timing sulle terze parti. Le latenze campionate **non sono un INP rappresentativo** dell’intero ciclo di visita.

LCP e CLS del laboratorio sono favorevoli. Per dichiarare il superamento dei Core Web Vitals servono dati sul campo al 75° percentile, inclusa INP: [riferimento ufficiale Web Vitals](https://web.dev/articles/vitals), [metodologia CLS](https://web.dev/articles/cls). Dati reali non acquisiti in questo audit; nessuna certificazione CWV attribuita alla pagina live.

## Riproduzione

Script conservati in `scripts/audit-automation*.mjs`. Il runtime Playwright e Chromium sono esterni alle dipendenze del sito. Nell’ambiente usato:

```powershell
$env:AUDIT_PLAYWRIGHT = 'C:/Users/Andrea/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'
$env:AUDIT_CHROMIUM = 'C:/Users/Andrea/AppData/Local/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-win64/chrome-headless-shell.exe'
$env:AUDIT_PHASE = 'after'
# In terminale separato: npm run build; npm run start -- --hostname 127.0.0.1 --port 3101
node scripts/audit-automation.mjs
node scripts/audit-automation-interactions.mjs
node scripts/audit-automation-performance.mjs
# Solo per simulazioni: avviare un dev server separato :3100 con
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=audit-mocked-site-key, senza credenziali provider.
node scripts/audit-automation-form.mjs
```

I percorsi delle cache vanno adattati su un altro ambiente. L’harness blocca tutte le scritture; quello del form rifiuta basi diverse da localhost. Nessuna dipendenza, immagine portfolio, homepage o produzione modificata per installare strumenti QA.

## Readiness per ChatGPT Ads

**Versione locale corretta: candidata a un pilota controllato. Sito live: nessun via libera incondizionato da questo audit.** I P1 corretti devono essere rilasciati con un’attività separata; non sono già online. Offerta, pertinenza con l’annuncio, responsive e percorso al form sono sufficientemente solidi per sperimentare. Prima di investire budget significativo serve verificare in un ambiente autorizzato configurazione antispam, recapito e ricezione delle conversioni con un metodo di test che non produca lead commerciali; successivamente valutare qualità dei contatti e dati CWV sul campo. CMP italiana, footer mobile e prova specifica di automazione sono i miglioramenti prioritari, mantenuti come proposte.
