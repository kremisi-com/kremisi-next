# QA indipendente — microtransizioni landing

Revisione statica del 20 ottobre 2026 del diff rispetto a `d7175fc` e del nuovo `landing-motion.jsx`. Ownership: solo questo documento. Nessuna build, test, lint o sessione browser eseguita da questo agente.

## Esito

Nessun problema azionabile rilevato nel diff revisionato.

- Progressive enhancement: SSR e CSS non nascondono preventivamente contenuti. Il controller restituisce null; senza JavaScript, IntersectionObserver o WAAPI la pagina rimane leggibile. H1 mantiene la propria opacità durante entrambe le keyframe, con solo piccolo spostamento verticale.
- Observer limitato a `#automation-landing` e ai marcatori data-reveal. WeakSet e unobserve rendono le entrate singole; ritardi limitati a 120ms. I gruppi non animabili perché tab nascosta o già contenenti focus rimangono nello stato naturale visibile.
- Il cambio di prefers-reduced-motion disconnette l'observer e cancella le animazioni attive; con preferenza reduce non ne vengono registrate altre. Uscita dalla tab annulla gli effetti attivi. Il focus dentro un gruppo in movimento annulla l'animazione del gruppo, mantenendo stabili i controlli utilizzati da tastiera. Rejection di animation.finished gestita senza promise non intercettate.
- Cleanup di observer, animazioni e listener presente. Nessuna libreria aggiunta. Le animazioni usano opacity e translate, senza sovrascrivere i transform CSS delle schede o dei controlli.
- Nuovi hover di CTA, righe, immagini, avatar, pill e video limitati a hover disponibile, puntatore fine e assenza di reduced-motion; feedback focus/active gestito separatamente. Il reset reduced-motion della landing copre anche i discendenti condivisi. Easing definito una volta sul contenitore della landing con fallback nei CSS dei componenti condivisi.
- Marcatori nei componenti condivisi applicati solo alle varianti campaign/featured; le chiamate della homepage restano prive dei nuovi effetti. Nessuna modifica alla logica di caricamento dei video o poster: il riuso e gli aggiustamenti mobile/lazy del commit `d7175fc` restano nel codice.

## Verifica finale

La revisione statica non attesta fluidità percepita, clipping transitorio o comportamento reale del browser durante navigazione/focus/cambio preferenza. Screenshot, controlli interattivi e build finale sono eseguiti dall'orchestratore e vanno riportati come tali nella consegna.
