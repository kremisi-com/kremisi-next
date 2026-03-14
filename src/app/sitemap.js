import { getProjectsArray } from "@/lib/projects";

const BASE_URL = "https://kremisi.com";

export default function sitemap() {
    const lastModified = new Date();

    const staticPaths = ["/", "/about", "/projects", "/contacts"];
    const staticUrls = staticPaths.map((path) => ({
        url: new URL(path, BASE_URL).toString(),
        lastModified,
    }));

    const projectUrls = getProjectsArray().map((project) => ({
            url: new URL(project.path, BASE_URL).toString(),
            lastModified,
        }));

    return [...staticUrls, ...projectUrls];
}
