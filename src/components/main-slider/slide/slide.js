"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { trackSelectItem } from "@/lib/analytics";
import {
  ENABLE_COMPRESSION,
  SLIDER_IMAGE_LOADING_CONFIG,
} from "../image-loading-config.mjs";
import { getSlideTransform } from "../slider-math.mjs";
import { FULL_IMAGE_OBSERVER_ACTIONS } from "../full-image-observer.mjs";
import previewManifest from "../preview-manifest.json";

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
  registerForFullImageUpgrade,
  width,
  height,
  pixelRatio = 1,
}) {
  const compressionEnabled = ENABLE_COMPRESSION === "start";
  const staticPreview = previewManifest[data.image];
  // Keep real slide geometry, but cap texture density at 2x on 3x/4x phones.
  const fullImageSizes = `${Math.ceil(width * Math.min(pixelRatio, 2) / pixelRatio)}px`;
  const slideRef = useRef(null);
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
    if (!compressionEnabled) return;
    setIsFullImageLoaded(false);
    setIsPreviewVisible(true);
    setShouldLoadFullImage(false);
  }, [compressionEnabled, data.image]);

  const handleFullImageUpgrade = useCallback((action) => {
    if (action === FULL_IMAGE_OBSERVER_ACTIONS.load) {
      setShouldLoadFullImage(true);
      return;
    }

    if (action === FULL_IMAGE_OBSERVER_ACTIONS.reset) {
      setShouldLoadFullImage(false);
      setIsFullImageLoaded(false);
      setIsPreviewVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!compressionEnabled || !slideRef.current) return;

    return registerForFullImageUpgrade(
      slideRef.current,
      handleFullImageUpgrade,
    );
  }, [compressionEnabled, data.image, handleFullImageUpgrade, registerForFullImageUpgrade]);

  useEffect(() => {
    if (!compressionEnabled || !shouldLoadFullImage || !isFullImageLoaded) {
      return;
    }

    const previewRemovalTimeout = window.setTimeout(() => {
      setIsPreviewVisible(false);
    }, SLIDER_IMAGE_LOADING_CONFIG.fullImageFadeDurationMs + 100);

    return () => window.clearTimeout(previewRemovalTimeout);
  }, [compressionEnabled, isFullImageLoaded, shouldLoadFullImage]);

  function handleMouseEnter() {
    updateTitleData(data.title, data.blackText);
    onHoverStart?.();
  }

  function handlePreviewSettled() {
    if (!eagerPreview) return;
    onInitialPreviewSettled(initialLoadSlotId);
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

  return (
    <div
      className={styles.slidePositioner}
      style={positionStyle}
      data-slider-logical-index={logicalIndex}
    >
      <AnimatedLink
        className={styles.slideLink}
        href={data.link}
        prefetch={false}
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
        >
          <div
            className={styles.imageStack}
            style={{ backgroundColor: data.color }}
          >
            {compressionEnabled ? (
              <>
                {(!shouldLoadFullImage || isPreviewVisible) && (
                  <Image
                    className={`${styles.slideImage} ${styles.previewImage}`}
                    src={staticPreview || data.image}
                    width={width}
                    height={height}
                    sizes={SLIDER_IMAGE_LOADING_CONFIG.previewSizes}
                    quality={SLIDER_IMAGE_LOADING_CONFIG.previewQuality}
                    unoptimized={!!staticPreview}
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
                    sizes={fullImageSizes}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    onLoad={() => setIsFullImageLoaded(true)}
                    onTransitionEnd={handleFullImageTransitionEnd}
                  />
                )}
              </>
            ) : (
              <Image
                className={styles.slideImage}
                src={data.image}
                width={width}
                height={height}
                alt=""
                aria-hidden="true"
                unoptimized
                loading={eagerPreview ? "eager" : "lazy"}
                onLoad={handlePreviewSettled}
                onError={handlePreviewSettled}
              />
            )}
          </div>
          <span
            className={styles.hitArea}
            data-slider-hit-area
            aria-hidden="true"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onHoverEnd}
          />
        </div>
      </AnimatedLink>
    </div>
  );
});
