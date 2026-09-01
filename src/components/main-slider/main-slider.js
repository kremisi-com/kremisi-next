"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";
import { trackViewItemList } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { SLIDER_IMAGE_LOADING_CONFIG } from "./image-loading-config.mjs";

export default function MainSlider({
  projectsData,
  onDiscoverMoreClick,
  reopenSignal = 0,
  sessionMode = "initial",
  isActive = true,
}) {
  const t = useTranslations("cta");
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
  const autoScrollSpeed = 120;
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
  const [percentageLoaded, setPercentageLoaded] = useState(0);
  const [slidesPositions, setSlidesPositions] = useState(
    initialSlidesPositions,
  );
  const [areSlidesDisplayed, setAreSlidesDisplayed] = useState(
    initialSlidesDisplayed,
  );
  const [slope, setSlope] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasManualInteraction, setHasManualInteraction] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [, startTransition] = useTransition();

  const initialChunk = findActualChunk(animationTargetScroll);
  const scrollRef = useRef(starterScrollPosition);
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const titlePointerRef = useRef({ x: -9999, y: -9999 });
  const titlePointerAnimationFrameRef = useRef(null);
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
  const animationEndedRef = useRef(false);
  const animationStartTimeoutRef = useRef(null);
  const introAnimationFrameRef = useRef(null);
  const leaveAnimationFrameRef = useRef(null);
  const autoScrollAnimationFrameRef = useRef(null);
  const autoScrollLastTimestampRef = useRef(null);
  const reopenAnimationTimeoutRef = useRef(null);
  const imageLoadTimeoutRef = useRef(null);
  const handledReopenSignalRef = useRef(0);
  const hasManualInteractionRef = useRef(false);

  useEffect(() => {
    const handleMenuVisibility = (e) => {
      setIsMenuOpen(e.detail.isMenuOpen);
    };

    window.addEventListener("mobile-menu-visibility", handleMenuVisibility);
    return () => {
      window.removeEventListener("mobile-menu-visibility", handleMenuVisibility);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    hasManualInteractionRef.current = false;
    setHasManualInteraction(false);
  }, [reopenSignal, sessionMode]);

  useEffect(() => {
    trackViewItemList("Project Slider");
  }, []);

  useLayoutEffect(() => {
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
      if (!animationEndedRef.current) return;
      const newChunk = findActualChunk(scroll);
      if (newChunk !== actualChunkRef.current) {
        onChunkChange(actualChunkRef.current, newChunk);
      }
    },
    [findActualChunk, onChunkChange],
  );

  const setScrollValue = useCallback(
    (scroll) => {
      scrollRef.current = scroll;
      syncSliderTransform(scroll);
      syncChunkForScroll(scroll);
    },
    [syncChunkForScroll, syncSliderTransform],
  );

  const animateAutoScroll = useCallback(
    (timestamp) => {
      const previousTimestamp = autoScrollLastTimestampRef.current;
      autoScrollLastTimestampRef.current = timestamp;

      if (previousTimestamp !== null) {
        const elapsed = Math.min(timestamp - previousTimestamp, 100);
        setScrollValue(
          scrollRef.current + (autoScrollSpeed * elapsed) / 1000,
        );
      }

      autoScrollAnimationFrameRef.current =
        window.requestAnimationFrame(animateAutoScroll);
    },
    [autoScrollSpeed, setScrollValue],
  );

  const runAnimation = useCallback(() => {
    if (animationStartedRef.current) return;

    if (imageLoadTimeoutRef.current) {
      window.clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }

    if (introAnimationFrameRef.current) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
      introAnimationFrameRef.current = null;
    }

    setPercentageLoaded(100);
    animationStartedRef.current = true;
    setIsLeaving(false);

    const startScroll = scrollRef.current;
    const scrollDistance = animationTargetScroll - startScroll;
    const durationSeconds = animationDurationInitial / 1000;
    const continuousSpeedBlend =
      scrollDistance === 0
        ? 1
        : Math.min(
            Math.max((autoScrollSpeed * durationSeconds) / scrollDistance, 0),
            1,
          );
    let startTime = null;

    const animateIntro = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDurationInitial, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const blendedProgress =
        easeOutProgress * (1 - continuousSpeedBlend) +
        progress * continuousSpeedBlend;

      setScrollValue(startScroll + scrollDistance * blendedProgress);

      if (progress < 1) {
        introAnimationFrameRef.current =
          window.requestAnimationFrame(animateIntro);
        return;
      }

      autoScrollLastTimestampRef.current = timestamp;
      introAnimationFrameRef.current = null;
      animationStartedRef.current = false;
      animationEndedRef.current = true;
      setAnimationEnded(true);
    };

    introAnimationFrameRef.current = window.requestAnimationFrame(animateIntro);
  }, [
    animationDurationInitial,
    animationTargetScroll,
    autoScrollSpeed,
    setScrollValue,
  ]);

  const scheduleRunAnimation = useCallback(() => {
    if (animationStartedRef.current || !isActive) return;

    if (animationStartTimeoutRef.current) {
      window.clearTimeout(animationStartTimeoutRef.current);
    }

    animationStartTimeoutRef.current = window.setTimeout(() => {
      animationStartTimeoutRef.current = null;
      runAnimation();
    }, animationStartDelayMs);
  }, [animationStartDelayMs, isActive, runAnimation]);

  useEffect(() => {
    if (animationEnded || !isActive) return;

    imageLoadTimeoutRef.current = window.setTimeout(() => {
      imageLoadTimeoutRef.current = null;
      scheduleRunAnimation();
    }, SLIDER_IMAGE_LOADING_CONFIG.initialPreviewLoadTimeoutMs);

    return () => {
      if (imageLoadTimeoutRef.current) {
        window.clearTimeout(imageLoadTimeoutRef.current);
        imageLoadTimeoutRef.current = null;
      }
    };
  }, [animationEnded, isActive, scheduleRunAnimation]);

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

  const scheduleTitlePosition = useCallback((clientX, clientY) => {
    titlePointerRef.current = {
      x: clientX + 15,
      y: clientY + 2,
    };

    if (titlePointerAnimationFrameRef.current) return;

    titlePointerAnimationFrameRef.current = window.requestAnimationFrame(() => {
      titlePointerAnimationFrameRef.current = null;
      if (!titleRef.current) return;

      const { x, y } = titlePointerRef.current;
      titleRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, []);

  const markManualInteraction = useCallback(() => {
    if (hasManualInteractionRef.current) return;
    hasManualInteractionRef.current = true;
    setHasManualInteraction(true);
  }, []);

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
        transition: areSlidesDisplayed[index]
          ? "top .2s ease, right .2s ease"
          : "0s",
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

  const isInitialSession = sessionMode === "initial";

  const handleScroll = useCallback(
    (e) => {
      if (!animationEnded || isLeaving) return;

      if (isInitialSession) {
        if (e.deltaY > 0) handleDiscoverMore();
        return;
      }

      markManualInteraction();
      applyScrollShift(e.deltaY > 0 ? -speed : speed);
    },
    [
      animationEnded,
      applyScrollShift,
      handleDiscoverMore,
      isInitialSession,
      isLeaving,
      markManualInteraction,
      speed,
    ],
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
      if (e.pointerType === "mouse") {
        scheduleTitlePosition(e.clientX, e.clientY);
        return;
      }

      const state = touchStateRef.current;
      if (!state.active || state.pointerId !== e.pointerId || !animationEnded) {
        return;
      }

      e.preventDefault();
      const deltaY = e.clientY - state.lastY;
      state.lastY = e.clientY;

      if (isInitialSession) {
        if (deltaY < 0) {
          state.active = false;
          handleDiscoverMore();
        }
        return;
      }

      markManualInteraction();
      applyScrollShift(deltaY * touchMultiplier);
    },
    [
      animationEnded,
      applyScrollShift,
      handleDiscoverMore,
      isInitialSession,
      markManualInteraction,
      scheduleTitlePosition,
      touchMultiplier,
    ],
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

  const resetSliderState = useCallback(() => {
    actualChunkRef.current = findActualChunk(animationTargetScroll);
    animationStartedRef.current = false;
    animationEndedRef.current = false;
    if (introAnimationFrameRef.current) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
      introAnimationFrameRef.current = null;
    }
    if (autoScrollAnimationFrameRef.current) {
      window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
      autoScrollAnimationFrameRef.current = null;
    }
    autoScrollLastTimestampRef.current = null;
    setAnimationEnded(false);
    setIsLeaving(false);
    slidesPositionsRef.current = initialSlidesPositions;
    areSlidesDisplayedRef.current = initialSlidesDisplayed;
    setSlidesPositions(initialSlidesPositions);
    setAreSlidesDisplayed(initialSlidesDisplayed);
    scrollRef.current = starterScrollPosition;
    syncSliderTransform(starterScrollPosition);
  }, [
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
    const shouldAutoScroll =
      animationEnded &&
      !isLeaving &&
      !isHidden &&
      isActive &&
      !prefersReducedMotion &&
      (isInitialSession || !hasManualInteraction);

    if (!shouldAutoScroll) return;

    if (!autoScrollAnimationFrameRef.current) {
      autoScrollAnimationFrameRef.current = window.requestAnimationFrame(
        animateAutoScroll,
      );
    }

    return () => {
      if (autoScrollAnimationFrameRef.current) {
        window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
        autoScrollAnimationFrameRef.current = null;
      }
      autoScrollLastTimestampRef.current = null;
    };
  }, [
    animationEnded,
    animateAutoScroll,
    hasManualInteraction,
    isHidden,
    isActive,
    isInitialSession,
    isLeaving,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    if (!reopenSignal || reopenSignal === handledReopenSignalRef.current) {
      return;
    }

    if (leaveAnimationFrameRef.current) {
      window.cancelAnimationFrame(leaveAnimationFrameRef.current);
      leaveAnimationFrameRef.current = null;
    }
    if (reopenAnimationTimeoutRef.current) {
      window.cancelAnimationFrame(reopenAnimationTimeoutRef.current);
      reopenAnimationTimeoutRef.current = null;
    }

    handledReopenSignalRef.current = reopenSignal;
    setIsHidden(false);
    resetSliderState();
    reopenAnimationTimeoutRef.current = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        reopenAnimationTimeoutRef.current = null;
        scheduleRunAnimation();
      });
    });
  }, [reopenSignal, resetSliderState, scheduleRunAnimation]);

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
      if (introAnimationFrameRef.current) {
        window.cancelAnimationFrame(introAnimationFrameRef.current);
      }
      if (leaveAnimationFrameRef.current) {
        window.cancelAnimationFrame(leaveAnimationFrameRef.current);
      }
      if (autoScrollAnimationFrameRef.current) {
        window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
      }
      if (titlePointerAnimationFrameRef.current) {
        window.cancelAnimationFrame(titlePointerAnimationFrameRef.current);
      }
      if (reopenAnimationTimeoutRef.current) {
        window.cancelAnimationFrame(reopenAnimationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden={!isActive}
      onWheel={!isLeaving ? handleScroll : undefined}
      onPointerDown={
        !isLeaving ? handlePointerDown : undefined
      }
      onPointerMove={
        !isLeaving ? handlePointerMove : undefined
      }
      onPointerUp={!isLeaving ? handlePointerUp : undefined}
      onPointerCancel={
        !isLeaving ? handlePointerCancel : undefined
      }
      style={{
        touchAction: !isLeaving ? "none" : "auto",
        overflow: "hidden",
        visibility: isActive ? "visible" : "hidden",
        pointerEvents: isActive && !isHidden ? "auto" : "none",
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
            "--animation-duration": "0s",
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
              onPreviewLoad={onImageLoad}
              onPreviewError={onImageLoad}
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
          opacity: isActive && animationEnded && !isLeaving ? 1 : 0,
        }}
      >
        {titleStateRef.current.text}
      </label>
      <button
        className={`${styles.scrollIndicator} ${isLeaving ? styles.scrollIndicatorLeaving : ""} ${isMenuOpen ? styles.menuOpen : ""}`}
        style={{ 
          opacity: isActive && animationEnded && !isLeaving ? 1 : 0,
          pointerEvents:
            isActive && animationEnded && !isLeaving ? "auto" : "none",
        }}
        onClick={handleDiscoverMore}
        disabled={isLeaving || isMenuOpen}
      >
        <p>{t("discover")}</p>
        <ArrowRight size={30} />
      </button>
    </div>
  );
}
