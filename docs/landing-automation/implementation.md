# Frontend implementation — automazioni aziendali

## Risultato e contratti

- Pagina server `src/app/[locale]/(contents)/automazioni-aziendali/page.js`, URL IT/EN con lo stesso slug. Testi nel namespace `automation`: nuovi `messages/automation/it.json` e `en.json`; registrazione del namespace e sitemap gestite dall’orchestratore.
- Metadata localizzati: title/description, canonical, hreflang IT/EN/x-default, OpenGraph e Twitter. L’immagine social resta quella esistente del sito.
- Form: componente condiviso `ContactForm`, `locale` e `variant="automation"`; implementazione della variante e backend affidati all’orchestratore.

## Struttura e riuso

1. Hero Overview con H1, descrizione, CTA al form e link al caso.
2. Problemi e soluzioni accoppiati in tre righe numerate: integrazioni, software su misura, AI/dati.
3. Caso reale BPMN2Petri con immagine e link al progetto interno.
4. Metodo in tre passi: comprendere, definire, costruire/verificare.
5. Contatto contestuale con form esistente ed email alternativa `info@kremisi.com`.

`Overview` estesa in modo compatibile con `children`, `variant="campaign"`, `id` e `aria-labelledby`. Lo sfondo CSS/noise/blob è condiviso; il contenuto campagna ha un wrapper separato per evitare le regole tipografiche di RevelatingText. L’H1 è fornito dalla pagina server ed è immediatamente visibile; non usa GSAP. Il comportamento predefinito della homepage conserva testo, animazione e classi originali. Esplicitata la boundary client di Overview, già interattiva per onTransitionEnd e importata nella homepage client.

`GitButton` riusato con `isLinkContent` dentro un vero anchor. Nuovo piccolo `CampaignLink` client traccia solo `automation_cta_click` attraverso `trackEvent`, con placement e destinazione statica; nessun dato personale, nessun lead al click. Conversione e consenso restano nel flusso condiviso.

## Asset, accessibilità e responsive

- Nessun nuovo media o dipendenza. `projects.bpmn2petrinet` è la fonte di titolo, anno e headerImage. L’asset `public/projects/bpmn2petrinet/conversion-2.webp` è già ottimizzato; dimensioni verificate con sharp: **1440×960**. Ispezione visiva conferma diagramma BPMN sopra e rete di Petri sotto. Next/Image conserva aspect ratio e usa sizes responsivo; caricamento lazy per questa immagine sotto la hero.
- Token `--background`, `--foreground`, `--primary`, `--box-bg`, font FK ereditato. Titoli editoriali, divisori e numerazione coerenti con Services. Nessuna dashboard fittizia, testimonianza o metrica non verificata.
- Un H1, sezioni etichettate, liste semantiche, alt tradotto, link con focus visibile, skip link al contatto. `scroll-margin-top` e padding finale tengono conto di Navbar/Footer fixed.
- Layout mobile a colonna, desktop in griglie; dimensioni del testo in px/clamp per la scala rem globale non standard. Mobile eredita il blob statico di Overview. Reduced motion disabilita transizioni/animazioni della landing e della Overview.

## Verifiche eseguite da Frontend Builder

- ESLint su `page.js`: superato, exit 0.
- Il comando ESLint standard ignora i JSX nel repository con warning. Verifica aggiuntiva tramite API ESLint con `overrideConfig` limitato a `**/*.jsx` ed ecmaFeatures.jsx: `campaign-link.jsx` e `overview.jsx` controllati, **zero errori e warning**, exit 0. Nessuna modifica alla configurazione globale.
- Dimensioni asset con sharp e ispezione visiva reale eseguite.
- Build e verifiche browser finali affidate all’orchestratore/QA; nessun invio email, deploy o provider esterno chiamato da questo agente.

## File di proprietà modificati/creati

- `src/app/[locale]/(contents)/automazioni-aziendali/page.js`
- `src/app/[locale]/(contents)/automazioni-aziendali/page.module.css`
- `src/app/[locale]/(contents)/automazioni-aziendali/campaign-link.jsx`
- `src/components/overview/overview.jsx`
- `src/components/overview/overview.module.css`
- `messages/automation/it.json`
- `messages/automation/en.json`
- Questo report.

## Rischi da verificare in QA

- Dimensione e ingombro laterale della CTA GitButton sui viewport piccoli, overlap dei controlli globali fixed, entrambe le lingue e light/dark.
- Regressione visuale della Overview homepage: estensione opzionale, default invariato; controllare nel browser.
- Provider form e credenziali non verificati da questo agente; la variante riusa l’infrastruttura esistente.
