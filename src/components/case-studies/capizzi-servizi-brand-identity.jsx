import BrandIdentity from "./brand-identity";

const assetPath = "/projects/capizzi-servizi-brand-identity";
const graphicPath = `${assetPath}/graphic`;

const documents = [
    {
        title: { it: "Analisi, concept e moodboard", en: "Research, concept and moodboard" },
        fileName: "CAPIZZI-SERVIZI-Concept-AnalisiMercato-Moodboard.pdf",
        previewImage: "concept-preview.webp",
        previewWidth: 900,
        previewHeight: 637,
    },
    {
        title: { it: "Palette colori", en: "Colour palette" },
        fileName: "colori-capizzi-servizi.pdf",
        previewImage: "colori-preview.webp",
        previewWidth: 1600,
        previewHeight: 900,
    },
    {
        title: { it: "Proposte logo", en: "Logo proposals" },
        fileName: "ProposteLogo-CAPIZZI-Servizi.pdf",
        previewImage: "proposte-logo-preview.webp",
        previewWidth: 900,
        previewHeight: 637,
    },
];

const goals = [
    {
        title: { it: "Rendere il marchio riconoscibile", en: "Make the brand recognisable" },
        description: {
            it: "Definire un segno e una palette che distinguano Capizzi Servizi nel settore degli spurghi.",
            en: "Define a mark and a palette that distinguish Capizzi Servizi in the drain services sector.",
        },
    },
    {
        title: { it: "Comunicare rapidità e competenza", en: "Convey speed and expertise" },
        description: {
            it: "Tradurre la prontezza degli interventi in un'identità dinamica, con un pittogramma in movimento e colori ad alto contrasto.",
            en: "Reflect the team's quick response through a dynamic mark and high-contrast colours.",
        },
    },
    {
        title: { it: "Dare spazio al rapporto umano", en: "Keep the human connection visible" },
        description: {
            it: "Far emergere la storia familiare e il tono diretto di chi interviene, spiega il problema e aiuta a risolverlo.",
            en: "Bring out the family story and the straightforward tone of a team that shows up, explains the problem and helps solve it.",
        },
    },
];

const showcase = [
    {
        image: `${assetPath}/brand/moodboard.webp`,
        width: 1600,
        height: 1132,
        title: { it: "Moodboard", en: "Moodboard" },
        text: {
            it: "Acqua, tubazioni e gesti di lavoro danno forma alla ricerca visiva.",
            en: "Water, pipes and hands at work shape the visual research.",
        },
    },
    {
        image: `${assetPath}/brand/marchio.webp`,
        width: 1600,
        height: 1132,
        title: { it: "Marchio", en: "Logo" },
        text: {
            it: "Un pittogramma a vortice richiama il flusso dell'acqua e la rapidità d'intervento.",
            en: "A swirling symbol evokes flowing water and a quick response.",
        },
    },
    {
        image: `${graphicPath}/colori-preview.webp`,
        width: 1600,
        height: 900,
        title: { it: "Palette", en: "Palette" },
        text: {
            it: "Blu elettrico e verde lime danno energia al marchio, con il nero intenso a creare contrasto.",
            en: "Electric blue and lime green energise the brand, with deep black providing contrast.",
        },
    },
    {
        image: `${assetPath}/brand/mockup-abbigliamento.webp`,
        width: 1600,
        height: 1132,
        title: { it: "Abbigliamento", en: "Workwear" },
        text: {
            it: "Il mockup mostra il marchio sul fronte e sul retro della maglietta da lavoro.",
            en: "The mockup shows the logo on the front and back of a work T-shirt.",
        },
    },
];

const copy = {
    it: {
        kicker: "Brand identity",
        title: "Capizzi Servizi",
        subtitle: "Identità visiva per un'impresa di spurghi e manutenzione",
        heroText: "Un marchio pensato per raccontare la rapidità degli interventi e il rapporto di fiducia che una squadra a conduzione familiare costruisce sul territorio.",
        context: "Contesto",
        contextTitle: "Un mestiere che passa di mano in mano.",
        contextText: "Capizzi Servizi nasce dall'esperienza del fondatore nell'edilizia. Nel 2020 ha portato queste competenze nel settore degli spurghi. Da questa storia familiare ha preso forma un'identità che racconta un modo di lavorare concreto, fatto di interventi rapidi e comunicazione chiara.",
        goalLabel: "Obiettivi",
        goalTitle: "Un'identità all'altezza di chi interviene.",
        identityLabel: "Sistema visivo",
        identityTitle: "Dalla ricerca al marchio, fino all'abbigliamento.",
        resultLabel: "Risultato finale",
        resultTitle: "Un segno dinamico per un servizio di fiducia.",
        resultText: "Il vortice richiama il movimento dell'acqua. Il blu elettrico e il verde lime rendono il marchio riconoscibile dal sito all'abbigliamento da lavoro.",
        open: "Apri documento",
    },
    en: {
        kicker: "Brand identity",
        title: "Capizzi Servizi",
        subtitle: "Visual identity for a drain services and maintenance company",
        heroText: "A brand designed to express the team's quick response and the trust a family-run business builds in its local community.",
        context: "Context",
        contextTitle: "A trade passed down through the family.",
        contextText: "Capizzi Servizi grew out of the founder's experience in construction. In 2020 he brought those skills to drain services. That family story shaped an identity rooted in a practical approach to work, quick response and clear communication.",
        goalLabel: "Goals",
        goalTitle: "An identity that reflects the team at work.",
        identityLabel: "Visual system",
        identityTitle: "From research to logo and workwear.",
        resultLabel: "Final result",
        resultTitle: "A dynamic mark for a dependable service.",
        resultText: "The swirling mark evokes the movement of water. Electric blue and lime green make the brand recognisable across the website and workwear.",
        open: "Open document",
    },
};

export default function CapizziServiziBrandIdentity({ locale }) {
    return (
        <BrandIdentity
            locale={locale}
            graphicPath={graphicPath}
            copy={copy}
            documents={documents}
            goals={goals}
            showcase={showcase}
            heroPhoto={`${assetPath}/bg.webp`}
        />
    );
}
