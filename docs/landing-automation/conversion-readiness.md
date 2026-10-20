# Verifica acquisizione contatti e ChatGPT Ads

Data: 20 ottobre 2026, fuso Europe/Rome. Pagina: https://kremisi.com/it/automazioni-aziendali.

**Readiness condizionata: non è ancora dimostrata l'intera catena reale di acquisizione e misurazione.** I test locali passano e Ads Manager mostra lead ricevuti da entrambi i canali. Mancano una prova correlata di invio reale, consegna Resend, ricezione in casella, Turnstile reale e deduplicazione lato piattaforma.

Ambito: solo contatto, email e conversioni. Nessun deploy, invio alla casella commerciale, conversione artificiale in produzione o modifica ad account, budget, campagne, credenziali e configurazioni esterne. Design, struttura e testi della landing non modificati. Una revisione indipendente del backend ha riprodotto il difetto di idempotenza, poi corretto localmente.

## 1. Architettura e condizioni di successo

```text
Visitatore → ContactForm → validazione HTML + privacy
  → contesto consenso/UUID intento → vera Server Action submitContact
  → honeypot → Siteverify Turnstile → validazione server
  → payload normalizzato + chiave stabile → SDK Resend
  → risposta con email ID → conferma successo
    ├─ after(): CAPI, se configurata e consentita
    └─ risposta browser: lead_created Pixel + generate_lead GA4, se consentiti
  → Ads Manager: ricezione, deduplicazione e attribuzione da verificare separatamente
```

- `src/components/contact-form/contact-form.js`: campi obbligatori, privacy separata dal consenso misura, submit disabilitato durante `pending`, errori inline/toast. L'UUID dell'intento viene creato al submit, conservato sui fallimenti e azzerato dopo successo. La risposta positiva richiede il successo della action; il click non è una conversione.
- `src/components/contact-form/actions.js`: non si fida della validazione browser. Honeypot, verifica Turnstile obbligatoria, privacy, servizio, dettagli, nome, email e telefono opzionale sono controllati sul server. La landing usa `service=information`, senza budget/tempistiche obbligatori; `source=automation_landing` è in allowlist.
- L'ID email/conversione è derivato sul server da UUID dell'intento e contenuto normalizzato dell'email. Token Turnstile e consenso marketing non cambiano l'identità dell'email. Cambiare il contenuto o iniziare un nuovo intento genera un'identità diversa.
- `src/lib/contact-email.js`: invio server-only, `from`/`to` da ambiente, `replyTo` del visitatore, testo semplice, oggetto su una riga. Solo risposta senza errori e con `data.id` è accettazione. Errori, configurazione assente e ID mancante non diventano successi.
- `src/server/openai-ads.js`: costruisce il contesto e pianifica CAPI con `after()` soltanto dopo accettazione email. Errori di lettura contesto, hash, scheduling o trasporto restano isolati dal risultato commerciale.
- `src/lib/analytics.js`: nel browser `trackLead` chiama Pixel e GA4 dopo successo della action. Il contenuto dei messaggi non viene inviato agli analytics.

L'accettazione Resend costituisce il confine applicativo di `lead_created`; non dimostra consegna o qualificazione commerciale del lead.

## 2. Verifiche email

Nell'ambiente locale sono presenti solo `.env.example` e nessuna delle sei variabili operative controllate: vedi [environment.json](audit-evidence/conversion-readiness/environment.json). Questo non prova un errore nell'ambiente live.

| Controllo | Risultato ed evidenza |
| --- | --- |
| Destinatario | Esempio: `info@kremisi.com`; destinatario effettivo live non verificato. Test adapter provano routing tramite `CONTACT_EMAIL_TO`. |
| Mittente | Esempio: `Kremisi <contatti@kremisi.com>`; dominio verificato Resend, SPF/DKIM/DMARC e reputazione non verificati. |
| Risposta provider | Test dell'helper reale con SDK mock: ID presente restituito; errore, ID assente e configurazione assente rifiutati. |
| Provider indisponibile | Playwright attraversa la action e il vero SDK con trasporto Resend simulato HTTP 503: errore visibile, dati e privacy conservati, zero conversioni. |
| Invio ripetuto/retry | Replay della action e risposta persa dopo accettazione: stessa `idempotency-key`, una email logica nel provider simulato, stesso ID conversione. |
| Perdita silenziosa | Honeypot non produce più successo fittizio. Fallimenti provider e trasporto producono errore e permettono retry. |
| Recapito/inbox | Nessun webhook/status `delivered`, accesso Resend o riscontro in una casella di test autorizzata disponibile. Non verificati. |

