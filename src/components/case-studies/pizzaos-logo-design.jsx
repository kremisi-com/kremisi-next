import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import layout from "./brand-identity.module.css";
import styles from "./pizzaos-logo-design.module.css";

const assetPath = "/projects/pizzaos-logo-design";

const copy = {
    it: {
        subtitle: "Progettazione del logo",
        intro: "La forma della pizza diventa il segno di una piattaforma digitale per pizzerie.",
        openPdf: "Apri la presentazione (PDF)",
        contextTitle: "Dalla pizza al pittogramma",
        context: "I cerchi concentrici partono dalla forma della pizza e richiamano anche un grafico ad anello e un bersaglio. Da questa geometria nasce un simbolo che lega il mondo della pizza a quello dei dati e degli obiettivi.",
        studyTitle: "Come è costruito il segno",
        paletteTitle: "La palette",
        applicationsTitle: "Il marchio in uso",
        applicationsText: "Il moodboard accosta il marchio a mockup dell’app, della borsa per le consegne e dell’insegna. Il pittogramma diventa sia icona sia motivo ripetuto.",
        moodboardAlt: "Moodboard con mockup dell’app, della borsa per le consegne e dell’insegna, accanto al logo orizzontale e al pattern.",
        iconAlt: "Icona PizzaOS con pittogramma sabbia e rosso pomodoro su fondo blu.",
        iconCaption: "Il pittogramma come icona dell’app",
    },
    en: {
        subtitle: "Logo design",
        intro: "The shape of a pizza becomes the mark of a digital platform for pizzerias.",
        openPdf: "Open the presentation (PDF, Italian)",
        contextTitle: "From pizza to pictogram",
        context: "The concentric circles take their cue from the shape of a pizza and also evoke a doughnut chart and a target. This geometry gives PizzaOS a mark that connects pizza with data and goals.",
        studyTitle: "How the mark is built",
        paletteTitle: "The palette",
        applicationsTitle: "The mark in use",
        applicationsText: "The moodboard pairs the mark with mockups of the app, a delivery bag and signage. The pictogram becomes both an app icon and a repeating pattern.",
        moodboardAlt: "Moodboard with app, delivery bag and signage mockups, alongside the horizontal logo and the pattern.",
        iconAlt: "PizzaOS app icon with a sand and tomato red pictogram on a blue background.",
        iconCaption: "The pictogram as an app icon",
    },
};

const studies = [
    {
        image: "geometria.webp",
        width: 519,
        height: 778,
        it: {
            title: "Geometria",
            text: "I cerchi e gli archi costruiscono un segno equilibrato che rimane leggibile anche in piccolo.",
            alt: "Griglia di costruzione del marchio sovrapposta a una pizza.",
        },
        en: {
            title: "Geometry",
            text: "Circles and arcs create a balanced mark that stays legible at small sizes.",
            alt: "The mark’s construction grid overlaid on a pizza.",
        },
    },
    {
        image: "analisi.webp",
        width: 569,
        height: 778,
        it: {
            title: "Analisi",
            text: "Gli anelli richiamano i grafici delle dashboard e la misurazione delle prestazioni.",
            alt: "Il simbolo PizzaOS con gli anelli suddivisi in settori come un grafico.",
        },
        en: {
            title: "Analysis",
            text: "The rings echo dashboard charts and the measurement of performance.",
            alt: "The PizzaOS mark with its rings divided into chart segments.",
        },
    },
    {
        image: "focus.webp",
        width: 648,
        height: 778,
        it: {
            title: "Focus",
            text: "Il centro del simbolo richiama un bersaglio e rappresenta la precisione con cui si punta a un obiettivo.",
            alt: "Una freccia raggiunge il centro del pittogramma, rappresentato come un bersaglio.",
        },
        en: {
            title: "Focus",
            text: "The centre of the mark suggests a target and the precision needed to reach a goal.",
            alt: "An arrow hits the centre of the pictogram, shown as a target.",
        },
    },
    {
        image: "varianti.webp",
        width: 519,
        height: 778,
        it: {
            title: "Riconoscibilità",
            text: "La silhouette resta riconoscibile a colori e in bianco sui diversi sfondi della palette.",
            alt: "Quattro versioni del logo sui fondi bianco, rosso, sabbia e blu.",
        },
        en: {
            title: "Recognition",
            text: "The silhouette remains recognisable in colour and in white across the palette.",
            alt: "Four logo variants on white, red, sand and blue backgrounds.",
        },
    },
];

