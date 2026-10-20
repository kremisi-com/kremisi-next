# QA indipendente — fascia video finale

Revisione statica del 20 ottobre 2026 su route, VideosCta JSX/CSS e traduzioni IT/EN. Ownership: solo questo documento. Nessuna build, test, lint o verifica browser eseguita da questo agente.

## Esito

Nessun problema azionabile rilevato nel diff revisionato.

- La landing riusa VideosCta dopo il form con `variant="campaign"`; lo slot CTA contiene un anchor semantico `#contatto`, GitButton isLinkContent e CampaignLink con placement closing_contact. Le nuove etichette di sezione e pausa/ripresa sono presenti in entrambe le lingue.
- La homepage continua a usare `<VideosCta />`: stessi tre src, autoplay, loop, muted e playsInline; le nuove logiche effect escono immediatamente senza variante. Il CSS aggiunto è circoscritto a campaign e al nuovo controllo playback.
- Nella campagna lo stato iniziale reducedMotion=true impedisce l'assegnazione anticipata di src. IntersectionObserver aggiorna visibilità e primo ingresso; i video ricevono src solo dopo l'ingresso e con preferenza movimento compatibile, con preload=none. Il fallback senza observer è gestito.
- La riproduzione avviene in effect dopo il commit del DOM, con gestione della Promise di play. Uscita dal viewport, pausa manuale e reduced-motion chiamano pause; il flag di pausa manuale viene conservato durante uscita/rientro. Observer e listener della preferenza vengono rimossi al cleanup. Con reduced-motion non viene assegnato src e restano i poster.
- Galleria decorativa esclusa dall'albero accessibile; CTA e bottone di pausa sono esterni al wrapper aria-hidden. Il controllo è un button nativo, con testo localizzato che descrive l'azione successiva, target minimo 44px e focus ereditato dalla landing.
- Verificata nel filesystem la presenza dei tre MP4 originali (circa 3,09 / 3,66 / 1,37 MB) e dei tre poster WebP esistenti (circa 65 / 147 / 107 KB). `git status` non segnala modifiche in public o projects.json. Nessun nuovo servizio, media generato o conversione video introdotto. L'orchestratore segnala ffmpeg/ffprobe non disponibili: il riuso conserva i file esistenti.

## Verifica finale

La revisione del codice non sostituisce i controlli browser su playback reale, richieste di rete, pausa/ripresa, reduced-motion, resa mobile/desktop e homepage. Questi controlli e la build finale sono di competenza dell'orchestratore; nessun esito viene dichiarato qui come eseguito da questo agente.
