import projectsData from "@/json/projects.json";

function getProjects() {
    return Object.entries(projectsData)
        .filter(([_, v]) => v.disabled === undefined || v.disabled === false)
        .map(([key, v]) => ({
            ...v,
            id: key,
            image: `/projects/${key}/main.png`,
            color: v.color || "#FFFFFF",
        }));
}

export default getProjects;
