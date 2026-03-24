"use client";

import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import Overview from "@/components/overview/overview";

import {
  getProjectsArray,
  getOrganizedProjects,
  getSortedProjects,
} from "@/lib/projects";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const discoverAnimationRef = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
  }, []);

  const handleDiscoverMoreClick = useCallback((duration = 2000) => {
    if (discoverAnimationRef.current) return;

    const overviewElement = document.getElementById("overview");
    if (!overviewElement) return;

    discoverAnimationRef.current = true;
    gsap.to(window, {
      duration: duration / 1000,
      ease: "power2.inOut",
      scrollTo: {
        y: overviewElement,
        autoKill: false,
      },
      onComplete: () => {
        discoverAnimationRef.current = false;
      },
      onInterrupt: () => {
        discoverAnimationRef.current = false;
      },
    });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.sliderWrapper}>
        <MainSlider
          projectsData={sortedProjects}
          slideByScroll={true}
          onDiscoverMoreClick={handleDiscoverMoreClick}
        />
      </div>

      <Overview />
    </div>
  );
}