Non sono previsti retry automatici dell'applicazione. Il retry manuale richiede una nuova verifica Turnstile e usa lo stesso intento finché il componente rimane montato. La deduplica provider dipende dalla finestra Resend di 24 ore; reload, nuova scheda, vecchi client senza UUID o nuovo intento non garantiscono la stessa chiave. Non esiste una coda persistente di richieste: un errore viene segnalato all'utente, ma senza retry non viene recuperato automaticamente. Eventuali bounce successivi all'accettazione non aggiornano la UI: vanno monitorati lato provider.

## 3. Turnstile

`src/components/turnstile/turnstile.js` carica il widget con site key pubblica; scadenza ed errore svuotano il token, il submit rimane disabilitato senza token. `src/lib/turnstile.js` esegue POST server-side a Siteverify con secret server-only e `cache: no-store`.

Verificati con mock dell'HTTP, eseguendo l'helper reale: assenza secret/token senza rete; token invalidi e risposte `timeout-or-duplicate`; JSON non valido; eccezione rete; HTTP non riuscito anche con `success: true`; booleani non validi. Aggiunto timeout applicativo di 10 secondi e accettazione solo per HTTP riuscito con `success === true`.

Nessun bypass condizionale al `NODE_ENV` nel percorso applicativo. Il preload QA è separato, opt-in, richiede credenziali dummy e rifiuta l'esecuzione in produzione. Non è una verifica delle chiavi distribuite: l'applicazione non controlla esplicitamente le test key Cloudflare né confronta `hostname`/`action` nella risposta. Site key/secret corretti, restrizioni hostname del widget e assenza di chiavi di test in produzione devono essere confermati nella dashboard. Il challenge reale su dominio autorizzato non è stato eseguito; una risposta simulata `timeout-or-duplicate` non prova la scadenza di un token reale.

## 4. Pixel, CAPI, consenso e account

- Pixel condiviso: `XUknsuwioN947vpX5LA4iD`, da `src/lib/openai-ads-config.mjs`; inizializzazione unica browser tramite SDK ufficiale. Lead standard `lead_created`, dati `{type: "customer_action"}`.
- Consenso iubenda: GA4 richiede scopo 4; Pixel e CAPI richiedono scopo 5 marketing. Accettare privacy del modulo non autorizza gli analytics. Il server verifica sia flag browser sia cookie di consenso e blocca con `Sec-GPC: 1`; il browser richiede CMP disponibile e preferenze valide. Test negato, solo analytics, pieno consenso, revoca e opt-out coperti.
- GA4 `G-TK345YVSSJ` e GTM `GTM-5LL6LJR` sono montati tramite `src/components/scripts/scripts.js`: GA4 con consenso analytics; GTM con analytics e marketing. Non ispezionato il contenuto remoto del container: eventuali tag esterni duplicati non sono esclusi da questa verifica del repository.
- CAPI server-only: `POST https://bzr.openai.com/v1/events?pid=...`, secret `OPENAI_ADS_CONVERSIONS_API_KEY`, timeout 1,5 secondi. `validate_only` è false di default; nel QA è true e la rete viene comunque intercettata.
- Identificatori: hash SHA-256 email normalizzata; Pixel riceve solo hash nel secondo `init({user})`; CAPI include hash, user agent ed eventuale `obref`. Nessun nome, telefono o messaggio viene trasmesso. `oppref` è mantenuto opaco, senza decodifica; URL limitato a origine/percorso, controllato rispetto a origine richiesta/canonica, senza query o fragment. `opt_out: true` sui due canali.
- I token CAPI non sono esportati nel browser. Scanner statico: verifica configurazione Ads superata; scanner segreti segnala quattro assegnazioni dummy già presenti nei due script QA. Sono falsi positivi esaminati, non credenziali reali; non si dichiara uno scanner senza rilievi. Vedi `ads-static.json` e `secret-scan.json` nelle evidenze.
- Errori CAPI vengono registrati come warning senza payload, credenziali o identificatori personali e non cambiano il successo email. Nessuna coda persistente/retry CAPI: il fallimento è osservabile nei log ma la conversione server può andare persa; il Pixel resta indipendente.

**Evidenza reale in sola lettura:** account Kremisi, fonte “Kremisi Pixel”, Pixel ID coincidente. Evento non archiviato “Richiesta contatto Kremisi” configurato come `lead_created`, collegato alla fonte corretta, finestre click 30 giorni/view 1 giorno. Esiste anche il custom “Form Inviato” / `form-inviato`: il codice esaminato non lo emette. Non sono eventi intercambiabili. Entrambe le impostazioni restituite hanno `campaigns: []`; non è dimostrata l'associazione a una campagna né l'attribuzione.

`list_conversion_events` ha restituito un campione recente di 9 eventi esistenti: un `lead_created` via `pixel_sdk` ricevuto il 20/10/2026 alle 22:41:50.841 Europe/Rome e un `lead_created` via `server_to_server` alle 22:41:50.211. Vedi [osservazione Ads Manager](audit-evidence/conversion-readiness/ads-manager-observation.json). Non sono stati generati dal QA locale. Non è possibile collegarli a un particolare contatto/email o dichiarare che siano la stessa conversione. Il campione copre al massimo gli ultimi 15 minuti e non è uno storico completo.

