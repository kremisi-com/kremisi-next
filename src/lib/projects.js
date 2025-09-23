import projectsData from "@/lib/projects.json";

function getProjectsArray() {
    return Object.entries(projectsData)
        .filter(([_, v]) => v.disabled === undefined || v.disabled === false)
        .map(([key, v]) => ({
            ...v,
            id: key,
            color: v.color || "#FFFFFF",
            images: v.images ? v.images : ["main.png"],
            link: `/projects/${key}`,
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

function getProjectData(id) {
    let ret = projectsData[id];
    const firstId = Object.keys(projectsData)[0];
    ret.nextProject = { ...projectsData[firstId], id: firstId };
    let nextProject = null;
    for (const key of Object.keys(projectsData)) {
        if (projectsData[key].disabled) continue;
        if (key === id) {
            nextProject = true;
            continue;
        }
        if (nextProject) {
            ret.nextProject = { ...projectsData[key], id: key };
            break;
        }
    }
    // console.log("Next project:", ret.nextProject);

    return ret;
}

export {
    getProjectsArray,
    getOrganizedProjects,
    getSortedProjects,
    getProjectData,
};
