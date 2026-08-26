import Image from "next/image";
import styles from "@/app/[locale]/(contents)/case-studies/brand-identity/lucrezia-curto/page.module.css";

const PDF_BASE_PATH = "/projects/lucrezia-curto/graphic";

const documents = [
    {
        title: { it: "Analisi, concept e moodboard", en: "Research, concept and moodboard" },
        fileName: "Concept-AnalisiMercato-Moodboard.pdf",
        previewImage: "Concept-AnalisiMercato-Moodboard-preview.webp",
        previewWidth: 1853,
        previewHeight: 1310,
        description: {
            it: "Ricerca, posizionamento e direzione visiva per definire il tono dello studio.",
            en: "Research, positioning and visual direction to define the studio's tone.",
        },
    },
    {
        title: { it: "Palette colori", en: "Colour palette" },
        fileName: "colori-lucrezia-curto.pdf",
        previewImage: "colori-lucrezia-curto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description: {
            it: "Una palette misurata per comunicare ordine, fiducia e riconoscibilità.",
            en: "A measured palette designed to convey order, trust and recognition.",
        },
    },
    {
        title: { it: "Proposte logo", en: "Logo proposals" },
        fileName: "proposta-loghi-LucreziaCurto.pdf",
        previewImage: "proposta-loghi-LucreziaCurto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description: {
            it: "Studio di marchio e logotipo tra eleganza, leggibilità e autorevolezza.",
            en: "Logo and wordmark exploration balancing elegance, clarity and authority.",
        },
    },
    {
        title: { it: "Applicazione su targa", en: "Signage application" },
        fileName: "targa-lucrezia-curto-def.pdf",
        previewImage: "targa-lucrezia-curto-def-preview.webp",
        previewWidth: 1884,
        previewHeight: 1323,
        description: {
            it: "L'identità tradotta in un'applicazione fisica per l'ingresso dello studio.",
            en: "The identity translated into a physical application for the studio entrance.",
        },
    },
];

const goals = [
    {
        title: { it: "Rendere riconoscibile lo studio", en: "Make the studio recognisable" },
        description: {
            it: "Costruire un sistema visivo immediato, ordinato e facile da associare a Lucrezia Curto.",
            en: "Build an immediate, orderly visual system that is easy to associate with Lucrezia Curto.",
        },
    },
    {
        title: { it: "Comunicare fiducia e competenza", en: "Communicate trust and expertise" },
        description: {
            it: "Allineare logo, palette e tono grafico in una presenza sobria, professionale e continua.",
            en: "Align logo, palette and visual tone into a professional, consistent presence.",
        },
    },
    {
        title: { it: "Funzionare online e offline", en: "Work online and offline" },
        description: {
            it: "Progettare un'identità flessibile, verificata su touchpoint digitali e materiali fisici.",
            en: "Design a flexible identity tested across digital touchpoints and physical materials.",
        },
    },
];

const showcase = [
    {
        image: "/projects/lucrezia-curto/brand/moodboard.webp",
        width: 2200,
        height: 1556,
        title: { it: "Atmosfera", en: "Atmosphere" },
        text: { it: "Una direzione contemporanea, elegante e distintiva.", en: "A contemporary, elegant and distinctive direction." },
    },
    {
        image: "/projects/lucrezia-curto/brand/logo-showcase.webp",
        width: 2200,
        height: 1238,
        title: { it: "Segno", en: "Mark" },
        text: { it: "Un monogramma sinuoso costruito sulle iniziali.", en: "A flowing monogram built from the initials." },
    },
    {
        image: "/projects/lucrezia-curto/brand/logo-system.webp",
        width: 2200,
        height: 1238,
        title: { it: "Sistema", en: "System" },
        text: { it: "Logo, colore e pattern progettati per lavorare insieme.", en: "Logo, colour and pattern designed to work together." },
    },
    {
        image: "/projects/lucrezia-curto/brand/signage.webp",
        width: 2200,
        height: 1238,
        title: { it: "Applicazione", en: "Application" },
        text: { it: "L'identità prende forma nello spazio fisico.", en: "The identity comes to life in the physical space." },
    },
];

