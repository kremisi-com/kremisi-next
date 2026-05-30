import AnimatedLink from "@/components/animated-link/animated-link";
import GitButton from "@/components/git-button/git-button";
import { ArrowUpRight, FileText } from "lucide-react";
import Image from "next/image";
import styles from "./page.module.css";

const CASE_STUDY_PATH = "/case-studies/brand-identity/lucrezia-curto";
const CASE_STUDY_URL = `https://kremisi.com${CASE_STUDY_PATH}`;
const PDF_BASE_PATH = "/projects/lucrezia-curto/graphic";

const documents = [
    {
        title: "Analisi, concept e moodboard",
        fileName: "Concept-AnalisiMercato-Moodboard.pdf",
        previewImage: "Concept-AnalisiMercato-Moodboard-preview.webp",
        previewWidth: 1853,
        previewHeight: 1310,
        description:
            "La fase iniziale di ricerca, posizionamento e direzione visiva per definire il tono di uno studio commercialista.",
        stepTitle: "Analisi di mercato e moodboard",
        stepText:
            "Il lavoro parte dall'osservazione del contesto fiscale, contabile e consulenziale, per individuare riferimenti visivi credibili e costruire una direzione chiara per lo studio.",
    },
    {
        title: "Palette colori",
        fileName: "colori-lucrezia-curto.pdf",
        previewImage: "colori-lucrezia-curto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description:
            "Una selezione cromatica misurata, pensata per comunicare ordine, fiducia e riconoscibilità in ambito contabile e fiscale.",
        stepTitle: "Definizione della palette cromatica",
        stepText:
            "I colori sono stati scelti per sostenere un'immagine professionale e coerente, capace di funzionare sui supporti digitali e sui materiali fisici di uno studio commercialista.",
    },
    {
        title: "Proposte logo",
        fileName: "proposta-loghi-LucreziaCurto.pdf",
        previewImage: "proposta-loghi-LucreziaCurto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description:
            "Studio delle possibili soluzioni di marchio e logotipo, con attenzione a leggibilità, solidità e autorevolezza professionale.",
        stepTitle: "Studio e proposta dei loghi",
        stepText:
            "La ricerca sul logo ha esplorato forme essenziali e riconoscibili, mantenendo un equilibrio tra personalità, autorevolezza e affidabilità richieste dalla consulenza fiscale.",
    },
    {
        title: "Applicazione su targa",
        fileName: "targa-lucrezia-curto-def.pdf",
        previewImage: "targa-lucrezia-curto-def-preview.webp",
        previewWidth: 1884,
        previewHeight: 1323,
        description:
            "Applicazione finale dell'identità su un supporto concreto, pensato per l'ingresso dello studio commercialista.",
        stepTitle: "Applicazione finale su targa e materiali fisici",
        stepText:
            "La direzione visiva è stata tradotta in un'applicazione reale, verificando proporzioni, presenza e chiarezza del sistema identitario in un contesto professionale e consulenziale.",
    },
];

const goals = [
    {
        title: "Rendere riconoscibile lo studio commercialista",
        description:
            "Costruire un sistema visivo immediato, ordinato e facile da associare allo studio.",
    },
    {
        title: "Comunicare fiducia, ordine e competenza fiscale",
        description:
            "Allineare logo, palette e tono grafico in una presenza sobria, professionale e continua.",
    },
    {
        title: "Applicare l'identità su materiali concreti e professionali",
        description:
            "Verificare l'identità su supporti reali, mantenendo leggibilità, equilibrio e autorevolezza.",
    },
];

