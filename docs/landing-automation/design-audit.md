# Design audit — automazioni aziendali

Audit read-only del codice esistente, 20 ottobre 2026. Ownership: solo questo report. Nessuna verifica browser eseguita da questo agente.

## Risultati

- Stack: Next.js App Router 16, React 19, CSS Modules con globali, next-intl (it/en), next-themes; GSAP/ScrollTrigger/SplitType e Framer Motion già installati. `src/app/[locale]/layout.js` compone Navbar, Footer, ThemeProvider, provider i18n e analytics.
- Identità effettiva: fondo nero quasi assoluto, testi bianchi, accento cremisi; alternativa light reale. Token in `src/app/globals.css`: `--background` (#070707 o #fff), `--foreground` (#fff o #070707), `--primary` (#dc143c), `--box-bg` (bianco/nero al 10%). Riutilizzare queste variabili senza nuove palette.
- Font principale FK Grotesk Trial locale, definito in `src/app/fonts.css`, pesi 100/300/400/700/900. Heading globali 400; sezioni moderne come Services usano 600, tracking -0.02em. Mono/SemiMono e FKDisplay disponibili ma non necessari. Schibsted viene caricato dal layout ma non è il font visuale principale.
- Scala rem globale non standard, intorno a 8–10px: non supporre 1rem=16px. Breakpoints globali 1920/1620/768px; componenti moderni anche 1400/1024px. Per body copy leggibile usare le misure già verificate delle sezioni (es. headerDescription 18px), clamp in px per hero/mobile.
- Container globali: `.page-content` max 1200px, padding 150px 50px, mobile 130px 20px. Homepage Services: padding 120px 10vw; max header 1800px/lista 1400px; mobile 80px 5vw. Linguaggio editoriale: grandi titoli, molto spazio, eyebrow uppercase con trattino cremisi, numeri 01/02, righe sottili anziché griglie SaaS onnipresenti.

## Homepage e hero

- `src/app/[locale]/home-client.js` apre `MainSlider` fullscreen, scena portfolio animata che blocca lo scroll del documento e deve transizionare verso Overview. Non è una hero commerciale parametrizzabile; importarla introdurrebbe gesture, portfolio esteso e lifecycle non utili al contatto.
- `src/components/overview/overview.jsx` e `.module.css` sono il riferimento migliore: hero tipografica centrata, 100svh, FK Grotesk uppercase, parola in italic/cremisi, sfondo con blob sfocati e noise SVG inline. Mobile alleggerisce a un blob statico e supporta reduced-motion nello sfondo.
- Limiti del riuso diretto Overview: namespace copy fisso `overview`, assenza CTA/description in markup, wrapper `RevelatingText` che produce un `<p>` invece di H1. Preferibile estensione minima tramite props compatibili o estrazione/composizione del background esistente. Mantenere rendering homepage predefinito invariato.
- `RevelatingText` (`src/components/revelating-text/revelating-text.js` + CSS) nasconde il testo prima di JS e anima parole con GSAP; non include branch reduced-motion. Non rendere H1 o CTA essenziali dipendenti da questa animazione senza fallback. Possibile riuso solo dopo estensione robusta e semantica.

## Componenti riutilizzabili

| Componente reale | Impiego consigliato | Vincoli |
| --- | --- | --- |
| `src/components/git-button/git-button.js` | CTA primaria cremisi con freccia e hover fluido, submit form | In un anchor usare `isLinkContent` (span), già disponibile; prevedere spazio per freccia che sporge 35px |
| `src/components/contact-form/contact-form.js` | Contatto con infrastruttura esistente | Supporta locale, stato invio, privacy, Turnstile, analytics, server action; default Informazioni riduce campi progetto |
| `src/components/services/services.jsx` + CSS | Riferimento di layout per problemi/soluzioni e metodo | Copy non parametrico; accordion cliccabile su div e scroll automatico. Meglio sezione statica semantica nuova o estensione mirata |
| `src/components/social-proof/social-proof.jsx` | Eventuale prova sociale esistente | Richiede `isActive` per loghi; molte immagini e animazioni. Non implica esperienza di automazione per ciascun logo |
| `src/components/testimonials/testimonials.jsx` | Fonte di testimonianze reali già presenti | Non importare automaticamente tutte le metriche/tags; carousel autorotante 5s, assenza pausa/reduced-motion da valutare |
| Navbar/Footer globali | Già inclusi dal layout, mantenere | Entrambi fixed, z-index 100; gradienti 100px sopra/150px sotto. Evitare sovrapposizione su H1, CTA e form |

`Button` (`src/components/button/button.js`) dentro href annida un button in un link: evitare per nuove CTA link, preferire GitButton isLinkContent.

## Asset e contenuti verificabili

- Nessuna necessità di nuovi raster per hero: background CSS già coerente e leggero.
- `src/lib/projects.json` contiene Website Roaster come integrazione AI, con immagine ottimizzata `public/projects/website-roaster/main.webp` (~46KB) e directPath `/website-roaster`. È prova concreta di un prodotto AI realizzato; non attribuirgli risparmi di tempo o risultati PMI non documentati. Eventuale case-study compatto può riutilizzare l'immagine via next/image con sizes.
- Fleder, Vecchi360, Gamelia e Jester sono progetti esistenti, ma le descrizioni in projects.json non documentano ogni flusso di automazione. Citare solo funzionalità supportate da file reali.
- Evitare `MarketMomentum`/`RevenueOpportunity`: sono simulazioni specifiche del Website Roaster e distrarrebbero, con rischio di suggerire performance reali della campagna. Evitare `VideosCta` per questa landing: tre video autoplay portfolio non specifici, peso aggiuntivo.
- Regole AGENTS.md lette: raster nuovi ottimizzati WebP se utile, SVG preservati; video MP4 ottimizzati, nessuna conversione video in WebP. Non servono nuovi media né modifiche a projects.json per questa landing.

## Decisioni raccomandate

1. Hero come adattamento di Overview: vero H1, headline concreta, testo breve PMI/software/automazioni/AI, singola CTA anchor al form e link secondario a prova concreta. Nessuna dashboard finta o caricamento portfolio.
2. Corpo in 5–6 sezioni editoriali: problemi riconoscibili, tre famiglie di soluzione, caso AI reale, metodo numerato, form finale; fiducia distribuita dove supporta la decisione.
3. Usare gli stessi token, font, raggi CTA e tratto cremisi; un solo CSS Module landing per composizione e responsive, nessuna libreria aggiuntiva.
4. Anchor form con scroll-margin-top; bottom padding sufficiente per Footer fixed. Verificare 375/390px, 768px e desktop, light/dark, focus tastiera e reduced-motion.

## Rischi aperti

- Overlap navbar/footer fixed e frecce GitButton su mobile.
- Hero animata non leggibile senza JavaScript o con reduced-motion se si riusa RevelatingText senza modifica.
- Titoli fluidi basati su rem possono avere dimensioni inattese: verificare screenshot reali.
- Form attuale non ha props per campagna/etichetta specifica; estenderlo solo se necessario, preservando analytics/antispam/privacy.
- Discovery di questo agente basata su sorgenti locali; validazione visiva finale da svolgere dall'orchestratore/QA.
