# Conversion strategy — automazioni aziendali

## Risultati verificati

- Il posizionamento esiste già: `messages/it.json` → `services.items` descrive piattaforme costruite intorno ai processi, integrazione API/backend, flussi di automazione, pipeline dati e strumenti LLM. Queste sono le offerte utilizzabili nel copy; non servono nuovi prodotti o promesse quantitative.
- Prova concreta sui processi: `src/lib/projects.json` → `bpmn2petrinet` documenta BPMN2Petri, conversione di diagrammi BPMN in reti di Petri per modellazione e analisi. URL interno determinato da `src/lib/projects.js`: `/it/projects/bpmn2petrinet`. Asset esistente `public/projects/bpmn2petrinet/home.webp` (verificare le dimensioni prima dell'impiego).
- Prova AI implementata: `src/app/api/roast/route.js` contiene integrazione provider AI; `src/app/[locale]/website-roaster/page.js` contiene l'interfaccia del Website Roaster. `projects.json` lo identifica come AI Integration, con `/website-roaster` e `main.webp`. È uno strumento Kremisi, non il risultato di una commessa cliente e non prova di ROI.
- Altri esempi riutilizzabili: Fleder mostra prenotazioni, storico e calendario; Casa Palmi mostra un percorso di prenotazione diretta. Non attribuire automazioni ERP/CRM, processi produttivi o risparmi a questi lavori senza altre evidenze.
- `src/components/testimonials/testimonials.jsx` e `messages/it.json` contengono recensioni esistenti, ma nessuna fonte esterna è stata verificata da questo audit. Meglio un caso concreto con asset reale, senza ricopiare rating o testimonianze sulla nuova landing.

## Decisioni e proposta di contenuto

Obiettivo unico: richiesta di contatto che descriva il processo attuale, gli strumenti coinvolti e il problema. CTA principale ripetuta con ancoraggio al form: **Parliamo del tuo processo**. CTA secondaria nella hero: **Guarda un progetto concreto** → sezione caso studio.

1. **Hero.** Eyebrow: “Software su misura · Automazioni · AI”. H1: “Meno lavoro manuale. Più tempo per la tua azienda.” Supporto: “Progettiamo software su misura, colleghiamo strumenti e integriamo AI nei processi delle PMI. Partiamo dal lavoro che fai ogni giorno.” Sono obiettivi progettuali, senza percentuali o tempi di ritorno garantiti.
2. **Problemi + soluzioni.** Titolo: “Dove si ferma il lavoro, possiamo iniziare.” Tre coppie: dati ricopiati tra strumenti → integrazioni e flussi; software che impone passaggi inutili → strumenti su misura; informazioni difficili da elaborare → AI e dati. Esempi formulati come situazioni da valutare, senza attribuirli a clienti.
3. **Caso verificabile.** “Dai diagrammi a uno strumento concreto.” BPMN2Petri: “Un'applicazione web che trasforma diagrammi BPMN in reti di Petri, collegando rappresentazione dei processi e analisi formale.” Mostrare screenshot autentico e link al progetto. È prova di sviluppo di strumenti per processi, non di ore risparmiate. Eventuale seconda scheda piccola Website Roaster: “Un'integrazione AI applicata all'analisi di siti web.”
4. **Metodo proposto.** “Prima capiamo il lavoro. Poi scegliamo la tecnologia.” Tre passi: comprendere processo e strumenti; definire priorità e soluzione; progettare e sviluppare insieme. Presentarlo come percorso di collaborazione previsto, senza inventare SLA, audit gratuiti, deliverable contrattuali o supporto continuativo incluso.
5. **Contatto.** Titolo: “Quale attività vorresti semplificare?” Testo: “Raccontaci come lavori oggi, quali strumenti usi e dove perdi tempo. Ci aiuterà a capire da dove iniziare.” Nome, azienda, email, messaggio; telefono facoltativo. Privacy richiesta e sicurezza esistenti. Submit: “Invia la richiesta”. Email alternativa reale `info@kremisi.com`; recapito esistente `+39 351 744 4749`.

Non serve una sezione fiducia separata con molti loghi: il progetto verificabile, il metodo chiaro e i recapiti reali costituiscono una prova più pertinente. Non costruire dashboard dimostrative né nuove metriche.

## Integrazioni e riferimenti tecnici

- **Form:** `src/components/contact-form/contact-form.js` usa `useActionState`, `submitContact`, toast, reset e i18n IT/EN. Default `service=information` nasconde budget e tempistiche, che diventano obbligatori solo per altri servizi. Per la landing, preferire variante via prop con campi semplici e copy contestuale; preservare comportamento standard delle pagine esistenti. Non impostare `data-analytics` senza gestire i requisiti budget/delivery server.
- **Validazione e consegna:** `src/components/contact-form/actions.js` valida privacy, servizio, messaggio ≥5 caratteri, nome ≥2, email e telefono facoltativo; verifica Turnstile e honeypot `krs_x9q4`. `src/lib/contact-email.js` invia tramite Resend. Le credenziali restano intatte. Test reali di invio richiedono configurazione valida e produrrebbero un'email: verificare con mock/stub o dichiarare il limite.
- **Privacy:** mantenere checkbox e policy Iubenda già presenti; `src/components/contact-form/privacy-links.js` e `src/components/scripts/scripts.js` gestiscono link e CMP. Non introdurre nuove scelte di consenso o nuovi servizi. Questo audit verifica il codice, non esprime valutazioni legali.
- **Conversioni:** `src/lib/analytics.js` ha `view_contact_form`, `contact_form_start`, `generate_lead`; misura GA solo con consenso measurement. Il lead viene emesso dal form solo dopo successo, escludendo `silentDrop`. La vista form attuale scatta al mount, non all'ingresso nel viewport: su landing con form in fondo suggerita IntersectionObserver nella variante. Il form-start attuale scatta a ogni focus email: deduplicarlo per tentativo nella variante.
- **Visite e Ads:** layout locale monta `OpenAIAds`; `src/components/openai-ads/openai-ads.js` misura cambi di pathname e attende consenso. `src/lib/openai-ads-browser.mjs` raccoglie contesto e deduplica lead tramite eventId. `src/server/openai-ads.js` pianifica CAPI dopo invio accettato, quando configurato e consentito. Riutilizzare il flusso. Non inventare un content_view di tipo project per questa landing. Nessun PII nei nuovi eventi di interazione.
- **SEO/i18n:** `src/i18n/routing.js` ha locale `en/it`, default EN e prefisso sempre presente. Il language toggle conserva lo stesso pathname (`src/components/navbar/language-toggle.js`): implementare anche contenuto EN sullo stesso slug evita cambio lingua in 404. Pattern metadata canonico, alternates, OpenGraph/Twitter nelle pagine servizi/contatti. Titolo IT proposto: “Automazioni aziendali e software su misura”; descrizione: “Software su misura, integrazioni e AI per semplificare i processi delle PMI. Racconta a Kremisi quali attività vuoi migliorare.” Aggiungere lo slug a `src/app/sitemap.js`; dichiarare alternate solo per pagine implementate. Un H1, gerarchia chiara, canonical senza query pubblicitarie.

## Rischi aperti

- La headline parla di un beneficio atteso: il corpo deve restare specifico e non promettere risparmi garantiti.
- Presenza del codice non equivale a verifica operativa dei provider AI, Resend, Turnstile o CAPI; audit soltanto statico, nessun invio effettuato.
- Il sito esistente dichiara risposta “solitamente entro 24 ore lavorative” nel form: riuso possibile, ma evitare di rafforzarla in garanzia sulla landing.
- Evitare raccolta/salvataggio aggiuntivo di query UTM o dati personali: la pagina corrente è già nel contesto Ads, il percorso pagina è disponibile nelle analisi.
- Nessun nuovo asset raster o video necessario per questa strategia; usare WebP esistente e seguire AGENTS.md se si aggiungono media.

## File coinvolti

Scritto soltanto questo report. Sorgenti letti: `AGENTS.md`, `messages/it.json`, `src/lib/projects.json`, `src/lib/projects.js`, pagine e componenti sopra citati; `src/app/[locale]/home-client.js`, `src/app/[locale]/layout.js`, `src/lib/turnstile.js`. Nessun codice modificato e nessun servizio esterno chiamato.
