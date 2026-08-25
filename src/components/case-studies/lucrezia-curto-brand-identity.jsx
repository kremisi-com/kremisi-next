import { ArrowUpRight, FileText } from "lucide-react";
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
            it: "La fase iniziale di ricerca, posizionamento e direzione visiva per definire il tono di uno studio commercialista.",
            en: "The initial research, positioning and visual direction used to define the tone of the accounting studio.",
        },
        stepTitle: { it: "Analisi di mercato e moodboard", en: "Market analysis and moodboard" },
        stepText: {
            it: "Il lavoro parte dall'osservazione del contesto fiscale, contabile e consulenziale, per individuare riferimenti visivi credibili e costruire una direzione chiara per lo studio.",
            en: "The work starts by observing the tax, accounting and consulting landscape, identifying credible visual references and a clear direction for the studio.",
        },
    },
    {
        title: { it: "Palette colori", en: "Colour palette" },
        fileName: "colori-lucrezia-curto.pdf",
        previewImage: "colori-lucrezia-curto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description: {
            it: "Una selezione cromatica misurata, pensata per comunicare ordine, fiducia e riconoscibilità in ambito contabile e fiscale.",
            en: "A measured colour selection designed to convey order, trust and recognition in the accounting and tax sector.",
        },
        stepTitle: { it: "Definizione della palette cromatica", en: "Defining the colour palette" },
        stepText: {
            it: "I colori sono stati scelti per sostenere un'immagine professionale e coerente, capace di funzionare sui supporti digitali e sui materiali fisici di uno studio commercialista.",
            en: "Colours were chosen to support a professional, coherent image that works across digital touchpoints and physical materials.",
        },
    },
    {
        title: { it: "Proposte logo", en: "Logo proposals" },
        fileName: "proposta-loghi-LucreziaCurto.pdf",
        previewImage: "proposta-loghi-LucreziaCurto-preview.webp",
        previewWidth: 4224,
        previewHeight: 2376,
        description: {
            it: "Studio delle possibili soluzioni di marchio e logotipo, con attenzione a leggibilità, solidità e autorevolezza professionale.",
            en: "Exploration of logo and wordmark options, focused on legibility, solidity and professional authority.",
        },
        stepTitle: { it: "Studio e proposta dei loghi", en: "Logo study and proposals" },
        stepText: {
            it: "La ricerca sul logo ha esplorato forme essenziali e riconoscibili, mantenendo un equilibrio tra personalità, autorevolezza e affidabilità richieste dalla consulenza fiscale.",
            en: "The logo exploration balanced distinctive, essential forms with the authority and reliability expected in tax consulting.",
        },
    },
    {
        title: { it: "Applicazione su targa", en: "Signage application" },
        fileName: "targa-lucrezia-curto-def.pdf",
        previewImage: "targa-lucrezia-curto-def-preview.webp",
        previewWidth: 1884,
        previewHeight: 1323,
        description: {
            it: "Applicazione finale dell'identità su un supporto concreto, pensato per l'ingresso dello studio commercialista.",
            en: "A final identity application on a physical sign designed for the studio entrance.",
        },
        stepTitle: { it: "Applicazione su targa e materiali fisici", en: "Applying the identity to signage and print" },
        stepText: {
            it: "La direzione visiva è stata tradotta in un'applicazione reale, verificando proporzioni, presenza e chiarezza del sistema identitario in un contesto professionale e consulenziale.",
            en: "The visual direction was tested in a real application, validating proportion, presence and clarity in a professional setting.",
        },
    },
];

