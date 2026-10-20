# Conversion & content audit — prima delle modifiche

Valutazione del percorso annuncio «Meno lavoro manuale» / «Software e automazioni per la tua azienda.» → landing `/it/automazioni-aziendali` → contatto. Basata su codice e testi correnti; nessuna compilazione/invio del form, nessun browser usato da questo auditor. Layout e comportamento renderizzati vanno integrati dalle evidenze del responsabile QA. Non sono disponibili dati di conversione: gli effetti commerciali sotto sono ipotesi.

## Le 8 domande del visitatore nuovo

| Domanda | Risposta dalla pagina | Valutazione |
| --- | --- | --- |
| Che cosa offrite, subito? | H1 riprende «Meno lavoro manuale»; eyebrow e descrizione dichiarano software su misura, integrazioni, AI e PMI. | Buona continuità con l'annuncio. Il servizio viene spiegato senza richiedere una conoscenza pregressa del brand. |
| Quali miei problemi risolvete? | Dati reinseriti, software standard inadatto, informazioni difficili da usare. | Buoni problemi riconoscibili; un esempio operativo semplice renderebbe più immediata la prima riga. |
| Qual è il beneficio? | «Più tempo per la tua azienda», trasferimento/aggiornamento dati, supporto ad attività ripetitive. | Chiaro qualitativamente; non servono percentuali o ROI inventati. Il caso reale deve rendere concreto il prima/dopo. |
| Che cosa devo fare adesso? | «Parliamo del tuo processo» collega a `#contatto`; secondaria «Guarda un progetto concreto». | Azione primaria coerente e ripetuta. «Parliamone» finale è meno specifica. |
| Perché dovrei fidarmi? | Progetto reale con interfaccia e link, loghi nominati, recensione firmata Casa Palmi, email aziendale. | Segnali autentici presenti; caso tecnico e recensione di un sito dimostrano sviluppo/collaborazione meglio del risultato «meno lavoro manuale». |
| Il form è semplice? | Messaggio, nome e email obbligatori; azienda e telefono opzionali; nessun budget o tempistica per automation. | Già ridotto e pertinente. Messaggio obbligatorio non segnalato visivamente come nome/email. Successo ed errore in linea sono presenti nel codice. |
| Ci sono distrazioni? | Navbar completa verso altre pagine; link a progetti; email/WhatsApp; tre video portfolio dopo il form. | I link sono utili per verificare l'agenzia ma competono con la conversione. L'effetto è da verificare; non è un bug di per sé. |
| Riesco a capire tutto arrivando per la prima volta? | Offerta, problemi e metodo in tre passi sono espliciti. | Sì nel complesso. Restano opachi BPMN/reti di Petri e il seguito immediato dopo l'invio: modalità di risposta, contenuto del primo confronto, eventuale impegno. |

## Rilievi prioritari e soluzioni

Nessun P0/P1 contenutistico dimostrato dalla lettura statica. Non dichiariamo che il form funzioni in produzione: configurazione antispam, consegna email e invio non sono stati testati da questo auditor.

1. **P2 — ipotesi UX/commerciale: la prova tecnica non traduce il beneficio per una PMI.** `messages/automation/it.json:40–41`, EN corrispondente; `src/app/[locale]/(contents)/automazioni-aziendali/page.js:105–128`. La prima prova scelta richiede di capire diagrammi BPMN e reti di Petri; il testo non esplicita quale operazione è manuale prima e cosa fa l'app dopo. **Soluzione:** anteporre una frase accessibile e verificabile, per esempio «Uno strumento su misura che trasforma automaticamente un diagramma in un altro formato, pronto per l'analisi», lasciando i dettagli tecnici come approfondimento. Non attribuire risparmi o risultati non documentati.
2. **P2 — ipotesi UX/commerciale: aspettativa del primo contatto incompleta.** `messages/automation/it.json:62–66`; `src/components/contact-form/contact-form.js:404` nasconde la nota tempi nella variante automation. Si sa cosa scrivere e si vedono i tre passi del metodo, ma non cosa succede subito dopo l'invio. **Soluzione:** breve nota accanto a CTA/form: risposta per email per capire attività e strumenti, poi valutazione dei prossimi passi. Aggiungere un tempo di risposta o «gratuito/senza impegno» solo se confermato dal team; non riutilizzare automaticamente una promessa non verificata.
3. **P2 — ipotesi UX/commerciale: prova sociale poco allineata alla promessa.** `src/app/[locale]/(contents)/automazioni-aziendali/page.js:156`; `messages/it.json:120–125`; `src/components/testimonials/testimonials.jsx:87–118`. Casa Palmi loda sito e collaborazione; i tag citano prenotazioni e pagamenti, ma la citazione non testimonia automazione o tempo risparmiato. **Soluzione:** mantenere citazione integra; aggiungere contesto fattuale del lavoro svolto, se documentato, oppure selezionare una recensione esistente pertinente. Vecchi360 ha già il tag «Automazione» e Gamelia è SaaS, ma le loro citazioni restano generiche: il solo cambio di persona non prova il beneficio.
4. **P3 — difetto oggettivo di coerenza del form: obbligatorietà del messaggio non dichiarata visivamente.** `src/components/contact-form/contact-form.js:278–291` rispetto a `:303` e `:329`. Il textarea è `required`, ma titolo e placeholder non dicono che è obbligatorio; nome/email usano `*`. **Soluzione:** mostrare «(obbligatorio)» nel label associato al textarea, oppure adottare una legenda coerente per tutti i campi. Conservare label accessibile e validazione nativa.
5. **P3 — ipotesi UX/commerciale: destinazioni contatto divergenti.** `src/components/navbar/navbar.js:72,174`; `src/app/[locale]/(contents)/automazioni-aziendali/page.js:69,146,152,175`; `src/components/videos-cta/videos-cta.jsx`. I CTA di campagna portano al form dedicato, mentre «Contatti» nella navbar apre il form generico, con una scelta servizi differente; il finale riprende video di portfolio e la CTA generica «Parliamone». **Soluzione:** valutare per questa sola rotta «Contatti» → `#contatto` e CTA finale identica alla primaria. Mantenere le vie di verifica dell'agenzia; ridurre o contextualizzare i video soltanto se evidenze d'uso mostrano distrazione. Nessuna prova attuale di danno alle conversioni.

## Guardrail

- Conservare corrispondenza annuncio/hero, form breve, email alternativa, caso reale e recensioni autentiche.
- Non creare percentuali, clienti, testimonianze, tempi di risposta, prezzi o promesse di consulenza gratuita.
- Valutare le proposte con osservazioni UX o test successivi; senza dati non esprimere aumenti attesi di conversione.
