# Note Visual & UX — landing automazioni

Audit del 20 ottobre 2026. Ambito: landing automazioni, homepage e componenti condivisi. AGENTS.md letto. Nessuna modifica al codice, nessun browser avviato da questo agente.

## Evidenze esaminate

Screenshot reali della produzione locale su porta 3101, acquisiti dall'agente principale in `before/`: `desktop-initial.png`, `desktop-full.png`, `desktop-form.png`, `desktop-light-full.png`, `laptop-full.png`, `tablet-full.png`, `mobile-initial.png`, `mobile-form.png`, `small-mobile-initial.png`, `small-mobile-full.png`. Per la homepage: `home-desktop-initial.png`, `home-overview-desktop-initial.png`, `home-overview-desktop-full.png`, `home-mobile-initial.png`, `home-mobile-full.png`. I file initial includono la CMP al primo accesso; i full sono successivi a Reject. I vecchi screenshot in `docs/landing-automation/screenshots/` non sono usati come prova dello stato corrente.

## Riscontri visivi oggettivi

| Priorità | Riscontro | Evidenza / ambito | Azione circoscritta |
| --- | --- | --- | --- |
| Limite della cattura, nessuna priorità utente assegnata | Un rettangolo cremisi pieno copre header soluzioni e parte delle righe nei full desktop/laptop/tablet; nel file mobile-form copre gran parte dell'immagine | `desktop-full.png`, `laptop-full.png`, `tablet-full.png`, `mobile-form.png`; stesso fenomeno in homepage | L'agente principale ha confermato l'origine nel transitionOverlay fixed traslato fuori viewport. È un artefatto della cattura, non un P1 dimostrato per l'utente. Le zone coperte non sono valutabili con queste immagini; aggiornare dopo le catture after con overlay inattivo nascosto |
| Limite del test locale, nessuna priorità utente assegnata | Il form dichiara indisponibilità e il submit è disabilitato | `desktop-form.png`; conferma nelle full dark/light | Ambiente locale privo della configurazione antispam, confermato dall'agente principale. Non è prova di guasto produzione. Il fallback email è presente e leggibile |
| P2 | CMP in inglese sopra la route italiana, con testo molto lungo | `desktop-initial.png`, `mobile-initial.png`, `small-mobile-initial.png` | Localizzare la CMP usando locale/policy coerenti. A 390px copre parte della descrizione e CTA, a 320px copre anche la headline: è uno stato modale di consenso, non clipping della hero |
| P3, miglioramento leggibilità | I loghi della prova sociale risultano molto attenuati; in light alcuni diventano appena riconoscibili | `desktop-light-full.png`, `tablet-full.png` | Se si vuole rendere la prova più utile, alzare moderatamente l'opacità della sola variante campaign. Conservare la gerarchia della CTA |

La valutazione visiva non attribuisce un rapporto di contrasto numerico: misure axe/DOM appartengono alla verifica tecnica dell'agente principale.

### Aspetti riusciti osservati

- Hero scura e chiara: gerarchia immediata, promessa leggibile, colore e corsivo coerenti con il marchio; CTA primaria e link progetto distinguibili nel desktop dopo la chiusura CMP.
- Sezioni caso e metodo: ritmo editoriale, allineamenti, titoli e numeri coerenti. Nel tablet il caso passa ordinatamente a una colonna senza troncare l'immagine.
- Recensione: avatar, nome/progetto e citazione leggibili, senza competizione da carousel nella landing. La maggiore dimensione della citazione crea una pausa nel flusso.
- Form: etichette e opzionalità esplicite; spazio sufficiente per input e textarea. Il test statico non dimostra validazione o invio.
- Chiusura: fascia a tre video/poster e CTA mantengono continuità con i componenti homepage, senza introdurre un secondo stile grafico.

### Confronto visivo con homepage

La homepage reale conferma lo sfondo Overview con bagliori rosso/blu, FK Grotesk, corsivo marcato, pill cremisi con freccia, navbar e footer fissi. La landing riprende questi elementi in modo riconoscibile. La differenza nella hero è funzionale: la landing porta promessa, descrizione e due destinazioni esplicite; la homepage presenta una dichiarazione di marca e la galleria portfolio. Non emerge una rottura d'identità da correggere.

Il collage loghi e la fascia video sono lo stesso linguaggio della home. Nella recensione la landing mantiene avatar, iniziale cremisi e tag del progetto, semplificando il carousel in un singolo autore. Questo preserva continuità visiva e leggibilità. La CMP inglese e l'artefatto cremisi sono visibili anche sulla homepage: non sono problemi introdotti dal layout specifico della landing.

## Riscontri oggettivi dai sorgenti

