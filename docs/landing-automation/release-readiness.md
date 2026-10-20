# Preparazione rilascio — automazioni aziendali

Aggiornamento successivo all’audit del 20 ottobre 2026. Ambito autorizzato: correzioni locali, collaudo in **ambiente locale isolato**, preparazione del rilascio. Nessun deploy o push eseguito.

## Modifiche pronte

| Rilievo | Stato | Intervento |
|---|---|---|
| P2-01 — Contrasto testo piccolo | Risolto | Numeri e badge clienti della campagna usano una variante leggibile dell’accento, derivata da colori esistenti. Zero violazioni axe negli otto scenari landing finali. |
| P2-02 — Ingombro mobile | Risolto | Solo sulla landing: email/WhatsApp tornano nel footer a fine documento; il controllo cookie, accessibile e da 44×44 px, è posizionato nell’area del footer. Eliminato il gradiente fisso che copriva il contenuto. Hero adattata alle viewport basse. CTA interamente visibile a 320×568 IT/EN, senza sovrapposizioni. |
| P2-04 — Caso studio tecnico | Risolto | IT/EN spiegano prima la trasformazione di un diagramma di attività in un modello da analizzare, poi nominano BPMN e reti di Petri. Nessuna metrica, risparmio o funzionalità aggiunta. |
| P2-07 — Poster richiesti subito | Risolto per il caricamento anticipato | Poster assegnati entro 200 px dalla fascia finale; MP4 ancora caricati solo entrando nel viewport, mai con movimento ridotto. Nessuna ricompressione o nuovo asset. Le eventuali versioni video mobile rimangono un’ottimizzazione futura. |
| MOB-01 — Hover persistente su touch | Risolto | Le animazioni hover di GitButton richiedono un dispositivo con hover. Evitata la freccia fuori schermo dopo il tap sul banner cookie. Aspetto predefinito e hover desktop conservati. |

Il footer e il controllo cookie della homepage mantengono il comportamento precedente. Le modifiche di posizionamento sono circoscritte alla route automazioni e alle viewport mobili. Il comando preferenze conserva nome accessibile, titolo e icona nativa iubenda; il banner iniziale continua a funzionare normalmente.

La nuova descrizione del caso deriva da `src/lib/projects.json` → `bpmn2petrinet`: progettazione e sviluppo web, conversione BPMN→Petri, analisi/verifica dei processi. Sono stati cambiati soltanto i messaggi della landing, non i fatti del progetto o il progetto stesso.

## Collaudo contatto autorizzato

Il test precedente simulava la risposta della Server Action nel browser. Questo aggiornamento attraversa **browser → vera Server Action Next → verifica server → validazione → helper email/SDK Resend → risposta UI → Pixel/CAPI**.

Il trasporto dei provider è intercettato nel processo Node tramite un preload QA separato. Le risposte di Turnstile, Resend e CAPI sono fixture: **nessun recapito email, verifica Cloudflare reale o ricezione Ads esterna è dichiarato**. Il test usa solo credenziali dummy e indirizzi `example.invalid`. La scelta dell’utente di usare soltanto il locale è rispettata.

| Scenario | Esito verificato |
|---|---|
| Successo con consenso | Action eseguita una volta; verifica e validazione superate; origine landing e contratto semplice preservati nell’email; conferma visibile e campi azzerati. |
| Errore provider email | Errore inline, campi conservati; nessun Pixel/CAPI lead. |
| Errore sicurezza | Rifiuto prima dell’email; nessuna conversione. |
| Email non valida | Validazione server esercitata anche saltando quella HTML; email e conversioni non eseguite. |
| Consenso marketing negato | Contatto accettato; nessun Pixel/CAPI lead. |
| Deduplica/contesto | Pixel e CAPI ricevono lo stesso ID generato dalla vera action; hash email e URL della landing verificati. CAPI in validate-only, intercettata prima della rete. |

**48/48 controlli passano.** [Risultato completo](audit-evidence/mobile-release/contact-e2e.json), [traccia dei provider sintetici](audit-evidence/mobile-release/contact-provider.jsonl).

Il preload rifiuta l’avvio con configurazioni diverse dai valori dummy previsti e in `NODE_ENV=production`; blocca qualsiasi scrittura esterna inattesa. [Due controlli di protezione passati](audit-evidence/mobile-release/safety-guards.json). Non sono stati aggiunti bypass, endpoint di test o interruttori QA al codice applicativo.

## Verifiche del candidato

