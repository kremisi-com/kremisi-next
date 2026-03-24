"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";
import { useTransition } from "react";
import { trackViewItemList } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

export default function MainSlider({
  projectsData,
  onDiscoverMoreClick,
  slideByScroll = true,
  reopenSignal = 0,
}) {
  projectsData = useMemo(
    () => [...projectsData, ...projectsData],
    [projectsData],
  );
  const [animationEnded, setAnimationEnded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const animationDurationInitial = 2000;
  const leaveAnimationDuration = 3200;
  const animationTargetScroll = 0;

  const slideSize = 120;
  const sliderSize = slideSize * projectsData.length;
  const sliderCenter = -slideSize * (projectsData.length / 2);
  const starterScrollPosition = sliderCenter * 4;
  const leaveTargetScroll = Math.abs(starterScrollPosition);
  const [scrollPosition, setScrollPosition] = useState(starterScrollPosition);
  const initialSlidesPositions = useMemo(
    () =>
      projectsData.map(
        (_, index) => (projectsData.length - 1) * slideSize - index * slideSize,
      ),
    [projectsData, slideSize],
  );
  const initialSlidesDisplayed = useMemo(
    () => projectsData.map(() => true),
    [projectsData],
  );

  const chunksNumber = 5;
  const relativeChunkSize = 1 / chunksNumber;
  const chunks = Array.from({ length: chunksNumber }, (_, i) =>
    Math.round(relativeChunkSize * (i + 1) * projectsData.length),
  );
  chunks.unshift(0);

  const [animationDuration, setAnimationDuration] = useState(
    `${animationDurationInitial}ms`,
  );

  const findActualChunk = useCallback(
    (scroll) => {
      const mod = -(sliderCenter + scroll) / sliderSize;
      const chunkNumber = Math.floor(mod / relativeChunkSize);
      return chunkNumber;
    },
    [relativeChunkSize, sliderCenter, sliderSize],
  );

  let [actualChunk, setActualChunk] = useState(
    findActualChunk(animationTargetScroll),
  );
  useEffect(() => {
    trackViewItemList("Project Slider");
  }, []);

  const scrollRef = useRef(scrollPosition);
  const ticking = useRef(false);
  const touchStateRef = useRef({
    active: false,
    pointerId: null,
    lastY: 0,
  });
  const animationStartedRef = useRef(false);
  const leaveAnimationTimeoutRef = useRef(null);
  const reopenAnimationTimeoutRef = useRef(null);
  const handledReopenSignalRef = useRef(0);

  const runAnimation = useCallback(() => {
    if (animationStartedRef.current) return;
    setPercentageLoaded(100);
    animationStartedRef.current = true;
    setIsLeaving(false);
    setScrollPosition(animationTargetScroll);
    setTimeout(() => {
      setAnimationEnded(true);
      setAnimationDuration(".1s");
      animationStartedRef.current = false;
    }, animationDurationInitial);
  }, [animationDurationInitial, animationTargetScroll]);

  // ------------------- SCROLL MANAGEMENT ------------------------- //
  const speed = 30;
  useEffect(() => {
    scrollRef.current = scrollPosition;
  }, [scrollPosition]);

  const applyScrollShift = useCallback((shift) => {
    if (shift === 0) return;
    scrollRef.current += shift;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        setScrollPosition(scrollRef.current);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  const handleScroll = useCallback(
    (e) => {
      const shift = e.deltaY > 0 ? -speed : speed;
      applyScrollShift(shift);
    },
    [applyScrollShift],
  );

  const touchMultiplier = 1.2;

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType !== "touch") return;
    touchStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastY: e.clientY,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {
      // Some browsers might not support setPointerCapture on this element.
    }
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const state = touchStateRef.current;
      if (!state.active || state.pointerId !== e.pointerId) return;
      e.preventDefault();
      const deltaY = e.clientY - state.lastY;
      state.lastY = e.clientY;
      applyScrollShift(deltaY * touchMultiplier);
    },
    [applyScrollShift],
  );

  const endTouch = useCallback((pointerId, currentTarget) => {
    const state = touchStateRef.current;
    if (!state.active || state.pointerId !== pointerId) return;
    state.active = false;
    state.pointerId = null;
    try {
      currentTarget.releasePointerCapture(pointerId);
    } catch (_) {
      // Ignore if release is not supported.
    }
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      endTouch(e.pointerId, e.currentTarget);
    },
    [endTouch],
  );

  const handlePointerCancel = useCallback(
    (e) => {
      endTouch(e.pointerId, e.currentTarget);
    },
    [endTouch],
  );

  // ------------------- LABEL MANAGEMENT ------------------------- //
  const titleRef = useRef(null);
  const titlePointerRef = useRef({ x: -9999, y: -9999 });
  const titleFrameRef = useRef(null);
  const [darkText, setDarkText] = useState(false);
  const [title, setTitle] = useState("");

  const updateTitleData = useCallback((newTitle, isDarkText) => {
    setTitle(newTitle);
    setDarkText(isDarkText);
  }, []);

  const flushTitlePosition = useCallback(() => {
    titleFrameRef.current = null;

    if (!titleRef.current) return;

    const { x, y } = titlePointerRef.current;
    titleRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const handleMouseMove = useCallback((e) => {
    titlePointerRef.current = {
      x: e.clientX + 15,
      y: e.clientY + 2,
    };

    if (titleFrameRef.current) return;
    titleFrameRef.current = window.requestAnimationFrame(flushTitlePosition);
  }, [flushTitlePosition]);

  useEffect(() => {
    if (!titleRef.current) return;
    titleRef.current.style.transform = "translate3d(-9999px, -9999px, 0)";
  }, []);

  // ------------------- IMAGE LOADING ------------------------- //
  const [percentageLoaded, setPercentageLoaded] = useState(0);
  const onImageLoad = useCallback(() => {
    if (animationStartedRef.current) return;
    setPercentageLoaded((prev) => {
      if (animationStartedRef.current) return prev;
      const increment = (1 / projectsData.length) * 100;
      const newValue = Math.min(prev + increment, 100);
      if (newValue >= 99.99) {
        setTimeout(runAnimation, 100);
        return 99;
      }
      return newValue;
    });
  }, [projectsData.length, runAnimation]);

  // ------------------- SLIDES POSITIONS ------------------------- //
  const [slidesPositions, setSlidesPositions] = useState(initialSlidesPositions);
  const [areSlidesDisplayed, setAreSlidesDisplayed] = useState(
    initialSlidesDisplayed,
  );

  // ------------------- CHUNK CHANGE ------------------------- //
  const [, startTransition] = useTransition();

  const onChunkChange = useCallback(
    (oldChunk, chunk) => {
      setActualChunk(chunk);
      const direction = chunk > oldChunk ? 1 : -1;
      let chunkToMove = (chunk + 3 * -direction) % chunksNumber;
      if (chunkToMove < 0) chunkToMove = chunksNumber + chunkToMove;

      let indexesToMove = [];
      for (let i = chunks[chunkToMove]; i < chunks[chunkToMove + 1]; i++)
        indexesToMove.push(i);
      indexesToMove = indexesToMove.map((i) => projectsData.length - 1 - i);

      const newDisplay = Array(projectsData.length).fill(true);
      indexesToMove.forEach((i) => (newDisplay[i] = false));

      const newPositions = [...slidesPositions];
      const chunkPositions = indexesToMove.map((i) => newPositions[i]);
      const chunkMin = Math.min(...chunkPositions);
      const chunkMax = Math.max(...chunkPositions);
      const chunkSpan = chunkMax - chunkMin;
      const offsets = chunkPositions.map((pos) => pos - chunkMin);

      const indexesSet = new Set(indexesToMove);
      const remainingPositions = newPositions.filter(
        (_, idx) => !indexesSet.has(idx),
      );
      const globalMax =
        remainingPositions.length > 0
          ? Math.max(...remainingPositions)
          : chunkMax;
      const globalMin =
        remainingPositions.length > 0
          ? Math.min(...remainingPositions)
          : chunkMin;

      let newStartPosition = 0;
      if (direction === 1) {
        newStartPosition = globalMax + slideSize;
      } else {
        newStartPosition = globalMin - slideSize - chunkSpan;
      }
      indexesToMove.forEach((i, idx) => {
        newPositions[i] = newStartPosition + offsets[idx];
      });

      startTransition(() => {
        setAreSlidesDisplayed(newDisplay);
        setSlidesPositions(newPositions);
      });
    },
    [chunks, chunksNumber, projectsData.length, slideSize, slidesPositions],
  );

  useEffect(() => {
    if (!animationEnded) return;
    const newChunk = findActualChunk(scrollPosition);
    if (newChunk !== actualChunk) onChunkChange(actualChunk, newChunk);
  }, [
    scrollPosition,
    animationEnded,
    actualChunk,
    findActualChunk,
    onChunkChange,
  ]);

  // ------------------- SLIDES SIZES ------------------------- //
  //lo slope dipende dal ratio dello schermo, anche la grandezza delle immagini e la rotazione
  const [slope, setSlope] = useState(1);

  function calcSizeSloped(size) {
    return size / (slope * 1.3);
  }

  useEffect(() => {
    function updateSlope() {
      setSlope(window.innerHeight / window.innerWidth);
    }
    updateSlope();
    window.addEventListener("resize", updateSlope);
    return () => window.removeEventListener("resize", updateSlope);
  }, []);

  const scaleFactor = 1;

  const width = 450;
  const height = 275;

  const minWidth = width * 0.8;
  const minHeight = height * 0.8;

  const imageWidth = Math.max(
    calcSizeSloped(Math.round(width * scaleFactor)),
    minWidth,
  );
  const imageHeight = Math.max(
    calcSizeSloped(Math.round(height * scaleFactor)),
    minHeight,
  );

  // ------------------- AUTO SCROLL ------------------------- //
  const autoScrollSpeed = 5;
  useEffect(() => {
    if (slideByScroll || !animationEnded) return;
    const interval = setInterval(() => {
      applyScrollShift(autoScrollSpeed);
    }, 10);
    return () => clearInterval(interval);
  }, [slideByScroll, applyScrollShift, animationEnded]);

  // --------------------- SLIDES STYLES ------------------------ //

  const slideStyles = useMemo(() => {
    return projectsData.map((_, index) => ({
      top: `${slidesPositions[index]}px`,
      right: `${slidesPositions[index]}px`,
      zIndex: slidesPositions[index],
      transition: areSlidesDisplayed[index] ? "all .2s ease" : "0s",
      display: areSlidesDisplayed[index] ? "block" : "none",
    }));
  }, [projectsData, slidesPositions, areSlidesDisplayed]);

  const horizontalShift = (slope - 1.2) * 350;

  const computeTranslateX = useCallback(
    (scroll) => {
      return -scroll + sliderSize / 2 + horizontalShift;
    },
    [sliderSize, horizontalShift],
  );
  const computeTranslateY = useCallback(
    (scroll) => {
      return scroll - sliderSize / 2;
    },
    [sliderSize],
  );

  // ------------------- DISCOVER MORE CLICK ------------------------- //
  const runLeaveAnimation = useCallback(() => {
    if (animationStartedRef.current || isLeaving || !animationEnded) return false;
    setAnimationDuration(`${leaveAnimationDuration}ms`);
    setIsLeaving(true);
    animationStartedRef.current = true;
    setScrollPosition(leaveTargetScroll);
    leaveAnimationTimeoutRef.current = window.setTimeout(() => {
      animationStartedRef.current = false;
    }, leaveAnimationDuration);
    return true;
  }, [
    animationEnded,
    isLeaving,
    leaveAnimationDuration,
    leaveTargetScroll,
  ]);

  const handleDiscoverMore = useCallback(() => {
    const hasStarted = runLeaveAnimation();
    if (!hasStarted) return;
    onDiscoverMoreClick?.(leaveAnimationDuration);
  }, [leaveAnimationDuration, onDiscoverMoreClick, runLeaveAnimation]);

  const resetSliderState = useCallback(() => {
    const initialChunk = findActualChunk(animationTargetScroll);
    animationStartedRef.current = false;
    setAnimationEnded(false);
    setIsLeaving(false);
    setAnimationDuration(`${animationDurationInitial}ms`);
    setActualChunk(initialChunk);
    setSlidesPositions(initialSlidesPositions);
    setAreSlidesDisplayed(initialSlidesDisplayed);
    scrollRef.current = starterScrollPosition;
    setScrollPosition(starterScrollPosition);
  }, [
    animationDurationInitial,
    animationTargetScroll,
    findActualChunk,
    initialSlidesDisplayed,
    initialSlidesPositions,
    starterScrollPosition,
  ]);

  useEffect(() => {
    if (!reopenSignal || reopenSignal === handledReopenSignalRef.current) return;
    if (!isHidden) return;

    if (leaveAnimationTimeoutRef.current) {
      window.clearTimeout(leaveAnimationTimeoutRef.current);
    }
    if (reopenAnimationTimeoutRef.current) {
      window.clearTimeout(reopenAnimationTimeoutRef.current);
    }

    handledReopenSignalRef.current = reopenSignal;
    setIsHidden(false);
    reopenAnimationTimeoutRef.current = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        runAnimation();
      });
    });
  }, [isHidden, reopenSignal, runAnimation]);

  useEffect(() => {
    if (!isLeaving) return;

    const hideTimer = window.setTimeout(() => {
      setIsHidden(true);
      resetSliderState();
    }, Math.round(leaveAnimationDuration * 0.82));

    return () => window.clearTimeout(hideTimer);
  }, [isLeaving, leaveAnimationDuration, resetSliderState]);

  useEffect(() => {
    return () => {
      if (leaveAnimationTimeoutRef.current) {
        window.clearTimeout(leaveAnimationTimeoutRef.current);
      }
      if (reopenAnimationTimeoutRef.current) {
        window.cancelAnimationFrame(reopenAnimationTimeoutRef.current);
      }
      if (titleFrameRef.current) {
        window.cancelAnimationFrame(titleFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      onWheel={slideByScroll && !isLeaving ? handleScroll : undefined}
      onMouseMove={slideByScroll && !isLeaving ? handleMouseMove : undefined}
      onPointerDown={slideByScroll && !isLeaving ? handlePointerDown : undefined}
      onPointerMove={slideByScroll && !isLeaving ? handlePointerMove : undefined}
      onPointerUp={slideByScroll && !isLeaving ? handlePointerUp : undefined}
      onPointerCancel={
        slideByScroll && !isLeaving ? handlePointerCancel : undefined
      }
      style={{
        touchAction: slideByScroll && !isLeaving ? "none" : "auto",
        overflow: "hidden",
        pointerEvents: isHidden ? "none" : "auto",
      }}
    >
      {percentageLoaded < 99.9 && <Loader percentage={percentageLoaded} />}
      <div
        className={`${styles.sliderScene} ${isLeaving ? styles.sliderSceneLeaving : ""} ${isHidden ? styles.sliderSceneHidden : ""}`}
      >
        <div
          className={styles.slider}
          style={{
            transform: `translate(${computeTranslateX(
              scrollPosition,
            )}px, ${computeTranslateY(scrollPosition)}px)`,
            "--animation-duration": animationDuration,
            "--animation-easing": isLeaving
              ? "cubic-bezier(0.22, 1, 0.36, 1)"
              : "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {projectsData.map((slideData, index) => (
            <Slide
              key={slideData.id + index}
              data={slideData}
              style={slideStyles[index]}
              updateTitleData={updateTitleData}
              onImageLoad={onImageLoad}
              width={imageWidth}
              height={imageHeight}
            />
          ))}
        </div>
        <div className={styles.cinematicVeil} />
      </div>
      <label
        className={`${styles.title} ${isLeaving ? styles.titleLeaving : ""}`}
        ref={titleRef}
        style={{
          color: darkText ? "black" : "white",
          opacity: animationEnded && !isLeaving ? 1 : 0,
        }}
      >
        {title}
      </label>
      <button
        className={`${styles.scrollIndicator} ${isLeaving ? styles.scrollIndicatorLeaving : ""}`}
        style={{ opacity: animationEnded && !isLeaving ? 1 : 0 }}
        onClick={handleDiscoverMore}
        disabled={isLeaving}
      >
        <p>Discover More</p>
        <ArrowRight size={30} />
      </button>
    </div>
  );
}
