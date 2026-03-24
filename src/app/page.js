"use client";

import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import Overview from "@/components/overview/overview";

import {
  getProjectsArray,
  getOrganizedProjects,
  getSortedProjects,
} from "@/lib/projects";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const sequenceTimeoutsRef = useRef([]);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [shouldAnimateOverviewText, setShouldAnimateOverviewText] =
    useState(false);
  const [sliderReopenSignal, setSliderReopenSignal] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlOverflowX: html.style.overflowX,
      htmlOverflowY: html.style.overflowY,
      bodyOverflow: body.style.overflow,
      bodyOverflowX: body.style.overflowX,
      bodyOverflowY: body.style.overflowY,
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
      overscrollBehavior: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = "100dvh";
    body.style.height = "100dvh";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.overflowX = previous.htmlOverflowX;
      html.style.overflowY = previous.htmlOverflowY;
      body.style.overflow = previous.bodyOverflow;
      body.style.overflowX = previous.bodyOverflowX;
      body.style.overflowY = previous.bodyOverflowY;
      html.style.height = previous.htmlHeight;
      body.style.height = previous.bodyHeight;
      body.style.overscrollBehavior = previous.overscrollBehavior;
    };
  }, []);

  useEffect(() => {
    return () => {
      sequenceTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("home-slider-visibility", {
        detail: { isSliderActive: !isOverviewVisible },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("home-slider-visibility", {
          detail: { isSliderActive: false },
        }),
      );
    };
  }, [isOverviewVisible]);

  useEffect(() => {
    const handleSliderReopen = () => {
      if (!isOverviewVisible || discoverAnimationRef.current) return;

      sequenceTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      sequenceTimeoutsRef.current = [];
      discoverAnimationRef.current = false;
      setShouldAnimateOverviewText(false);
      setIsOverviewVisible(false);
      setSliderReopenSignal((current) => current + 1);
    };

    window.addEventListener("home-slider-reopen", handleSliderReopen);
    return () => {
      window.removeEventListener("home-slider-reopen", handleSliderReopen);
    };
  }, [isOverviewVisible]);

  const handleOverviewFadeComplete = useCallback(() => {
    discoverAnimationRef.current = false;
    setShouldAnimateOverviewText(true);
  }, []);

  const handleDiscoverMoreClick = useCallback((duration = 2000) => {
    if (discoverAnimationRef.current) return;

    discoverAnimationRef.current = true;
    setShouldAnimateOverviewText(false);

    const overviewRevealDelay = Math.round(duration * 0.62);

    sequenceTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    sequenceTimeoutsRef.current = [];

    const startOverviewFade = window.setTimeout(() => {
      setIsOverviewVisible(true);
    }, overviewRevealDelay);

    sequenceTimeoutsRef.current.push(startOverviewFade);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.overviewWrapper}>
        <Overview
          isVisible={isOverviewVisible}
          textShouldAnimate={shouldAnimateOverviewText}
          onFadeInComplete={handleOverviewFadeComplete}
        />
      </div>

      <div className={styles.sliderWrapper}>
        <MainSlider
          projectsData={sortedProjects}
          slideByScroll={true}
          onDiscoverMoreClick={handleDiscoverMoreClick}
          reopenSignal={sliderReopenSignal}
        />
      </div>
    </div>
  );
}
