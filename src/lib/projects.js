import projectsData from "@/lib/projects.json";

function normalizeProjectSlug(value = "") {
    const normalized = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "project";
}

function getProjectSlug(projectId, projectData = projectsData[projectId]) {
    if (!projectData) return null;

    return normalizeProjectSlug(projectData.slug || projectId);
}

function getProjectPath(projectId, projectData = projectsData[projectId]) {
    const slug = getProjectSlug(projectId, projectData);

    return slug ? `/projects/${slug}` : null;
}

function getEnabledProjectEntries() {
    return Object.entries(projectsData).filter(
        ([, project]) => project.disabled !== true
    );
}

function resolveProjectKey(projectIdentifier) {
    if (!projectIdentifier) return null;
    if (projectsData[projectIdentifier]) return projectIdentifier;

    const projectSlug = normalizeProjectSlug(projectIdentifier);
    const match = getEnabledProjectEntries().find(
        ([projectId, project]) => getProjectSlug(projectId, project) === projectSlug
    );

    return match?.[0] || null;
}

function getProjectHeaderImageAlt(projectData) {
    if (projectData?.headerImageAlt) return projectData.headerImageAlt;

    const subtitle = projectData?.subtitle ? ` ${projectData.subtitle}` : "";
    return `${projectData?.title || "Project"}${subtitle} hero image`;
}

function getProjectCarouselImageAlt(projectData, filename, index) {
    if (projectData?.carouselImageAlts?.[filename]) {
        return projectData.carouselImageAlts[filename];
    }

    return `${projectData?.title || "Project"} showcase image ${index + 1}`;
}

function getProjectPreviewImageAlt(projectData) {
    if (projectData?.previewImageAlt) return projectData.previewImageAlt;

    return `${projectData?.title || "Project"} project preview`;
}

function withProjectSeoData(projectId, projectData) {
    if (!projectData) return null;

    const images = projectData.images ? projectData.images : ["main.webp"];
    const slug = getProjectSlug(projectId, projectData);
    const path = getProjectPath(projectId, projectData);

    return {
        ...projectData,
        id: projectId,
        slug,
        path,
        color: projectData.color || "#FFFFFF",
        images,
        previewImageAlt: getProjectPreviewImageAlt(projectData),
        headerImageAlt: getProjectHeaderImageAlt(projectData),
    };
}

function getProjectsArray() {
    return getEnabledProjectEntries().map(([projectId, project]) => ({
        ...withProjectSeoData(projectId, project),
        externalLink: project.link,
        link: getProjectPath(projectId, project),
    }));
}

function getOrganizedProjects(projectsArray) {
    const ret = {};
    for (const project of projectsArray) {
        ret[project.id] = [];
        for (const img of project.images) {
            let projCopy = {
                ...project,
                image: `/projects/${project.id}/${img}`,
                id: `${project.id}-${img}`,
            };
            ret[project.id].push(projCopy);
        }
    }
    return ret;
}

function getSortedProjects(projectsDict) {
    // Flatten projectsDict into a single array of project items
    const items = Object.values(projectsDict).reduce(
        (acc, arr) => acc.concat(arr),
        []
    );

    // Fisher–Yates shuffle
    // deterministic RNG with constant seed
    function mulberry32(a) {
        return function () {
            var t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const rng = mulberry32(935555555555); // scelta del seed: 935555555555, 9121111111, 9122, 1233789, 9122

    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
    // return [
    //     projectsDict["glapix"][0],
    //     projectsDict["allavelli"][1],
    //     projectsDict["allavelli"][2],
    // ];
}

function getProjectData(projectIdentifier) {
    const projectId = resolveProjectKey(projectIdentifier);
    const project = projectId ? projectsData[projectId] : null;

    if (!project || project.disabled) return null;

    const enabledProjects = getEnabledProjectEntries();
    const projectIndex = enabledProjects.findIndex(([id]) => id === projectId);
    const fallbackIndex = projectIndex >= 0 ? 0 : -1;
    const nextProjectIndex =
        projectIndex >= 0 ? (projectIndex + 1) % enabledProjects.length : fallbackIndex;
    const nextProjectEntry =
        nextProjectIndex >= 0 ? enabledProjects[nextProjectIndex] : null;

    return {
        ...withProjectSeoData(projectId, project),
        nextProject: nextProjectEntry
            ? withProjectSeoData(nextProjectEntry[0], nextProjectEntry[1])
            : null,
    };
}

export {
    getProjectsArray,
    getOrganizedProjects,
    getSortedProjects,
    getProjectData,
    getProjectSlug,
    getProjectPath,
    getProjectHeaderImageAlt,
    getProjectCarouselImageAlt,
    getProjectPreviewImageAlt,
    normalizeProjectSlug,
    resolveProjectKey,
};
