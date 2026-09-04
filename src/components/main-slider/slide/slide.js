"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { trackSelectItem } from "@/lib/analytics";
import { SLIDER_IMAGE_LOADING_CONFIG } from "../image-loading-config.mjs";
import { getSlideTransform } from "../slider-math.mjs";

export default React.memo(function Slide({
  data,
  logicalIndex,
  itemStep,
  eagerPreview,
  initialLoadSlotId,
  updateTitleData,
  onHoverStart,
  onHoverEnd,
  onInitialPreviewSettled,
  subscribeToFullImageUpgrade,
  width,
  height,
}) {
  const slideRef = useRef(null);
  const isNearViewportRef = useRef(false);
  const fullImageUpgradeEnabledRef = useRef(false);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [shouldLoadFullImage, setShouldLoadFullImage] = useState(false);
  const positionStyle = useMemo(
    () => ({
      transform: getSlideTransform(logicalIndex, itemStep),
      zIndex: -logicalIndex,
    }),
    [itemStep, logicalIndex],
  );

  useEffect(() => {
    setIsFullImageLoaded(false);
    setIsPreviewVisible(true);
    setShouldLoadFullImage(
      fullImageUpgradeEnabledRef.current && isNearViewportRef.current,
    );
  }, [data.image]);

  useEffect(() => {
    if (!slideRef.current) return;

    if (!("IntersectionObserver" in window)) {
      isNearViewportRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewportRef.current = entry.isIntersecting;

        if (entry.isIntersecting && fullImageUpgradeEnabledRef.current) {
          setShouldLoadFullImage(true);
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(slideRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () =>
      subscribeToFullImageUpgrade((isEnabled) => {
        fullImageUpgradeEnabledRef.current = isEnabled;

        if (isEnabled) {
          if (isNearViewportRef.current) setShouldLoadFullImage(true);
          return;
        }

        setShouldLoadFullImage(false);
        setIsFullImageLoaded(false);
        setIsPreviewVisible(true);
      }),
    [subscribeToFullImageUpgrade],
  );

  useEffect(() => {
    if (!shouldLoadFullImage || !isFullImageLoaded) return;

    const previewRemovalTimeout = window.setTimeout(() => {
      setIsPreviewVisible(false);
    }, SLIDER_IMAGE_LOADING_CONFIG.fullImageFadeDurationMs + 100);

    return () => window.clearTimeout(previewRemovalTimeout);
  }, [isFullImageLoaded, shouldLoadFullImage]);

  function handleMouseEnter() {
    updateTitleData(data.title, data.blackText);
    onHoverStart?.();
  }

  function handleFullImageTransitionEnd(event) {
    if (
      shouldLoadFullImage &&
      isFullImageLoaded &&
      event.target === event.currentTarget &&
      event.propertyName === "opacity"
    ) {
      setIsPreviewVisible(false);
    }
  }

  function handlePreviewSettled() {
    if (!eagerPreview) return;
    onInitialPreviewSettled(initialLoadSlotId);
  }

  return (
    <div
      className={styles.slidePositioner}
      style={positionStyle}
      data-slider-logical-index={logicalIndex}
    >
      <AnimatedLink
        href={data.link}
        aria-label={data.previewImageAlt || data.title}
        onClick={() => trackSelectItem(data.title, data.id)}
      >
        <div
          ref={slideRef}
          className={`${styles.ortho} ${styles.slide}`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            "--image-width": `${height}px`,
            "--full-image-fade-duration": `${SLIDER_IMAGE_LOADING_CONFIG.fullImageFadeDurationMs}ms`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={onHoverEnd}
        >
          <div
            className={styles.imageStack}
            style={{ backgroundColor: data.color }}
          >
            {(!shouldLoadFullImage || isPreviewVisible) && (
              <Image
                className={`${styles.slideImage} ${styles.previewImage}`}
                src={data.image}
                width={width}
                height={height}
                sizes={SLIDER_IMAGE_LOADING_CONFIG.previewSizes}
                quality={SLIDER_IMAGE_LOADING_CONFIG.previewQuality}
                alt=""
                aria-hidden="true"
                loading={eagerPreview ? "eager" : "lazy"}
                onLoad={handlePreviewSettled}
                onError={handlePreviewSettled}
              />
            )}
            {shouldLoadFullImage && (
              <Image
                className={`${styles.slideImage} ${styles.fullImage} ${
                  isFullImageLoaded ? styles.fullImageLoaded : ""
                }`}
                src={data.image}
                width={width}
                height={height}
                sizes={SLIDER_IMAGE_LOADING_CONFIG.fullImageSizes}
                alt=""
                aria-hidden="true"
                loading="eager"
                onLoad={() => setIsFullImageLoaded(true)}
                onTransitionEnd={handleFullImageTransitionEnd}
              />
            )}
          </div>
        </div>
      </AnimatedLink>
    </div>
  );
});
