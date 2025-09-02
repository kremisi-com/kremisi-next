import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import projectsData from "@/json/projects.json";
import { useMemo } from "react";

export default function Home() {
    function prepareProjects(data) {
        return Object.entries(data)
            .filter(
                ([_, v]) => v.disabled === undefined || v.disabled === false
            )
            .map(([key, v]) => ({
                ...v,
                id: key,
                image: `/projects/${key}/main.png`,
                color: v.color || "#FFFFFF",
            }));
    }

    const projectsDataArray = useMemo(() => prepareProjects(projectsData), []);

    return (
        <div className={styles.page}>
            <MainSlider projectsData={projectsDataArray} />
        </div>
    );
}
