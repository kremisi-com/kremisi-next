"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";

export default function MainSlider({ projectsData }) {
  const chunksNumber = 3;
  const relativeChunkSize = 1 / chunksNumber;
  const chunks = Array.from(
    { length: chunksNumber },
    (_, i) => relativeChunkSize * (i + 1)
  );
  const chunksIndexes = chunks.map((chunk) =>
    Math.floor(chunk * (projectsData.length - 1))
  );
  const slideSize = 400 / 31;
  const sliderSize = slideSize * projectsData.length;
  function findActualChunk(scroll) {
    const mod = ((scroll % sliderSize) + sliderSize) % sliderSize;
  }

  const sliderCenter = -slideSize * (projectsData.length / 2);
  const [scrollPosition, setScrollPosition] = useState(sliderCenter * 4);
  const animationDurationInitial = 1700;
  const [animationDuration, setAnimationDuration] = useState(
    `${animationDurationInitial}ms`
  );

  const scalingOffset = 15;
  const scrollRef = useRef(scrollPosition);
  const ticking = useRef(false);

  function runAnimation() {
    setScrollPosition(sliderCenter);
    setTimeout(() => {
      setAnimationDuration(".2s");
    }, animationDurationInitial);
  }

  useEffect(() => {
    scrollRef.current = scrollPosition;
  }, [scrollPosition]);

  function handleScroll(e) {
    const speed = 4;
    const shift = e.deltaY > 0 ? -speed : speed;
    scrollRef.current += shift;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        setScrollPosition(scrollRef.current);
        ticking.current = false;
      });
      ticking.current = true;
    }

    console.log(scrollRef.current % sliderSize);
  }

  const titleRef = useRef(null);
  const [darkText, setDarkText] = useState(false);
  const [title, setTitle] = useState("");
  const [translation, setTranslation] = useState("translate(-50%, -50%)");

  const updateTitleData = useCallback((newTitle, isDarkText) => {
    setTitle(newTitle);
    setDarkText(isDarkText);
  }, []);

  function handleMouseMove(e) {
    const x = e.clientX + 15;
    const y = e.clientY + 2;

    setTranslation(`translate(${x}px, ${y}px)`);
  }

  const slideStyles = useMemo(() => {
    const maxIdx = projectsData.length - 1;
    return projectsData.map((_, index) => ({
      top: `${maxIdx * scalingOffset - index * scalingOffset}vh`,
      right: `${maxIdx * scalingOffset - index * scalingOffset}vh`,
      zIndex: projectsData.length - index,
    }));
  }, [projectsData, scalingOffset]);

  const [percentageLoaded, setPercentageLoaded] = useState(0);
  const onImageLoad = useCallback(() => {
    setPercentageLoaded((prev) => {
      const newValue = prev + (1 / projectsData.length / 2) * 100;
      if (newValue > 99) runAnimation();
      return newValue;
    });
  }, [projectsData.length]);

  return (
    <>
      {percentageLoaded < 99 && <Loader percentage={percentageLoaded} />}
      <div
        className={styles.slider}
        onWheel={handleScroll}
        style={{
          transform: `translate(${
            -scrollPosition - 20
          }vh, ${scrollPosition}vh)`,
          "--animation-duration": animationDuration,
        }}
        onMouseMove={handleMouseMove}
      >
        {projectsData.map((slideData, index) => (
          <Slide
            key={slideData.id + index}
            data={slideData}
            style={slideStyles[index]}
            updateTitleData={updateTitleData}
            onImageLoad={onImageLoad}
          />
        ))}
      </div>
      <label
        className={styles.title}
        ref={titleRef}
        style={{
          color: darkText ? "black" : "white",
          transform: translation,
        }}
      >
        {title}
      </label>
    </>
  );
}
