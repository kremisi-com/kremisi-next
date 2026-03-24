"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";
import { trackViewItemList } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

export default function MainSlider({
  projectsData,
  onDiscoverMoreClick,
  slideByScroll = true,
  reopenSignal = 0,
}) {
  const duplicatedProjectsData = useMemo(
    () => [...projectsData, ...projectsData],
    [projectsData],
  );

  const animationDurationInitial = 2000;
  const animationStartDelayMs = 500;
  const leaveAnimationDuration = 3200;
  const animationTargetScroll = 0;
  const slideSize = 120;
  const chunksNumber = 5;
  const relativeChunkSize = 1 / chunksNumber;
  const speed = 30;
  const touchMultiplier = 1.2;
  const autoScrollSpeed = 5;
  const baseWidth = 450;
  const baseHeight = 275;
  const scaleFactor = 1;

  const sliderSize = slideSize * duplicatedProjectsData.length;
  const sliderCenter = -slideSize * (duplicatedProjectsData.length / 2);
  const starterScrollPosition = sliderCenter * 4;
  const leaveTargetScroll = Math.abs(starterScrollPosition) + sliderSize * 0.4;

  const initialSlidesPositions = useMemo(
    () =>
      duplicatedProjectsData.map(
        (_, index) =>
          (duplicatedProjectsData.length - 1) * slideSize - index * slideSize,
      ),
    [duplicatedProjectsData, slideSize],
  );

  const initialSlidesDisplayed = useMemo(
    () => duplicatedProjectsData.map(() => true),
    [duplicatedProjectsData],
  );

  const chunks = useMemo(() => {
    const nextChunks = Array.from({ length: chunksNumber }, (_, i) =>
      Math.round(relativeChunkSize * (i + 1) * duplicatedProjectsData.length),
    );
    nextChunks.unshift(0);
    return nextChunks;
  }, [chunksNumber, duplicatedProjectsData.length, relativeChunkSize]);

  const findActualChunk = useCallback(
    (scroll) => {
      const mod = -(sliderCenter + scroll) / sliderSize;
      return Math.floor(mod / relativeChunkSize);
    },
    [relativeChunkSize, sliderCenter, sliderSize],
  );

  const [animationEnded, setAnimationEnded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(
    `${animationDurationInitial}ms`,
  );
  const [percentageLoaded, setPercentageLoaded] = useState(0);
  const [slidesPositions, setSlidesPositions] = useState(
    initialSlidesPositions,
  );
  const [areSlidesDisplayed, setAreSlidesDisplayed] = useState(
    initialSlidesDisplayed,
  );
  const [slope, setSlope] = useState(1);
  const [, startTransition] = useTransition();

  const initialChunk = findActualChunk(animationTargetScroll);
  const scrollRef = useRef(starterScrollPosition);
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const titlePointerRef = useRef({ x: -9999, y: -9999 });
  const titleStateRef = useRef({ text: "", darkText: false });
  const actualChunkRef = useRef(initialChunk);
  const slidesPositionsRef = useRef(initialSlidesPositions);
  const areSlidesDisplayedRef = useRef(initialSlidesDisplayed);
  const tickingRef = useRef(false);
  const touchStateRef = useRef({
    active: false,
    pointerId: null,
    lastY: 0,
  });
  const animationStartedRef = useRef(false);
  const animationStartTimeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const leaveAnimationFrameRef = useRef(null);
  const reopenAnimationTimeoutRef = useRef(null);
  const handledReopenSignalRef = useRef(0);

  useEffect(() => {
    trackViewItemList("Project Slider");
  }, []);

  useEffect(() => {
    function updateSlope() {
      setSlope(window.innerHeight / window.innerWidth);
    }

    updateSlope();
    window.addEventListener("resize", updateSlope);
    return () => window.removeEventListener("resize", updateSlope);
  }, []);

  useEffect(() => {
    slidesPositionsRef.current = slidesPositions;
  }, [slidesPositions]);

  useEffect(() => {
    areSlidesDisplayedRef.current = areSlidesDisplayed;
  }, [areSlidesDisplayed]);

  const horizontalShift = (slope - 1.2) * 350;
  const minWidth = baseWidth * 0.8;
  const minHeight = baseHeight * 0.8;
  const imageWidth = Math.max(
    Math.round((baseWidth * scaleFactor) / (slope * 1.3)),
    minWidth,
  );
  const imageHeight = Math.max(
    Math.round((baseHeight * scaleFactor) / (slope * 1.3)),
    minHeight,
  );

  const getSliderTransform = useCallback(
    (scroll) =>
      `translate(${-scroll + sliderSize / 2 + horizontalShift}px, ${scroll - sliderSize / 2}px)`,
    [horizontalShift, sliderSize],
  );

  const syncSliderTransform = useCallback(
    (scroll) => {
      if (!sliderRef.current) return;
      sliderRef.current.style.transform = getSliderTransform(scroll);
    },
    [getSliderTransform],
  );

  const syncTitleContent = useCallback((title, isDarkText) => {
    if (!titleRef.current) return;
    titleRef.current.textContent = title;
    titleRef.current.style.color = isDarkText ? "black" : "white";
  }, []);

  const shiftChunkLayout = useCallback(
    (fromChunk, direction, basePositions) => {
      const nextChunk = (fromChunk + direction + chunksNumber) % chunksNumber;
      let chunkToMove = (nextChunk + 3 * -direction) % chunksNumber;
      if (chunkToMove < 0) chunkToMove = chunksNumber + chunkToMove;

      let indexesToMove = [];
      for (let i = chunks[chunkToMove]; i < chunks[chunkToMove + 1]; i += 1) {
        indexesToMove.push(i);
      }
      indexesToMove = indexesToMove.map(
        (i) => duplicatedProjectsData.length - 1 - i,
      );

      const newDisplay = Array(duplicatedProjectsData.length).fill(true);
      indexesToMove.forEach((i) => {
        newDisplay[i] = false;
      });

      const newPositions = [...basePositions];
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

      const newStartPosition =
        direction === 1
          ? globalMax + slideSize
          : globalMin - slideSize - chunkSpan;

      indexesToMove.forEach((i, idx) => {
        newPositions[i] = newStartPosition + offsets[idx];
      });

      return {
        chunk: nextChunk,
        display: newDisplay,
        positions: newPositions,
      };
    },
    [chunks, chunksNumber, duplicatedProjectsData.length, slideSize],
  );

  const onChunkChange = useCallback(
    (oldChunk, chunk) => {
      const forwardDistance = (chunk - oldChunk + chunksNumber) % chunksNumber;
      const backwardDistance = (oldChunk - chunk + chunksNumber) % chunksNumber;

      if (forwardDistance === 0) return;

      const direction = forwardDistance <= backwardDistance ? 1 : -1;
      const steps = Math.min(forwardDistance, backwardDistance);

      let nextChunk = oldChunk;
      let nextPositions = slidesPositionsRef.current;
      let nextDisplay = areSlidesDisplayedRef.current;

      for (let step = 0; step < steps; step += 1) {
        const layout = shiftChunkLayout(nextChunk, direction, nextPositions);
        nextChunk = layout.chunk;
        nextPositions = layout.positions;
        nextDisplay = layout.display;
      }

      actualChunkRef.current = nextChunk;
      slidesPositionsRef.current = nextPositions;
      areSlidesDisplayedRef.current = nextDisplay;

      startTransition(() => {
        setAreSlidesDisplayed(nextDisplay);
        setSlidesPositions(nextPositions);
      });
    },
    [chunksNumber, shiftChunkLayout, startTransition],
  );

  const syncChunkForScroll = useCallback(
    (scroll) => {
      if (!animationEnded) return;
      const newChunk = findActualChunk(scroll);
      if (newChunk !== actualChunkRef.current) {
        onChunkChange(actualChunkRef.current, newChunk);
      }
    },
    [animationEnded, findActualChunk, onChunkChange],
  );

  const setScrollValue = useCallback(
    (scroll) => {
      scrollRef.current = scroll;
      syncSliderTransform(scroll);
      syncChunkForScroll(scroll);
    },
    [syncChunkForScroll, syncSliderTransform],
  );

  const runAnimation = useCallback(() => {
    if (animationStartedRef.current) return;

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    setPercentageLoaded(100);
    animationStartedRef.current = true;
    setIsLeaving(false);
    setScrollValue(animationTargetScroll);

    animationTimeoutRef.current = window.setTimeout(() => {
      setAnimationEnded(true);
      setAnimationDuration(".1s");
      animationStartedRef.current = false;
      animationTimeoutRef.current = null;
    }, animationDurationInitial);
  }, [animationDurationInitial, animationTargetScroll, setScrollValue]);

  const scheduleRunAnimation = useCallback(() => {
    if (animationStartedRef.current) return;

    if (animationStartTimeoutRef.current) {
      window.clearTimeout(animationStartTimeoutRef.current);
    }

    animationStartTimeoutRef.current = window.setTimeout(() => {
      animationStartTimeoutRef.current = null;
      runAnimation();
    }, animationStartDelayMs);
  }, [animationStartDelayMs, runAnimation]);

  const applyScrollShift = useCallback(
    (shift) => {
      if (shift === 0) return;
      scrollRef.current += shift;

      if (tickingRef.current) return;

      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        setScrollValue(scrollRef.current);
        tickingRef.current = false;
      });
    },
    [setScrollValue],
  );

  const handleScroll = useCallback(
    (e) => {
      applyScrollShift(e.deltaY > 0 ? -speed : speed);
    },
    [applyScrollShift, speed],
  );

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
    [applyScrollShift, touchMultiplier],
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

  const updateTitleData = useCallback(
    (newTitle, isDarkText) => {
      if (
        titleStateRef.current.text === newTitle &&
        titleStateRef.current.darkText === isDarkText
      ) {
        return;
      }

      titleStateRef.current = {
        text: newTitle,
        darkText: isDarkText,
      };
      syncTitleContent(newTitle, isDarkText);
    },
    [syncTitleContent],
  );

  const handleMouseMove = useCallback(
    (e) => {
      const nextPosition = {
        x: e.clientX + 15,
        y: e.clientY + 2,
      };

      titlePointerRef.current = nextPosition;

      if (!titleRef.current) return;
      titleRef.current.style.transform = `translate3d(${nextPosition.x}px, ${nextPosition.y}px, 0)`;
    },
    [],
  );

  const onImageLoad = useCallback(() => {
    if (animationStartedRef.current) return;

    setPercentageLoaded((prev) => {
      if (animationStartedRef.current) return prev;

      const increment = (1 / duplicatedProjectsData.length) * 100;
      const nextValue = Math.min(prev + increment, 100);

      if (nextValue >= 99.99) {
        scheduleRunAnimation();
        return 99;
      }

      return nextValue;
    });
  }, [duplicatedProjectsData.length, scheduleRunAnimation]);

  const slideStyles = useMemo(
    () =>
      duplicatedProjectsData.map((_, index) => ({
        top: `${slidesPositions[index]}px`,
        right: `${slidesPositions[index]}px`,
        zIndex: slidesPositions[index],
        transition: areSlidesDisplayed[index] ? "all .2s ease" : "0s",
        display: areSlidesDisplayed[index] ? "block" : "none",
      })),
    [areSlidesDisplayed, duplicatedProjectsData, slidesPositions],
  );

  const easeOutCubic = useCallback((value) => 1 - Math.pow(1 - value, 3), []);

  const runLeaveAnimation = useCallback(() => {
    if (animationStartedRef.current || isLeaving || !animationEnded) {
      return false;
    }

    const startScroll = scrollRef.current;
    setAnimationDuration("0s");
    setIsLeaving(true);
    animationStartedRef.current = true;

    const startTime = performance.now();
    const animateLeave = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / leaveAnimationDuration, 1);
      const easedProgress = easeOutCubic(progress);
      const nextScroll =
        startScroll + (leaveTargetScroll - startScroll) * easedProgress;

      setScrollValue(nextScroll);

      if (progress < 1) {
        leaveAnimationFrameRef.current =
          window.requestAnimationFrame(animateLeave);
        return;
      }

      animationStartedRef.current = false;
      leaveAnimationFrameRef.current = null;
    };

    leaveAnimationFrameRef.current = window.requestAnimationFrame(animateLeave);
    return true;
  }, [
    animationEnded,
    easeOutCubic,
    isLeaving,
    leaveAnimationDuration,
    leaveTargetScroll,
    setScrollValue,
  ]);

  const handleDiscoverMore = useCallback(() => {
    const hasStarted = runLeaveAnimation();
    if (!hasStarted) return;
    onDiscoverMoreClick?.(leaveAnimationDuration);
  }, [leaveAnimationDuration, onDiscoverMoreClick, runLeaveAnimation]);

  const resetSliderState = useCallback(() => {
    actualChunkRef.current = findActualChunk(animationTargetScroll);
    animationStartedRef.current = false;
    setAnimationEnded(false);
    setIsLeaving(false);
    setAnimationDuration(`${animationDurationInitial}ms`);
    slidesPositionsRef.current = initialSlidesPositions;
    areSlidesDisplayedRef.current = initialSlidesDisplayed;
    setSlidesPositions(initialSlidesPositions);
    setAreSlidesDisplayed(initialSlidesDisplayed);
    scrollRef.current = starterScrollPosition;
    syncSliderTransform(starterScrollPosition);
  }, [
    animationDurationInitial,
    animationTargetScroll,
    findActualChunk,
    initialSlidesDisplayed,
    initialSlidesPositions,
    starterScrollPosition,
    syncSliderTransform,
  ]);

  useEffect(() => {
    syncSliderTransform(scrollRef.current);
  }, [syncSliderTransform]);

  useEffect(() => {
    if (!titleRef.current) return;
    titleRef.current.style.transform = "translate3d(-9999px, -9999px, 0)";
    syncTitleContent(
      titleStateRef.current.text,
      titleStateRef.current.darkText,
    );
  }, [syncTitleContent]);

  useEffect(() => {
    if (slideByScroll || !animationEnded) return;

    const interval = window.setInterval(() => {
      applyScrollShift(autoScrollSpeed);
    }, 10);

    return () => window.clearInterval(interval);
  }, [animationEnded, applyScrollShift, autoScrollSpeed, slideByScroll]);

  useEffect(() => {
    if (!reopenSignal || reopenSignal === handledReopenSignalRef.current) {
      return;
    }
    if (!isHidden) return;

    if (leaveAnimationFrameRef.current) {
      window.cancelAnimationFrame(leaveAnimationFrameRef.current);
    }
    if (reopenAnimationTimeoutRef.current) {
      window.cancelAnimationFrame(reopenAnimationTimeoutRef.current);
    }

    handledReopenSignalRef.current = reopenSignal;
    setIsHidden(false);
    reopenAnimationTimeoutRef.current = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scheduleRunAnimation();
      });
    });
  }, [isHidden, reopenSignal, scheduleRunAnimation]);

  useEffect(() => {
    if (!isLeaving) return;

    const hideTimer = window.setTimeout(
      () => {
        if (leaveAnimationFrameRef.current) {
          window.cancelAnimationFrame(leaveAnimationFrameRef.current);
          leaveAnimationFrameRef.current = null;
        }
        setIsHidden(true);
        resetSliderState();
      },
      Math.round(leaveAnimationDuration * 0.82),
    );

    return () => window.clearTimeout(hideTimer);
  }, [isLeaving, leaveAnimationDuration, resetSliderState]);

  useEffect(() => {
    return () => {
      if (animationStartTimeoutRef.current) {
        window.clearTimeout(animationStartTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      if (leaveAnimationFrameRef.current) {
        window.cancelAnimationFrame(leaveAnimationFrameRef.current);
      }
      if (reopenAnimationTimeoutRef.current) {
        window.cancelAnimationFrame(reopenAnimationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      onWheel={slideByScroll && !isLeaving ? handleScroll : undefined}
      onMouseMove={slideByScroll && !isLeaving ? handleMouseMove : undefined}
      onPointerDown={
        slideByScroll && !isLeaving ? handlePointerDown : undefined
      }
      onPointerMove={
        slideByScroll && !isLeaving ? handlePointerMove : undefined
      }
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
          ref={sliderRef}
          className={styles.slider}
          style={{
            transform: getSliderTransform(scrollRef.current),
            "--animation-duration": animationDuration,
            "--animation-easing": isLeaving
              ? "cubic-bezier(0.22, 1, 0.36, 1)"
              : "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {duplicatedProjectsData.map((slideData, index) => (
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
          color: titleStateRef.current.darkText ? "black" : "white",
          opacity: animationEnded && !isLeaving ? 1 : 0,
        }}
      >
        {titleStateRef.current.text}
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
