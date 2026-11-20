import { getLocale } from "next-intl/server";

export async function generateMetadata() {
    const locale = await getLocale();

    return {
        title: locale === "it" ? "Pagina non trovata" : "Not Found",
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function NotFound() {
    const isItalian = (await getLocale()) === "it";

    return (
        <main className="page-content">
            <h2>{isItalian ? "404 - Pagina non trovata" : "404 - Not Found"}</h2>
            <p>
                {isItalian
                    ? "Il progetto che stai cercando non esiste."
                    : "The project you are looking for does not exist."}
            </p>
        </main>
    );
}