I quattro stati rimangono distinti:

1. **Generazione applicativa:** verificata con action/browser reali locali e provider mock, dopo accettazione simulata.
2. **Accettazione endpoint:** risposta HTTP reale dei nostri invii di test non verificata, perché non ne sono stati eseguiti. Gli eventi preesistenti risultano ricevuti a valle nei diagnostici.
3. **Visibilità diagnostici:** verificata realmente per entrambi i canali e per `lead_created`, con i limiti del campione indicati.
4. **Attribuzione campagna:** non verificata; ricezione non equivale a conversione attribuita.

## 5. Deduplicazione

Pixel `event_id` e CAPI `id` condividono l'ID generato sul server, Pixel ID ed evento standard. Il browser deduplica ulteriori chiamate dello stesso lead nel documento. Il retry email usa la stessa identità presso Resend; il test con risposta persa dimostra che una seconda chiamata CAPI conserva l'ID mentre il browser emette un solo lead.

Questa è evidenza del contratto applicativo, **non della deduplicazione Ads Manager**. Il diagnostico disponibile non espone `event_id` o risultato della deduplica: due righe raw, una per canale, non dimostrano né doppio conteggio né avvenuta deduplica. Serve un riscontro piattaforma su un lead legittimo correlato o un ambiente diagnostico separato che esponga gli ID/esiti. Nessun evento fittizio inviato al Pixel di produzione.

## 6. Test ed evidenze

Esecuzioni precedenti a questo intervento: 36/36 test Node superati. Dopo correzioni: **47/47 test Node**, **116/116 controlli Playwright in 9 scenari**, ESLint sui file modificati exit 0. Tutte le prove automatiche sono simulate rispetto ai provider esterni.

| Scenario richiesto | Prova eseguita e risultato locale |
| --- | --- |
| A. Invio valido | Vera action, SDK email, conferma, reset campi: superato. |
| B. Email non valida | Validazione server forzando bypass HTML: nessuna email/conversione. |
| C. Turnstile invalido | Fallimento Siteverify simulato, nessuna email/conversione. |
| D. Provider non disponibile | Resend HTTP 503 simulato, errore e dati conservati. |
| E. Invio ripetuto | Pending disabilita il pulsante; replay server deduplicato nel fixture provider. |
| F. Analytics rifiutato | Contatto accettato, nessun GA lead, Pixel o CAPI. |
| G. Analytics accettato | Solo analytics: GA lead senza Ads; pieno consenso: GA + Pixel + CAPI. |
| H. Errore CAPI | HTTP 503 simulato, email/UI/Pixel rimangono riusciti. |
| I. Successo provider | ID email richiesto; ID assente ed errori rifiutati anche nei test helper. |
| J. Deduplica Pixel/CAPI | Stesso ID dei due canali e dei retry, deduplica browser coperta; piattaforma non verificata. |
| Extra: risposta persa | Prima action eseguita e risposta abortita nel browser dopo accettazione: errore gestito, retry stessa chiave, una email logica nel mock. |

Evidenze in [audit-evidence/conversion-readiness](audit-evidence/conversion-readiness): `unit-tests.txt`, `playwright.txt`, `contact-e2e.json`, `contact-provider.jsonl`, screenshot per scenario, `local-server.txt`, `lint.txt`, inventario ambiente e osservazione Ads. I log fixture possono includere più esecuzioni: `contact-e2e.json` contiene i soli record selezionati per l'ultima esecuzione riuscita.

