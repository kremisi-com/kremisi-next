import BrandIdentity from "./brand-identity";

const graphicPath = "/projects/lucrezia-curto/graphic";

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

export default function LucreziaCurtoBrandIdentity({ locale }) {
    return (
        <BrandIdentity
            locale={locale}
            graphicPath={graphicPath}
            copy={copy}
            documents={documents}
            goals={goals}
            showcase={showcase}
        />
    );
}
