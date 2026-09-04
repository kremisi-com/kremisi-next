"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import styles from "./main-slider.module.css";
import Slide from "./slide/slide";
import Loader from "@/components/loader/loader";
import { trackViewItemList } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { SLIDER_IMAGE_LOADING_CONFIG } from "./image-loading-config.mjs";
import {
  createVirtualPool,
  getProjectIndexForLogicalIndex,
  getVirtualPoolRange,
  getVirtualPoolSize,
  reconcileVirtualPool,
} from "./slider-math.mjs";
import { createFullImageObserverController } from "./full-image-observer.mjs";

const SLIDE_STEP = 120;
const MINIMUM_POOL_SIZE = 15;
const MAXIMUM_POOL_SIZE = 25;
const INITIAL_EAGER_IMAGES = 5;
const BASE_WIDTH = 450;
const BASE_HEIGHT = 275;
const SCALE_FACTOR = 1;

function getImageDimensions(slope) {
  return {
    width: Math.max(
      Math.round((BASE_WIDTH * SCALE_FACTOR) / (slope * 1.3)),
      BASE_WIDTH * 0.8,
    ),
    height: Math.max(
      Math.round((BASE_HEIGHT * SCALE_FACTOR) / (slope * 1.3)),
      BASE_HEIGHT * 0.8,
    ),
  };
}

