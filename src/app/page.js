"use client";

import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import Overview from "@/components/overview/overview";

import {
  getProjectsArray,
  getOrganizedProjects,
  getSortedProjects,
} from "@/lib/projects";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

export default function Home() {
  const projectsDataArray = useMemo(() => getProjectsArray(), []);
  const organizedProjects = useMemo(
    () => getOrganizedProjects(projectsDataArray),
    [projectsDataArray],
  );
  const sortedProjects = useMemo(
    () => getSortedProjects(organizedProjects),
    [organizedProjects],
  );

  return (
    <div className={styles.page}>
      <div className="slider-wrapper">
        <MainSlider
          projectsData={sortedProjects}
          slideByScroll={true}
          onDiscoverMoreClick={() => {
            console.log("ciao");
          }}
        />
      </div>

      <Overview />
    </div>
  );
}
