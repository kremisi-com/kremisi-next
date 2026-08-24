import { getProjectsArray } from "@/lib/projects";

const BASE_URL = "https://kremisi.com";
const LOCALES = ["en", "it"];

export default function sitemap() {
    const lastModified = new Date();

    const staticPaths = [
        "/",
        "/about",
        "/projects",
        "/contacts",
        "/case-studies/brand-identity/lucrezia-curto",
    ];
    const localize = (path) =>
        LOCALES.map((locale) => ({
            url: new URL(`/${locale}${path}`, BASE_URL).toString(),
            lastModified,
            alternates: {
                languages: Object.fromEntries(
                    LOCALES.map((locale) => [
                        locale,
                        new URL(`/${locale}${path}`, BASE_URL).toString(),
                    ])
                ),
            },
        }));

    const staticUrls = staticPaths.flatMap(localize);
    const projectUrls = getProjectsArray().flatMap((project) =>
        localize(project.path)
    );

    return [...staticUrls, ...projectUrls];
}