const copy = {
    it: {
        kicker: "Brand identity",
        title: "Lucrezia Curto",
        subtitle: "Identità visiva per uno studio commercialista",
        heroText: "Un sistema visivo costruito per comunicare precisione, ascolto e autorevolezza, trasformando il carattere dello studio in un'identità riconoscibile.",
        context: "Contesto",
        contextTitle: "Rigore professionale, con una presenza più umana.",
        contextText: "Il progetto nasce dall'esigenza di rendere più chiara e distintiva la presenza dello studio. La ricerca ha unito il linguaggio istituzionale della consulenza a un tono più accogliente, capace di esprimere precisione tecnica e attenzione alle persone.",
        goalLabel: "Obiettivi",
        goalTitle: "Una direzione visiva solida.",
        identityLabel: "Sistema visivo",
        identityTitle: "Dal posizionamento alle applicazioni.",
        resultLabel: "Risultato finale",
        resultTitle: "Un'identità elegante, professionale e coerente.",
        resultText: "Il viola diventa il filo conduttore di un sistema distintivo e flessibile. Monogramma, tipografia, palette e applicazioni costruiscono una presenza capace di funzionare con la stessa chiarezza online e offline.",
        open: "Apri documento",
    },
    en: {
        kicker: "Brand identity",
        title: "Lucrezia Curto",
        subtitle: "Visual identity for an accounting studio",
        heroText: "A visual system designed to communicate precision, empathy and authority, turning the studio's character into a recognisable identity.",
        context: "Context",
        contextTitle: "Professional rigour, with a more human presence.",
        contextText: "The project began with the need for a clearer, more distinctive studio presence. The research combined the institutional language of consulting with a warmer tone, expressing technical precision and genuine attention to people.",
        goalLabel: "Goals",
        goalTitle: "A strong visual direction.",
        identityLabel: "Visual system",
        identityTitle: "From positioning to application.",
        resultLabel: "Final result",
        resultTitle: "An elegant, professional and coherent identity.",
        resultText: "Purple becomes the thread running through a distinctive, flexible system. Monogram, typography, palette and applications create a presence that works with equal clarity online and offline.",
        open: "Open document",
    },
};

function documentHref(fileName) {
    return `${PDF_BASE_PATH}/${fileName}`;
}

function localize(value, locale) {
    return value[locale] || value.en;
}

export default function LucreziaCurtoBrandIdentity({ locale = "en" }) {
    const text = copy[locale] || copy.en;

    return (
        <main className={`page-content-simple ${styles.page}`}>
            <section className={`${styles.section} ${styles.hero}`}>
                <div className={styles.heroCopy}>
                    <p className={styles.kicker}>{text.kicker}</p>
                    <h1 className={styles.pageTitle}>{text.title}</h1>
                    <p className={styles.heroSubtitle}>{text.subtitle}</p>
                    <p className={styles.heroText}>{text.heroText}</p>
                </div>
                <div className={styles.heroVisual} aria-label={text.identityTitle}>
                    {documents.map((document, index) => (
                        <a
                            className={styles.previewCard}
                            href={documentHref(document.fileName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={document.fileName}
                            aria-label={`${text.open}: ${localize(document.title, locale)}`}
                        >
                            <Image
                                src={`${PDF_BASE_PATH}/${document.previewImage}`}
                                width={document.previewWidth}
                                height={document.previewHeight}
                                alt={localize(document.title, locale)}
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 58vw, 34vw"
                            />
                        </a>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.contextSection}`}>
                <p className={styles.sectionEyebrow}>{text.context}</p>
                <div className={styles.textGrid}>
                    <h2 className={styles.sectionTitle}>{text.contextTitle}</h2>
                    <p className={styles.leadText}>{text.contextText}</p>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.goalLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.goalTitle}</h2>
                </div>
                <ol className={styles.goalList}>
                    {goals.map((goal, index) => (
                        <li className={styles.goalItem} key={localize(goal.title, locale)}>
                            <span className={styles.goalNumber}>{String(index + 1).padStart(2, "0")}</span>
                            <div>
                                <h3>{localize(goal.title, locale)}</h3>
                                <p>{localize(goal.description, locale)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.identityLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.identityTitle}</h2>
                </div>
                <div className={styles.showcaseGrid}>
                    {showcase.map((item, index) => (
                        <figure className={styles.showcaseItem} key={item.image}>
                            <div className={styles.showcaseImage}>
                                <Image
                                    src={item.image}
                                    width={item.width}
                                    height={item.height}
                                    alt={`${localize(item.title, locale)} - Lucrezia Curto`}
                                    sizes={index === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 50vw"}
                                />
                            </div>
                            <figcaption>
                                <span>{localize(item.title, locale)}</span>
                                <p>{localize(item.text, locale)}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.resultSection}`}>
                <p className={styles.sectionEyebrow}>{text.resultLabel}</p>
                <h2 className={styles.resultTitle}>{text.resultTitle}</h2>
                <p className={styles.resultText}>{text.resultText}</p>
            </section>
        </main>
    );
}