La prima esecuzione del test ampliato ha rilevato problemi nel test harness (gtag sostituito dall'inizializzazione Next; transizione pending troppo rapida nei rifiuti); la prova della risposta persa ha poi riprodotto il reset della privacy. Dopo correzioni, l'ultima esecuzione è interamente riuscita.

`pnpm build` tentato: bloccato da `EBUSY` su `.next/footer-preview.stderr.log`, un file bloccato nell'ambiente condiviso. Nessun processo estraneo terminato o file bloccato eliminato. La compilazione produzione completa non è quindi verificata; il dev server Next ha compilato ed eseguito la route e le action durante Playwright.

Riproduzione locale (dipendenza Playwright disponibile nel runtime di questa sessione):

```powershell
$env:KREMISI_QA_OUTPUT='docs/landing-automation/audit-evidence/conversion-readiness'
node scripts/qa/start-contact-qa.mjs
# In un secondo terminale, stesso KREMISI_QA_OUTPUT:
# AUDIT_PLAYWRIGHT = percorso del pacchetto Playwright installato
# AUDIT_CHROMIUM = percorso del browser, opzionale
node scripts/audit-automation-contact-e2e.mjs
node --test
```

## 7. Bug corretti localmente

1. Nuovo ID a ogni retry e nessuna chiave Resend: introdotti UUID per intento, hash server legato al contenuto, chiave provider stabile e ID condiviso Pixel/CAPI. Nessuna nuova infrastruttura.
2. Risposta di rete persa dopo invio: catturata nel client; campi e intento conservati, errore generico esistente mostrato, retry disponibile.
3. Checkbox privacy azzerata anche dopo errore dall'autoreset del form: ora controllata e azzerata solo dopo successo. Coperta da Playwright.
4. Honeypot compilato mostrava successo senza email: ora restituisce errore generico, non svuota i dati e non genera conversione.
5. Siteverify accettava valori truthy e non controllava HTTP, senza limite applicativo: ora richiede HTTP riuscito e booleano true, con timeout.

Le correzioni sono solo nel checkout locale; non risultano distribuite in produzione da questo lavoro.

## 8. Blocchi e azioni manuali

1. Preparare staging con credenziali reali configurate esternamente e destinatario di test esplicitamente autorizzato; non usare la casella commerciale per test senza autorizzazione.
2. Confermare routing reale `CONTACT_EMAIL_TO`, mittente verificato Resend e DNS. Eseguire un invio con riferimento QA univoco e challenge Turnstile reale sul dominio autorizzato. Annotare request ID/email ID senza salvare token o credenziali.
3. Separare risposta di accettazione API, evento provider `delivered` (e bounce/complaint) e riscontro effettivo in inbox/spam con header e orario. Solo quest'ultimo prova la ricezione nella casella.
4. Confermare site key/secret, hostname consentiti e nessuna test key Cloudflare nell'ambiente reale. Ripetere token scaduto/riusato in staging.
5. Per test Ads separati usare Pixel/account diagnostico autorizzato e CAPI validate-only; quest'ultimo non salva conversioni e non dimostra attribuzione. In produzione osservare esclusivamente lead legittimi: correlare ID Pixel/CAPI, esito deduplica e impostazione standard scelta dalla campagna. Il custom `form-inviato` non sostituisce `lead_created`.
6. Verificare il container GTM remoto ed eventuali tag lead duplicati; completare build quando il lock locale sarà rilasciato. Prima di un futuro deploy, riesaminare requisiti privacy, consenso e trattamento dati. Nessun deploy è stato effettuato qui.

## Riferimenti verificati

- [OpenAI Measurement Pixel](https://developers.openai.com/ads/measurement-pixel): ID condiviso browser/server e schema Pixel.
- [OpenAI Conversions API](https://developers.openai.com/ads/conversions-api): schema CAPI e chiave di deduplicazione.
- [OpenAI Supported Events](https://developers.openai.com/ads/supported-events): `lead_created`.
- [Cloudflare validazione server](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/): Siteverify, token monouso, scadenza e hostname.
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys): chiave SDK e finestra 24 ore.

## Esito finale

I PASS di ricezione Ads riguardano esclusivamente eventi reali preesistenti osservati sulla fonte dell'account. Non certificano il recapito del modulo né l'intera catena. Nessun servizio reale è classificato PASS sulla sola base di mock.

| Verifica | Stato | Evidenza / controllo mancante |
| --- | --- | --- |
| Invio form | NOT VERIFIED | Flusso locale superato in Playwright; nessun invio reale correlato a provider/casella. |
| Accettazione provider email | NOT VERIFIED | Contratto e SDK provati con mock; manca email ID reale autorizzato. |
| Recapito email | NOT VERIFIED | Manca status/evento `delivered` reale del provider. |
| Ricezione casella | NOT VERIFIED | Manca riscontro del messaggio nella casella autorizzata. |
| Turnstile reale | NOT VERIFIED | Helper coperto, ma mancano challenge e Siteverify reali correlati sul dominio. |
| Generazione conversione | PASS | Contratto applicativo locale: `contact-e2e.json`, scenario success, stesso ID Pixel/CAPI solo dopo accettazione simulata; produzione: diagnostici mostrano `lead_created` esistenti, senza prova del contatto d'origine. |
| Ricezione Pixel | PASS | Diagnostico reale `pixel_sdk`, `lead_created`, ricevuto 20/10/2026 22:41:50.841 Europe/Rome; osservazione Ads allegata. |
| Ricezione CAPI | PASS | Diagnostico reale `server_to_server`, `lead_created`, ricevuto 20/10/2026 22:41:50.211 Europe/Rome; osservazione Ads allegata. |
| Deduplicazione Ads Manager | NOT VERIFIED | Campione raw senza ID/esito deduplica; uguaglianza degli ID dimostrata soltanto nell'applicazione locale. |
