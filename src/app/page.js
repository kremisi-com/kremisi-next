import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import {
    getProjectsArray,
    getOrganizedProjects,
    getSortedProjects,
} from "@/lib/projects";
import { useMemo } from "react";

export default function Home() {
    const projectsDataArray = useMemo(() => getProjectsArray(), []);
    const organizedProjects = useMemo(
        () => getOrganizedProjects(projectsDataArray),
        [projectsDataArray]
    );
    const sortedProjects = useMemo(
        () => getSortedProjects(organizedProjects),
        [organizedProjects]
    );

    return (
        <div className={styles.page}>
            <MainSlider projectsData={sortedProjects} />
        </div>
    );
}
