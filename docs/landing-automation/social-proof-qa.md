# QA indipendente — clienti e testimonianza

Revisione statica del 20 ottobre 2026. Ownership: solo questo report. Nessuna modifica al codice, nessuna build, test, lint o sessione browser eseguita da questo agente per questa estensione.

## Esito

Nessun difetto bloccante rilevato nel diff relativo all'integrazione. Le verifiche visive e la build finale sono svolte dall'orchestratore.

- La route inserisce `SocialProof` e `Testimonials` dopo il metodo e prima del contatto, mantenendo il percorso di conversione. La nuova CTA è un anchor semantico verso `#contatto`, con GitButton `isLinkContent` e tracciamento CampaignLink già soggetto al consenso.
- `SocialProof variant="campaign"` mostra nove loghi esistenti. Gli indici 0/3/6/9/12/15/18/21/24 corrispondono correttamente ai nove elementi di CAMPAIGN_LOGOS. Il ramo staticLogo renderizza una sola Next/Image per scheda con alt identificativo, fill e sizes; il caricamento lazy predefinito evita di anticipare questi asset sotto la hero. Non partono timer di rotazione nella campagna. I file referenziati sono presenti in public/projects-logos.
- La homepage continua a chiamare `SocialProof isActive={isOverviewVisible}` senza variante o CTA: staticLogo resta assente, rendering originale e rotazione rimangono nel ramo preesistente. Le aggiunte CSS sono limitate a `.campaign`.
- `Testimonials featuredProjectId="casa-palmi"` seleziona Giuseppe Palminteri. Nome/progetto e quote, ruolo e task IT/EN provengono dagli stessi dati e namespace già usati nella homepage; non è stata inventata una recensione né attribuito un risultato di automazione. Rating e data non sono renderizzati nel ramo featured; non compaiono metriche quantitative. Non vengono avviati autoplay o listener resize nella variante.
- Homepage `<Testimonials />` conserva indice iniziale, carousel, animazioni, rating e rendering precedenti. La dependency testimonials.length è stabile e non riavvia l'intervallo a ogni render. CSS aggiunto limitato a `.featured` e ai nuovi elementi dedicati.
- Accessibilità: nuove sezioni etichettate da H2, recensione in blockquote dentro figure/figcaption, avatar decorativo con alt vuoto accanto al nome, link progetto localizzato e icona esclusa dalla lettura. Task in lista semantica; focus dei link ereditato dalla landing. Nessun nuovo controllo basato solo su click o hover nel ramo featured.
- Responsive statico: la recensione passa a una colonna sotto 1024px; a mobile avatar 72px, autore senza min-width fisso e testo quote minimo 26px. Nessuna altezza fissa della variante limita la lunghezza della recensione. La CTA clienti riusa gli stessi adattamenti della CTA hero già corretta per i viewport stretti.

## Limiti della verifica

La revisione confronta sorgenti e traduzioni esistenti, senza verifica esterna dell'autenticità della recensione. Screenshot desktop/mobile, light/dark, visibilità delle schede, CTA e regressione visiva homepage appartengono alla verifica dell'orchestratore; nessun relativo risultato è dichiarato qui come esecuzione di questo agente.