const copy = {
    it: {
        context: "Contesto",
        contextTitle: "Un'identità ordinata, credibile e pronta a rappresentare uno studio commercialista.",
        contextText: "Il progetto nasce dall'esigenza di definire una presenza visiva più chiara per uno studio commercialista. Il lavoro ha messo in relazione tono istituzionale, palette, logo e applicazioni reali, con l'obiettivo di costruire un sistema riconoscibile ma essenziale.",
        goalLabel: "Obiettivo del progetto",
        goalTitle: "Una direzione visiva solida.",
        processLabel: "Processo creativo",
        processTitle: "Dalla ricerca all'applicazione finale.",
        materialsLabel: "Materiali del progetto",
        materialsTitle: "Documenti consultabili.",
        resultLabel: "Risultato finale",
        resultTitle: "Un'identità più chiara, professionale e coerente.",
        resultText: "Il risultato è un sistema visivo pronto per essere applicato online e offline: riconoscibile nei dettagli, misurato nel tono e adatto a comunicare la solidità dello studio in modo essenziale.",
        open: "Apri documento",
        expand: "Ingrandisci PDF",
    },
    en: {
        context: "Context",
        contextTitle: "An orderly, credible identity ready to represent an accounting studio.",
        contextText: "The project was born from the need for a clearer visual presence. It brought together an institutional tone, colour palette, logo and real-world applications to create an essential yet recognisable system.",
        goalLabel: "Project goal",
        goalTitle: "A strong visual direction.",
        processLabel: "Creative process",
        processTitle: "From research to the final application.",
        materialsLabel: "Project materials",
        materialsTitle: "Browsable documents.",
        resultLabel: "Final result",
        resultTitle: "A clearer, more professional and coherent identity.",
        resultText: "The result is a visual system ready for online and offline use: recognisable in its details, measured in tone and designed to communicate the studio's solidity with clarity.",
        open: "Open document",
        expand: "Expand PDF",
    },
};

function href(fileName) {
    return `${PDF_BASE_PATH}/${fileName}`;
}

export default function LucreziaCurtoBrandIdentity({ locale = "en" }) {
    const text = copy[locale] || copy.en;

    return (
        <div className={styles.page}>
            <section className={`${styles.section} ${styles.contextSection}`}>
                <p className={styles.sectionEyebrow}>{text.context}</p>
                <div className={styles.textGrid}>
                    <h2 className={styles.sectionTitle}>{text.contextTitle}</h2>
                    <p className={styles.leadText}>{text.contextText}</p>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.processLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.processTitle}</h2>
                </div>
                <div className={styles.processList}>
                    {documents.map((document, index) => (
                        <article className={styles.processItem} key={document.fileName}>
                            <div className={styles.processStep}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{document.stepTitle[locale] || document.stepTitle.en}</h3>
                                <p>{document.stepText[locale] || document.stepText.en}</p>
                            </div>
                            <article className={styles.documentViewer}>
                                <iframe className={styles.documentFrame} src={href(document.fileName)} title={document.title[locale] || document.title.en} loading="lazy" />
                                <a className={styles.documentExpandLink} href={href(document.fileName)} target="_blank" rel="noopener noreferrer">
                                    {text.expand}<ArrowUpRight size={17} strokeWidth={1.7} />
                                </a>
                            </article>
                        </article>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.materialsLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.materialsTitle}</h2>
                </div>
                <div className={styles.documentsGrid}>
                    {documents.map((document) => (
                        <article className={styles.documentCard} key={document.fileName}>
                            <div className={styles.documentIconWrap}><FileText size={22} strokeWidth={1.5} /></div>
                            <div>
                                <h3 className={styles.cardTitle}>{document.title[locale] || document.title.en}</h3>
                                <p className={styles.cardText}>{document.description[locale] || document.description.en}</p>
                            </div>
                            <a className={styles.documentLink} href={href(document.fileName)} target="_blank" rel="noopener noreferrer">
                                {text.open}<ArrowUpRight size={17} strokeWidth={1.7} />
                            </a>
                        </article>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.resultSection}`}>
                <p className={styles.sectionEyebrow}>{text.resultLabel}</p>
                <h2 className={styles.resultTitle}>{text.resultTitle}</h2>
                <p className={styles.resultText}>{text.resultText}</p>
            </section>
        </div>
    );
}