const palette = [
    { name: "BurlyWood", hex: "#DDB785", it: "Calore e solidità", en: "Warmth and stability" },
    { name: "Tomato", hex: "#CF5430", it: "Energia e attenzione", en: "Energy and attention" },
    { name: "Dark Blue", hex: "#0A384F", it: "Tecnologia e fiducia", en: "Technology and trust" },
];

export default function PizzaOSLogoDesign({ locale = "en" }) {
    const language = locale === "it" ? "it" : "en";
    const text = copy[language];

    return (
        <main className={`page-content-simple ${layout.page}`}>
            <section className={`${layout.section} ${styles.hero}`}>
                <div className={styles.heroCopy}>
                    <p className={`${layout.kicker} ${styles.heroLabel}`}>{text.subtitle}</p>
                    <h1 className={layout.pageTitle}>PizzaOS</h1>
                    <p className={styles.heroIntro}>{text.intro}</p>
                    <a
                        className={styles.pdfLink}
                        href={`${assetPath}/presentazione-logo.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {text.openPdf}
                        <ArrowUpRight aria-hidden="true" size={18} />
                    </a>
                </div>
                <Image
                    className={styles.heroLogo}
                    src={`${assetPath}/logo-verticale.webp`}
                    alt="Logo PizzaOS"
                    width={591}
                    height={1000}
                    sizes="(max-width: 768px) 166px, 230px"
                    preload
                />
            </section>

            <section className={`${layout.section} ${layout.textGrid}`}>
                <h2 className={layout.sectionTitle}>{text.contextTitle}</h2>
                <p className={layout.leadText}>{text.context}</p>
            </section>

            <section className={layout.section}>
                <h2 className={`${layout.sectionTitle} ${styles.sectionHeading}`}>{text.studyTitle}</h2>
                <div className={styles.studyGrid}>
                    {studies.map(({ image, width, height, [language]: study }) => (
                        <figure className={styles.study} key={image}>
                            <Image
                                src={`${assetPath}/${image}`}
                                alt={study.alt}
                                width={width}
                                height={height}
                                sizes="(max-width: 900px) 38vw, 22vw"
                            />
                            <figcaption>
                                <h3>{study.title}</h3>
                                <p>{study.text}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className={layout.section}>
                <h2 className={`${layout.sectionTitle} ${styles.sectionHeading}`}>{text.paletteTitle}</h2>
                <ul className={styles.palette}>
                    {palette.map((colour) => (
                        <li key={colour.hex}>
                            <div className={styles.swatch} style={{ backgroundColor: colour.hex }} />
                            <div className={styles.swatchLabel}>
                                <h3>{colour.name}</h3>
                                <span>{colour.hex}</span>
                            </div>
                            <p>{colour[language]}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={layout.section}>
                <div className={`${layout.textGrid} ${styles.applicationsHeading}`}>
                    <h2 className={layout.sectionTitle}>{text.applicationsTitle}</h2>
                    <p className={layout.leadText}>{text.applicationsText}</p>
                </div>
                <div className={styles.applications}>
                    <Image
                        src={`${assetPath}/moodboard.webp`}
                        alt={text.moodboardAlt}
                        width={1920}
                        height={1080}
                        sizes="(max-width: 900px) 100vw, 65vw"
                    />
                    <figure>
                        <Image
                            src={`${assetPath}/icona.webp`}
                            alt={text.iconAlt}
                            width={1020}
                            height={1000}
                            sizes="(max-width: 900px) 70vw, 32vw"
                        />
                        <figcaption>{text.iconCaption}</figcaption>
                    </figure>
                </div>
            </section>
        </main>
    );
}
