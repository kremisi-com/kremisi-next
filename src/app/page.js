import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import getProjects from "@/lib/projects";
import { useMemo } from "react";

export default function Home() {
    const projectsDataArray = useMemo(() => getProjects(), []);

    return (
        <div className={styles.page}>
            <MainSlider projectsData={projectsDataArray} />
        </div>
    );
}
