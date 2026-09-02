"use client";

import Image from "next/image";
import styles from "./slide.module.css";
import React, { useEffect, useState } from "react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { trackSelectItem } from "@/lib/analytics";
import { SLIDER_IMAGE_LOADING_CONFIG } from "../image-loading-config.mjs";

export default React.memo(function Slide({
  data,
  style,
  updateTitleData,
  onPreviewLoad,
  onPreviewError,
  width,
  height,
}) {
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  useEffect(() => {
    if (!isFullImageLoaded) return;

    const previewRemovalTimeout = window.setTimeout(() => {
      setIsPreviewVisible(false);
    }, SLIDER_IMAGE_LOADING_CONFIG.fullImageFadeDurationMs + 100);

    return () => window.clearTimeout(previewRemovalTimeout);
  }, [isFullImageLoaded]);

  function handleMouseEnter() {
    updateTitleData(data.title, data.blackText);
  }

  function handleFullImageTransitionEnd(event) {
    if (
      isFullImageLoaded &&
      event.target === event.currentTarget &&
      event.propertyName === "opacity"
    ) {
      setIsPreviewVisible(false);
    }
  }

  return (
    <AnimatedLink
      href={data.link}
      onClick={() => trackSelectItem(data.title, data.id)}
    >
      <div
        className={`${styles.ortho} ${styles.slide}`}
        style={{
          ...style,
          width: `${width}px`,
          height: `${height}px`,
          "--image-width": `${height}px`,
          "--full-image-fade-duration": `${SLIDER_IMAGE_LOADING_CONFIG.fullImageFadeDurationMs}ms`,
        }}
        onMouseEnter={handleMouseEnter}
      >
        <div
          className={styles.imageStack}
          style={{ backgroundColor: data.color }}
        >
          {isPreviewVisible && (
            <Image
              className={`${styles.slideImage} ${styles.previewImage}`}
              src={data.image}
              width={width}
              height={height}
              sizes={SLIDER_IMAGE_LOADING_CONFIG.previewSizes}
              quality={SLIDER_IMAGE_LOADING_CONFIG.previewQuality}
              alt=""
              aria-hidden="true"
              loading="eager"
              onLoad={onPreviewLoad}
              onError={onPreviewError}
            />
          )}
          <Image
            className={`${styles.slideImage} ${styles.fullImage} ${
              isFullImageLoaded ? styles.fullImageLoaded : ""
            }`}
            src={data.image}
            width={width}
            height={height}
            sizes={SLIDER_IMAGE_LOADING_CONFIG.fullImageSizes}
            alt={data.previewImageAlt || data.title}
            loading="lazy"
            onLoad={() => setIsFullImageLoaded(true)}
            onTransitionEnd={handleFullImageTransitionEnd}
          />
        </div>
      </div>
    </AnimatedLink>
  );
});