export const metadata = {
    title: "Lucrezia Curto - Case Study Brand Identity",
    description:
        "Case study Kremisi sulla brand identity realizzata per lo studio commercialista Lucrezia Curto: analisi, palette, logo e applicazioni professionali.",
    alternates: {
        canonical: CASE_STUDY_PATH,
    },
    openGraph: {
        title: "Lucrezia Curto - Case Study Brand Identity",
        description:
            "Identità visiva per uno studio commercialista: una brand identity coerente, riconoscibile e pronta per applicazioni online e offline.",
        url: CASE_STUDY_PATH,
        type: "article",
        images: [
            {
                url: "/projects/lucrezia-curto/hero-2.webp",
                alt: "Lucrezia Curto brand identity case study",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Lucrezia Curto - Case Study Brand Identity",
        description:
            "Identità visiva per uno studio commercialista, curata da Kremisi.",
        images: ["/projects/lucrezia-curto/hero-2.webp"],
    },
};

function getDocumentHref(fileName) {
    return `${PDF_BASE_PATH}/${fileName}`;
}

function DocumentPreview({ document, index }) {
    return (
        <a
            className={styles.previewCard}
            href={getDocumentHref(document.fileName)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Apri ${document.title}`}
        >
            <Image
                src={`${PDF_BASE_PATH}/${document.previewImage}`}
                width={document.previewWidth}
                height={document.previewHeight}
                alt={`Anteprima ${document.title}`}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 58vw, 34vw"
            />
        </a>
    );
}

function DocumentCard({ document, buttonText = "Apri documento" }) {
    return (
        <article className={styles.documentCard}>
            <div className={styles.documentIconWrap}>
                <FileText size={22} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className={styles.cardTitle}>{document.title}</h3>
                <p className={styles.cardText}>{document.description}</p>
            </div>
            <a
                className={styles.documentLink}
                href={getDocumentHref(document.fileName)}
                target="_blank"
                rel="noopener noreferrer"
            >
                {buttonText}
                <ArrowUpRight size={17} strokeWidth={1.7} />
            </a>
        </article>
    );
}

function DocumentViewer({ document }) {
    const href = getDocumentHref(document.fileName);

    return (
        <article className={styles.documentViewer}>
            <iframe
                className={styles.documentFrame}
                src={href}
                title={document.title}
                loading="lazy"
            />
            <a
                className={styles.documentExpandLink}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
            >
                Ingrandisci PDF
                <ArrowUpRight size={17} strokeWidth={1.7} />
            </a>
        </article>
    );
}

export default function LucreziaCurtoCaseStudyPage() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "Lucrezia Curto - Brand Identity",
        headline: "Lucrezia Curto",
        description:
            "Case study sulla costruzione di una brand identity coerente, professionale e riconoscibile per lo studio commercialista Lucrezia Curto.",
        url: CASE_STUDY_URL,
        image: "https://kremisi.com/projects/lucrezia-curto/hero-2.webp",
        inLanguage: "it",
        author: {
            "@type": "Organization",
            name: "Kremisi",
            url: "https://kremisi.com",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <main className={`page-content-simple ${styles.page}`}>
                <section className={`${styles.section} ${styles.hero}`}>
                    <div className={styles.heroCopy}>
                        <p className={styles.kicker}>Brand Identity</p>
                        <h1 className={styles.pageTitle}>Lucrezia Curto</h1>
                        <p className={styles.heroSubtitle}>
                            Identità visiva per uno studio commercialista
                        </p>
                        <p className={styles.heroText}>
                            Un percorso di brand identity pensato per costruire
                            un&apos;immagine coerente, professionale e riconoscibile,
                            capace di comunicare affidabilità, ordine e competenza
                            nel rapporto con clienti, imprese e professionisti.
                        </p>
                    </div>
                    <div className={styles.heroVisual} aria-label="Materiali grafici del progetto">
                        {documents.map((document, index) => (
                            <DocumentPreview
                                key={document.fileName}
                                document={document}
                                index={index}
                            />
                        ))}
                    </div>
                </section>

                <section className={`${styles.section} ${styles.contextSection}`}>
                    <p className={styles.sectionEyebrow}>Contesto</p>
                    <div className={styles.textGrid}>
                        <h2 className={styles.sectionTitle}>
                            Un&apos;identità ordinata, credibile e pronta a rappresentare uno studio commercialista.
                        </h2>
                        <p className={styles.leadText}>
                            Il progetto nasce dall&apos;esigenza di definire una presenza
                            visiva più chiara per uno studio commercialista. Il lavoro
                            ha messo in relazione tono istituzionale, palette cromatica,
                            logo e applicazioni reali, con l&apos;obiettivo di costruire un
                            sistema riconoscibile ma essenziale per servizi fiscali,
                            contabili e di consulenza.
                        </p>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionEyebrow}>Obiettivo del progetto</p>
                        <h2 className={styles.sectionTitle}>Una direzione visiva solida.</h2>
                    </div>
                    <ul className={styles.goalList}>
                        {goals.map((goal, index) => (
                            <li className={styles.goalItem} key={goal.title}>
                                <span className={styles.goalNumber} aria-hidden="true">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    <h3>{goal.title}</h3>
                                    <p>{goal.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionEyebrow}>Processo creativo</p>
                        <h2 className={styles.sectionTitle}>
                            Dalla ricerca all&apos;applicazione finale.
                        </h2>
                    </div>
                    <div className={styles.processList}>
                        {documents.map((document, index) => (
                            <article className={styles.processItem} key={document.fileName}>
                                <div className={styles.processStep}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    <h3>{document.stepTitle}</h3>
                                    <p>{document.stepText}</p>
                                </div>
                                <DocumentViewer document={document} />
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionEyebrow}>Materiali del progetto</p>
                        <h2 className={styles.sectionTitle}>Documenti consultabili.</h2>
                    </div>
                    <div className={styles.documentsGrid}>
                        {documents.map((document) => (
                            <DocumentCard key={document.fileName} document={document} />
                        ))}
                    </div>
                </section>

                <section className={`${styles.section} ${styles.resultSection}`}>
                    <p className={styles.sectionEyebrow}>Risultato finale</p>
                    <h2 className={styles.resultTitle}>
                        Un&apos;identità più chiara, professionale e coerente.
                    </h2>
                    <p className={styles.resultText}>
                        Il risultato è un sistema visivo pronto per essere applicato
                        online e offline: riconoscibile nei dettagli, misurato nel tono
                        e adatto a comunicare la solidità di uno studio commercialista
                        in modo essenziale.
                    </p>
                </section>

                <section className={`${styles.section} ${styles.ctaSection}`}>
                    <p className={styles.sectionEyebrow}>Prossimo progetto</p>
                    <h2 className={styles.ctaTitle}>
                        Vuoi costruire un&apos;identità visiva più solida?
                    </h2>
                    <p className={styles.ctaText}>
                        Partiamo dal contesto, definiamo una direzione e trasformiamo
                        il brand in un sistema visivo coerente.
                    </p>
                    <AnimatedLink href="/contacts" className={styles.ctaLink}>
                        <GitButton text="Parliamone" leftShift={-20} />
                    </AnimatedLink>
                </section>
            </main>
        </>
    );
}
