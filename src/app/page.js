"use client";

import styles from "./page.module.css";
import MainSlider from "@/components/main-slider/main-slider";
import Overview from "@/components/overview/overview";
import Services from "@/components/services/services";
import SocialProof from "@/components/social-proof/social-proof";
import Testimonials from "@/components/testimonials/testimonials";
import VideosCta from "@/components/videos-cta/videos-cta";


import {
  getProjectsArray,
  getOrganizedProjects,
  getSortedProjects,
} from "@/lib/projects";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function isOverviewViewInUrl() {
  if (typeof window === "undefined") return false;

  return new URLSearchParams(window.location.search).get("view") === "overview";
}

function syncHomeViewInUrl(isOverviewVisible) {
  if (typeof window === "undefined") return;

  const nextUrl = isOverviewVisible ? "/?view=overview" : "/";
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (currentUrl === nextUrl) return;

  window.history.replaceState({}, "", nextUrl);
}

export default function Home() {
  const overviewRevealAdvanceMs = 500;
  const overviewFadeDurationMs = 1400;
  const overviewTextRevealAdvanceMs = 500;
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
  const initialPageStylesRef = useRef(null);
  const hasMountedRef = useRef(false);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [shouldAnimateOverviewText, setShouldAnimateOverviewText] =
    useState(false);
  const [sliderReopenSignal, setSliderReopenSignal] = useState(0);

  useEffect(() => {
    if (isOverviewViewInUrl()) {
      setIsOverviewVisible(true);
      setShouldAnimateOverviewText(true);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    initialPageStylesRef.current = {
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

    return () => {
      const previous = initialPageStylesRef.current;

      if (!previous) return;

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
    const html = document.documentElement;
    const body = document.body;

    if (isOverviewVisible) {
      html.style.overflow = "auto";
      html.style.overflowX = "hidden";
      html.style.overflowY = "auto";
      body.style.overflow = "auto";
      body.style.overflowX = "hidden";
      body.style.overflowY = "auto";
      html.style.height = "auto";
      body.style.height = "auto";
      body.style.overscrollBehavior = "auto";
      return;
    }

    html.style.overflow = "hidden";
    html.style.overflowX = "hidden";
    html.style.overflowY = "hidden";
    body.style.overflow = "hidden";
    body.style.overflowX = "hidden";
    body.style.overflowY = "hidden";
    html.style.height = "100dvh";
    body.style.height = "100dvh";
    body.style.overscrollBehavior = "none";
  }, [isOverviewVisible]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    syncHomeViewInUrl(isOverviewVisible);
  }, [isOverviewVisible]);

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
  }, []);

  const handleDiscoverMoreClick = useCallback((duration = 2000) => {
    if (discoverAnimationRef.current) return;

    discoverAnimationRef.current = true;
    setShouldAnimateOverviewText(false);

    const overviewRevealDelay = Math.max(
      0,
      Math.round(duration * 0.62) - overviewRevealAdvanceMs,
    );
    const overviewTextRevealDelay = Math.max(
      0,
      overviewRevealDelay +
        overviewFadeDurationMs -
        overviewTextRevealAdvanceMs,
    );

    sequenceTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    sequenceTimeoutsRef.current = [];

    const startOverviewFade = window.setTimeout(() => {
      setIsOverviewVisible(true);
    }, overviewRevealDelay);
    const startOverviewTextAnimation = window.setTimeout(() => {
      setShouldAnimateOverviewText(true);
    }, overviewTextRevealDelay);

    sequenceTimeoutsRef.current.push(startOverviewFade);
    sequenceTimeoutsRef.current.push(startOverviewTextAnimation);
  }, [
    overviewFadeDurationMs,
    overviewRevealAdvanceMs,
    overviewTextRevealAdvanceMs,
  ]);

  return (
    <div
      className={`${styles.page} ${
        isOverviewVisible ? styles.pageOverviewVisible : ""
      }`}
    >
      <div
        className={`${styles.overviewWrapper} ${
          isOverviewVisible ? styles.overviewWrapperVisible : ""
        }`}
        style={{
          pointerEvents: isOverviewVisible ? "auto" : "none",
        }}
      >
        <Overview
          isVisible={isOverviewVisible}
          textShouldAnimate={shouldAnimateOverviewText}
          onFadeInComplete={handleOverviewFadeComplete}
        />
        <div
          style={{
            opacity: isOverviewVisible ? 1 : 0,
            transform: isOverviewVisible ? "translateY(0)" : "translateY(40px)",
            transition:
              "opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <Services />
          <SocialProof />
          <Testimonials />
          <VideosCta />

        </div>
      </div>

      {!isOverviewVisible && (
        <div className={styles.sliderWrapper}>
          <MainSlider
            projectsData={sortedProjects}
            slideByScroll={true}
            onDiscoverMoreClick={handleDiscoverMoreClick}
            reopenSignal={sliderReopenSignal}
          />
        </div>
      )}
    </div>
  );
}