export default function MainSlider({
  projectsData,
  onDiscoverMoreClick,
  reopenSignal = 0,
  sessionMode = "initial",
  isActive = true,
}) {
  const t = useTranslations("cta");

  const animationDurationInitial = 2000;
  const animationStartDelayMs = 500;
  const fullImageUpgradeDelayMs = 500;
  const leaveAnimationDuration = 3200;
  const animationTargetScroll = 0;
  const speed = 30;
  const touchMultiplier = 1.2;
  const autoScrollSpeed = 120;
  const isHoverBrakeEnabled = false;
  const autoScrollBrakeDuration = 500;
  const autoScrollResumeDuration = 700;
  const loopSpan = SLIDE_STEP * projectsData.length;
  const maximumIntroTravelDistance = SLIDE_STEP * 60;
  const introTravelDistance = Math.min(
    maximumIntroTravelDistance,
    loopSpan * 4,
  );
  const starterScrollPosition = animationTargetScroll - introTravelDistance;
  const leaveTargetScroll = loopSpan * 4.8;
  const initialVirtualPool = useMemo(
    () =>
      createVirtualPool({
        scroll: starterScrollPosition,
        itemStep: SLIDE_STEP,
        poolSize: MINIMUM_POOL_SIZE,
      }),
    [starterScrollPosition],
  );

  const [animationEnded, setAnimationEnded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [percentageLoaded, setPercentageLoaded] = useState(0);
  const [virtualPool, setVirtualPool] = useState(initialVirtualPool);
  const [poolSize, setPoolSize] = useState(MINIMUM_POOL_SIZE);
  const [slope, setSlope] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasManualInteraction, setHasManualInteraction] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  const scrollRef = useRef(starterScrollPosition);
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const titlePointerRef = useRef({ x: -9999, y: -9999 });
  const titlePointerAnimationFrameRef = useRef(null);
  const titleStateRef = useRef({ text: "", darkText: false });
  const virtualPoolAnchorRef = useRef(
    getVirtualPoolRange(
      starterScrollPosition,
      SLIDE_STEP,
      MINIMUM_POOL_SIZE,
    ).anchor,
  );
  const initialPreviewSettledSlotsRef = useRef(new Set());
  const initialEagerSlotIds = useMemo(() => {
    const centerSlot = Math.floor(poolSize / 2);
    const eagerRadius = Math.floor(INITIAL_EAGER_IMAGES / 2);

    return new Set(
      Array.from(
        { length: INITIAL_EAGER_IMAGES },
        (_, index) => centerSlot - eagerRadius + index,
      ),
    );
  }, [poolSize]);
  const tickingRef = useRef(false);
  const touchStateRef = useRef({
    active: false,
    pointerId: null,
    lastY: 0,
  });
  const animationStartedRef = useRef(false);
  const animationEndedRef = useRef(false);
  const isEnteringRef = useRef(true);
  const animationStartTimeoutRef = useRef(null);
  const introAnimationFrameRef = useRef(null);
  const leaveAnimationFrameRef = useRef(null);
  const autoScrollAnimationFrameRef = useRef(null);
  const autoScrollLastTimestampRef = useRef(null);
  const autoScrollCurrentSpeedRef = useRef(autoScrollSpeed);
  const autoScrollTargetSpeedRef = useRef(autoScrollSpeed);
  const reopenAnimationTimeoutRef = useRef(null);
  const imageLoadTimeoutRef = useRef(null);
  const handledReopenSignalRef = useRef(0);
  const hasManualInteractionRef = useRef(false);
  const sliderProfileRef = useRef(null);
  const fullImageObserverControllerRef = useRef(null);
  if (!fullImageObserverControllerRef.current) {
    fullImageObserverControllerRef.current =
      createFullImageObserverController();
  }

  const registerForFullImageUpgrade = useCallback((element, notify) => {
    return fullImageObserverControllerRef.current.register(element, notify);
  }, []);

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
      const nextSlope = window.innerHeight / window.innerWidth;
      const { height } = getImageDimensions(nextSlope);
      const nextPoolSize = getVirtualPoolSize({
        viewportHeight: window.innerHeight,
        itemHeight: height,
        itemStep: SLIDE_STEP,
        minimumItems: MINIMUM_POOL_SIZE,
        maximumItems: MAXIMUM_POOL_SIZE,
      });

      setSlope(nextSlope);
      setPoolSize(nextPoolSize);
    }

    updateSlope();
    window.addEventListener("resize", updateSlope);
    return () => window.removeEventListener("resize", updateSlope);
  }, []);

  useEffect(() => {
    const nextPool = createVirtualPool({
      scroll: scrollRef.current,
      itemStep: SLIDE_STEP,
      poolSize,
    });
    virtualPoolAnchorRef.current = getVirtualPoolRange(
      scrollRef.current,
      SLIDE_STEP,
      poolSize,
    ).anchor;
    setVirtualPool(nextPool);
  }, [poolSize]);

  const horizontalShift = (slope - 1.2) * 350;
  const { width: imageWidth, height: imageHeight } = getImageDimensions(slope);
  const entranceOffset =
    Math.floor(poolSize / 2) * SLIDE_STEP + imageWidth + SLIDE_STEP;

  const getSliderTransform = useCallback(
    (scroll) =>
      `translate3d(${-scroll + horizontalShift}px, ${scroll}px, 0)`,
    [horizontalShift],
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

  const syncVirtualPoolForScroll = useCallback(
    (scroll) => {
      const nextAnchor = getVirtualPoolRange(
        scroll,
        SLIDE_STEP,
        poolSize,
      ).anchor;
      if (nextAnchor === virtualPoolAnchorRef.current) return;

      virtualPoolAnchorRef.current = nextAnchor;
      setVirtualPool((currentPool) =>
        reconcileVirtualPool({
          pool: currentPool,
          scroll,
          itemStep: SLIDE_STEP,
        }),
      );
    },
    [poolSize],
  );

  const setScrollValue = useCallback(
    (scroll) => {
      scrollRef.current = scroll;
      syncSliderTransform(scroll);
      syncVirtualPoolForScroll(scroll);
    },
    [syncSliderTransform, syncVirtualPoolForScroll],
  );

  const animateAutoScroll = useCallback(
    (timestamp) => {
      const previousTimestamp = autoScrollLastTimestampRef.current;
      autoScrollLastTimestampRef.current = timestamp;

      if (previousTimestamp !== null) {
        const elapsed = Math.min(timestamp - previousTimestamp, 100);
        const currentSpeed = autoScrollCurrentSpeedRef.current;
        const targetSpeed = autoScrollTargetSpeedRef.current;
        const speedTransitionDuration =
          targetSpeed < currentSpeed
            ? autoScrollBrakeDuration
            : autoScrollResumeDuration;
        const maximumSpeedChange =
          (autoScrollSpeed * elapsed) / speedTransitionDuration;
        const speedDifference = targetSpeed - currentSpeed;
        const nextSpeed =
          Math.abs(speedDifference) <= maximumSpeedChange
            ? targetSpeed
            : currentSpeed + Math.sign(speedDifference) * maximumSpeedChange;

        autoScrollCurrentSpeedRef.current = nextSpeed;

        if (nextSpeed !== 0) {
          setScrollValue(scrollRef.current + (nextSpeed * elapsed) / 1000);
        }
      }

      autoScrollAnimationFrameRef.current =
        window.requestAnimationFrame(animateAutoScroll);
    },
    [
      autoScrollBrakeDuration,
      autoScrollResumeDuration,
      autoScrollSpeed,
      setScrollValue,
    ],
  );

  const handleSlideHoverStart = useCallback(() => {
    autoScrollTargetSpeedRef.current = 0;
  }, []);

  const handleSlideHoverEnd = useCallback(() => {
    autoScrollTargetSpeedRef.current = autoScrollSpeed;
  }, [autoScrollSpeed]);

  const runAnimation = useCallback(() => {
    if (animationStartedRef.current) return;

    if (imageLoadTimeoutRef.current) {
      window.clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }

    setPercentageLoaded(100);

    if (isEnteringRef.current) {
      isEnteringRef.current = false;
      setIsEntering(false);
    }

    if (introAnimationFrameRef.current) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
      introAnimationFrameRef.current = null;
    }

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
    let previousProfileTimestamp = null;

    if (window.location.search.includes("sliderProfile=1")) {
      sliderProfileRef.current = {
        introGaps: [],
        introLongTasks: [],
        introStart: null,
        upgradeActivationDelayMs: null,
        upgradeFullImageCounts: [],
        upgradeGaps: [],
      };
      window.__sliderProfile = sliderProfileRef.current;

      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            sliderProfileRef.current?.introLongTasks.push({
              startTime: entry.startTime,
              duration: entry.duration,
            });
          });
        });
        longTaskObserver.observe({ type: "longtask", buffered: true });
      } catch (_) {
        // Long-task entries are not supported in every browser.
      }
    }

    const animateIntro = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      if (sliderProfileRef.current) {
        if (sliderProfileRef.current.introStart === null) {
          sliderProfileRef.current.introStart = timestamp;
        }
        if (
          previousProfileTimestamp !== null &&
          timestamp - startTime <= 700
        ) {
          sliderProfileRef.current.introGaps.push(
            timestamp - previousProfileTimestamp,
          );
        }
        previousProfileTimestamp = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDurationInitial, 1);
      // A sine curve removes the abrupt early acceleration of the old
      // ease-out curve and eases gently into the matched continuous speed.
      const easedProgress = (1 - Math.cos(Math.PI * progress)) / 2;
      const blendedProgress =
        easedProgress * (1 - continuousSpeedBlend) +
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

      // Start the continuous motion in the same frame that concludes the
      // intro. Waiting for the state-driven effect below leaves a visible
      // pause while React commits the animation-ended state.
      if (!prefersReducedMotion && !autoScrollAnimationFrameRef.current) {
        autoScrollAnimationFrameRef.current = window.requestAnimationFrame(
          animateAutoScroll,
        );
      }
    };

    introAnimationFrameRef.current = window.requestAnimationFrame(animateIntro);
  }, [
    animationDurationInitial,
    animationTargetScroll,
    animateAutoScroll,
    autoScrollSpeed,
    prefersReducedMotion,
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

  const onInitialPreviewSettled = useCallback((slotId) => {
    if (animationStartedRef.current) return;
    if (initialPreviewSettledSlotsRef.current.has(slotId)) return;

    initialPreviewSettledSlotsRef.current.add(slotId);
    const settledCount = initialPreviewSettledSlotsRef.current.size;
    const nextPercentage = Math.min(
      (settledCount / INITIAL_EAGER_IMAGES) * 100,
      100,
    );

    if (settledCount >= INITIAL_EAGER_IMAGES) {
      setPercentageLoaded(99);
      scheduleRunAnimation();
      return;
    }

    setPercentageLoaded(nextPercentage);
  }, [scheduleRunAnimation]);

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
    autoScrollCurrentSpeedRef.current = autoScrollSpeed;
    autoScrollTargetSpeedRef.current = autoScrollSpeed;
    setAnimationEnded(false);
    setIsLeaving(false);
    isEnteringRef.current = true;
    setIsEntering(true);
    const nextPool = createVirtualPool({
      scroll: starterScrollPosition,
      itemStep: SLIDE_STEP,
      poolSize,
    });
    virtualPoolAnchorRef.current = getVirtualPoolRange(
      starterScrollPosition,
      SLIDE_STEP,
      poolSize,
    ).anchor;
    setVirtualPool(nextPool);
    scrollRef.current = starterScrollPosition;
    syncSliderTransform(starterScrollPosition);
  }, [
    autoScrollSpeed,
    poolSize,
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
    if (!animationEnded || isLeaving || isHidden || !isActive) {
      fullImageObserverControllerRef.current.deactivate();
      return;
    }

    const upgradeTimer = window.setTimeout(() => {
      fullImageObserverControllerRef.current.activate();

      if (sliderProfileRef.current) {
        sliderProfileRef.current.upgradeActivationDelayMs =
          performance.now() - sliderProfileRef.current.introStart;
        let upgradeStart = null;
        let previousTimestamp = null;

        const sampleUpgrade = (timestamp) => {
          if (upgradeStart === null) upgradeStart = timestamp;
          if (previousTimestamp !== null) {
            sliderProfileRef.current?.upgradeGaps.push(
              timestamp - previousTimestamp,
            );
          }
          sliderProfileRef.current?.upgradeFullImageCounts.push(
            sliderRef.current?.querySelectorAll(
              'img:not([aria-hidden="true"])',
            ).length ?? 0,
          );
          previousTimestamp = timestamp;

          if (timestamp - upgradeStart < 700) {
            window.requestAnimationFrame(sampleUpgrade);
          } else if (sliderRef.current && sliderProfileRef.current) {
            sliderRef.current.dataset.sliderProfile = JSON.stringify(
              sliderProfileRef.current,
            );
          }
        };

        window.requestAnimationFrame(sampleUpgrade);
      }
    }, fullImageUpgradeDelayMs);

    return () => window.clearTimeout(upgradeTimer);
  }, [
    animationEnded,
    fullImageUpgradeDelayMs,
    isActive,
    isHidden,
    isLeaving,
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
      fullImageObserverControllerRef.current?.destroy();
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
        className={`${styles.sliderScene} ${isEntering ? styles.sliderSceneEntering : ""} ${isLeaving ? styles.sliderSceneLeaving : ""} ${isHidden ? styles.sliderSceneHidden : ""}`}
        style={{
          "--scene-transition-duration": isEntering
            ? "0ms"
            : `${animationDurationInitial}ms`,
          "--scene-entrance-x": `${entranceOffset}px`,
          "--scene-entrance-y": `${-entranceOffset}px`,
        }}
      >
        <div
          ref={sliderRef}
          className={styles.slider}
          data-slider-pool-size={virtualPool.length}
          style={{
            transform: getSliderTransform(scrollRef.current),
            "--animation-duration": "0s",
            "--animation-easing": isLeaving
              ? "cubic-bezier(0.22, 1, 0.36, 1)"
              : "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {virtualPool.map(({ slotId, logicalIndex }) => {
            const projectIndex = getProjectIndexForLogicalIndex(
              logicalIndex,
              projectsData.length,
            );
            const slideData = projectsData[projectIndex];

            if (!slideData) return null;

            return (
              <Slide
                key={slotId}
                data={slideData}
                logicalIndex={logicalIndex}
                itemStep={SLIDE_STEP}
                eagerPreview={initialEagerSlotIds.has(slotId)}
                initialLoadSlotId={slotId}
                updateTitleData={updateTitleData}
                onHoverStart={
                  isHoverBrakeEnabled ? handleSlideHoverStart : undefined
                }
                onHoverEnd={
                  isHoverBrakeEnabled ? handleSlideHoverEnd : undefined
                }
                onInitialPreviewSettled={onInitialPreviewSettled}
                registerForFullImageUpgrade={registerForFullImageUpgrade}
                width={imageWidth}
                height={imageHeight}
              />
            );
          })}
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