- La landing compone gli stessi `Overview`, `GitButton`, `SocialProof`, `Testimonials`, `ContactForm` e `VideosCta` del sito. Le varianti campaign/featured circoscrivono i cambiamenti. Palette, FK Grotesk, frecce, eyebrow, numerazione e righe divisorie appartengono al linguaggio esistente (`src/app/globals.css`, componenti omonimi).
- La hero contiene H1, descrizione e CTA nel markup, senza dipendere dal reveal GSAP della homepage. La CTA primaria porta a `#contatto`; quella secondaria al caso reale. Stessa destinazione delle CTA metodo, clienti e chiusura (`src/app/[locale]/(contents)/automazioni-aziendali/page.js`).
- La testimonianza nella landing è statica, mentre la homepage usa il carousel. I nove loghi della variante campaign sono statici. Queste differenze rendono la prova sociale leggibile senza attendere cicli (`testimonials.jsx`, `social-proof.jsx`).
- Il form specifico ha etichette persistenti, campi opzionali dichiarati, riepilogo di invio accessibile e fallback email. Il messaggio sul processo è obbligatorio (`contact-form.js`). Non è presente una promessa di tempi di risposta nella variante automazioni.
- Navbar e footer sono fixed con gradienti rispettivamente da 100/150px. Nel mobile navbar e footer usano entrambi gradienti da 150px; l'effettiva copertura dei contenuti richiede screenshot di viewport durante lo scroll (`navbar.module.css`, `footer.module.css`).

## Componenti riutilizzabili e vincoli

| Componente | Riuso utile | Vincolo concreto |
| --- | --- | --- |
| Overview | Hero con sfondo e trattamento tipografico comune | Usare lo slot children/campaign già presente per H1 e CTA |
| GitButton | CTA coerente in tutte le sezioni | Freccia destra esterna da 35px; riservare spazio laterale, come già fatto da primaryLink |
| Services | Riferimento per righe, ritmo, numeri ed eyebrow | Il componente è legato al copy home e a un accordion; il layout landing è già autonomo |
| SocialProof campaign | Prova sociale senza rotazione | Su desktop conserva il collage assoluto; verificare visivamente rapporto con copy/CTA |
| Testimonials featured | Recensione statica con progetto verificabile | Il contenuto della recensione riguarda il sito Casa Palmi; non è una misura dei risultati di automazione |
| ContactForm automation | Lead form con antispam e infrastruttura esistenti | Stato disabled iniziale legato al token Turnstile; la sola schermata statica non dimostra invio funzionante |
| VideosCta campaign | Continuità con la chiusura della homepage | Video decorativi, lazy e pausa; valutare se il loro peso visivo sostiene la conversione |

## Suggerimenti da validare visivamente

Nessun P0/P1 utente dimostrato nella valutazione visiva. Overlay nelle catture e form non configurato restano limiti di evidenza, distinti dai difetti del sito pubblico.

- P2, ipotesi: verificare la hero a 360/390px e altezza ridotta dopo la chiusura CMP in una cattura viewport. La headline, le due CTA e la nota competono per lo spazio residuo sotto la navbar; la hero può crescere oltre il viewport senza che questo costituisca da solo un difetto. Le full con overlay non bastano a chiudere la verifica.
- P2, ipotesi: valutare se il caso BPMN2Petri chiarisce a un pubblico PMI il beneficio applicativo. Copy e interfaccia mostrano una trasformazione tecnica reale, ma non un flusso quotidiano prima/dopo. Un breve esempio operativo testuale potrebbe colmare il passaggio senza metriche inventate.
- P3, preferenza editoriale: considerare una riga sui prossimi passi vicino all'invio, solo se concordata e verificabile. Il metodo è già presente sopra; ripeterne il primo passo al form ridurrebbe l'incertezza dell'utente.

Queste voci sono proposte di UX, non risultati di un test utente.

## Verifica finale sulle catture after

Esaminati `after/desktop-full.png`, `desktop-hero.png`, `laptop-hero.png`, `tablet-hero.png`, `mobile-full.png`, `mobile-hero.png`, `mobile-light-hero.png`, `small-mobile-hero.png`, `small-mobile-form.png`, `interaction-390-solutions.png`, `interaction-320-solutions.png`, `interaction-320-menu.png`.

- Il rettangolo cremisi non compare più nella full desktop e nella full mobile dopo il fix della visibilità dell'overlay inattivo. La sezione Soluzioni è ora valutabile: tre righe problema/soluzione ben separate e ordinate; nessun elemento estraneo né sovrapposizione del layout.
- Hero 1440/1280px, tablet 768px e mobile 390px: H1, descrizione, due destinazioni e nota leggibili, senza tagli laterali o collisioni reciproche. La resa light mobile conserva la stessa gerarchia. La freccia CTA ha spazio sufficiente.
- A 320x568px la hero eccede il viewport, come consentito dal layout. La CTA iniziale richiede scroll. Il footer fixed si sovrappone visivamente alle ultime righe della descrizione; lo stesso effetto è visibile nel fondo dei viewport Soluzioni 320/390px. **P2 residuo di UX:** valutare una presenza più contenuta di email/gradienti/controlli fissi sui viewport bassi. Il testo resta raggiungibile scorrendo: non è un blocco del contenuto né un P1. Non serve comprimere l'intera hero per forzarla in un solo schermo.
- Menu aperto 320px: voci e chiusura leggibili e contenute nel viewport. La correzione di inert/visibility, Esc e attributi aria è riportata dall'agente principale e riguarda la verifica funzionale/accessibile; una sola immagine non la certifica.
- La full mobile conferma che caso, metodo, loghi, recensione e contatto rimangono nella medesima sequenza, con layout a colonna ordinato. Non emerge necessità di un rifacimento grafico.

Esito visuale finale: nessun P0/P1 visivo dimostrato. Residui: P2 CMP inglese su route IT; P2 ingombro footer nei viewport bassi; suggerimenti di contenuto/leggibilità già distinti sopra. Invio reale con antispam di produzione e verifica tastiera spettano al report tecnico/interazioni, non sono dedotti dalle immagini.
