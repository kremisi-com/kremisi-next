import projectsData from "@/lib/projects.json";

const BASE_URL = "https://kremisi.com";

export default function sitemap() {
    const lastModified = new Date();

    const staticPaths = ["/", "/about", "/projects", "/contacts"];
    const staticUrls = staticPaths.map((path) => ({
        url: new URL(path, BASE_URL).toString(),
        lastModified,
    }));

    const projectUrls = Object.entries(projectsData)
        .filter(([, project]) => !project.disabled)
        .map(([id]) => ({
            url: new URL(`/projects/${id}`, BASE_URL).toString(),
            lastModified,
        }));

    return [...staticUrls, ...projectUrls];
}
