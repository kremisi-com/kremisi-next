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

  const currentSection = useRef(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);

    const panels = gsap.utils.toArray(".panel");

    if (!panels.length) return;

    const goToSection = (index) => {
      if (index < 0 || index >= panels.length || isAnimating.current) return;

      isAnimating.current = true;
      currentSection.current = index;

      gsap.to(window, {
        duration: 0.45,
        scrollTo: {
          y: panels[index],
          autoKill: false,
        },
        ease: "power2.out",
        onComplete: () => {
          isAnimating.current = false;
        },
      });
    };

    const handleWheel = (e) => {
      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) {
        e.preventDefault();
        goToSection(currentSection.current + 1);
      } else if (e.deltaY < 0) {
        e.preventDefault();
        goToSection(currentSection.current - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className={styles.page}>
      <section className="panel" style={{ height: "100vh" }}>
        <MainSlider projectsData={sortedProjects} slideByScroll={false} />
      </section>

      <section className="panel" style={{ height: "100vh" }}>
        <Overview />
      </section>
    </div>
  );
}