| Controllo | Risultato / evidenza |
|---|---|
| Build di produzione normale | Passa, 82 pagine generate. [Build](audit-evidence/mobile-release/build.txt). Configurazione distinta dal server QA. |
| ESLint standard | Passa. [Output](audit-evidence/mobile-release/lint.txt). |
| ESLint JSX esplicito | Zero errori; due warning `<img>` preesistenti nel ramo SocialProof della homepage, non nel ramo campagna. [Output](audit-evidence/mobile-release/lint-jsx.txt). |
| Test repository | 36/36. [Output](audit-evidence/mobile-release/test.txt). |
| Responsive/axe/immagini | Cinque viewport richieste, tema chiaro desktop/mobile e reduced-motion; tutte HTTP 200, nessun overflow, immagine rotta o pageerror. Zero violazioni axe rilevate. [Render](audit-evidence/mobile-release/results.json). |
| Navigazione e interazioni | 49/49: Tab/Esc, anchor, lingua/tema, link, validazione browser, controlli video e transizione. [Risultati](audit-evidence/mobile-release/interactions.json). |
| Regressioni mobili mirate e hover desktop | 25/25: 320 IT/EN e 390 IT, CTA visibile, cookie senza sovrapposizioni, hover touch, poster differiti, comportamento home e hover desktop conservati. [Risultati](audit-evidence/mobile-release/mobile-regression.json). |
| Contatto reale locale | 48/48, con trasporto provider isolato come descritto sopra. |
| Screenshot | PNG ignorati da Git; disponibili localmente. [Desktop](audit-evidence/mobile-release/desktop-full.png), [mobile](audit-evidence/mobile-release/mobile-full.png), [hero 320 IT](audit-evidence/mobile-release/mobile-regression-320-it-hero.png), [hero 320 EN](audit-evidence/mobile-release/mobile-regression-320-en-hero.png). |

Gli errori di rete iubenda nei render read-only derivano dai POST volutamente bloccati dall’harness. Non sono classificati come guasti del sito. L’analisi automatica non certifica accessibilità completa, compatibilità con tutti i browser o Core Web Vitals sul campo.

### Performance ripetuta sulla build finale

Tre run per profilo, stessa metodologia locale del primo audit: desktop senza throttling; mobile 390×844 con CPU 4×, RTT 150 ms e download 1,6 Mbps. [Dati grezzi](audit-evidence/mobile-release/performance.json).

| Profilo | LCP tre run | Mediana | CLS massimo | Latenza massima degli eventi campionati |
|---|---|---|---|---|
| Desktop | 872 / 328 / 380 ms | 380 ms | 0,00636 | 24 ms |
| Mobile simulato | 1.692 / 1.688 / 1.740 ms | 1.692 ms | 0,00069 | 32 ms |

Risorse iniziali mobile circa **483 KB**, rispetto agli 803 KB della misura iniziale: i tre poster, per complessivi 319.418 byte di payload, non competono più con il caricamento iniziale. Desktop circa 514 KB rispetto a 836 KB. Le somme escludono il documento HTML e possono non includere tutte le terze parti. Il confronto è di laboratorio, non una stima garantita del risparmio per ogni visitatore; le latenze campionate non sono un INP sul campo.

## Riprodurre il collaudo isolato

Dal repository, nel primo terminale:

```powershell
node scripts/qa/start-contact-qa.mjs
```

Il launcher avvia Next dev su `127.0.0.1:3102`, imposta i valori dummy **solo nel processo figlio** e carica il trasporto isolato. Nessun `.env` viene creato o modificato. Nel secondo terminale, con Playwright/Chromium disponibili nell’ambiente:

```powershell
# Impostare AUDIT_PLAYWRIGHT e AUDIT_CHROMIUM ai percorsi locali,
# se non sono già risolvibili dall’ambiente.
node scripts/audit-automation-contact-e2e.mjs
```

Per le regressioni della build normale, avviare separatamente `npm run build` e `npm run start -- --hostname 127.0.0.1 --port 3101`, quindi:

```powershell
$env:AUDIT_PHASE = 'mobile-release'
$env:AUDIT_HOME = 'true'
node scripts/audit-automation.mjs
node scripts/audit-automation-mobile.mjs
node scripts/audit-automation-interactions.mjs
node scripts/audit-automation-performance.mjs
```

## Punti aperti e rilascio

- **P2-03, CMP italiana:** resta dipendente dall’abilitazione lingua nell’account iubenda. Nessuna modifica all’account o aggiramento della configurazione effettuati. La CMP inglese può ancora occupare gran parte del primo schermo a 320 px; i miglioramenti qui verificati riguardano la pagina dopo la scelta cookie.
- P2-05/P2-06 e P3-03 del report iniziale: pertinenza delle prove sociali, spiegazione del seguito commerciale e rifiniture delle CTA restano proposte. Non sono state inventate promesse operative o testimonianze.
- Recapito reale, chiavi e impostazioni della produzione, pannello Ads e CWV sul campo non verificati: sono fuori dal collaudo locale scelto dall’utente.

**Candidato pronto per revisione e rilascio separato.** Il manifesto `audit-evidence/mobile-release/release-manifest.json` identifica base Git, build locale e hash dei file applicativi/strumenti QA. Prima di pubblicare, usare la procedura di deploy del progetto con configurazione reale verificata, senza il launcher/preload QA; conservare il riferimento alla versione precedente per il rollback. Non è stata introdotta una nuova pipeline né scelto un target di produzione.

Nessun commit, push, deploy, email commerciale o conversione reale eseguito in questo aggiornamento.
