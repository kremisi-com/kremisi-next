"use client";

import { useId } from "react";
import styles from "./git-button.module.css";
import { LucideArrowRight, LucideArrowUpRight } from "lucide-react";

export default function GitButton({
  isSubmit = false,
  text = "Get in touch",
  submitText = "Request Proposal",
  disabled = false,
  leftShift = 0,
  revertColor = false,
  className = "",
  isLinkContent = false,
}) {
  const ButtonElement = isLinkContent ? "span" : "button";
  const filterId = `goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      style={{ marginLeft: leftShift, "--goo-filter": `url("#${filterId}")` }}
      className={`${revertColor ? styles.revert : ""} ${className}`}
    >
      <div className={`${styles.container} ${disabled ? styles.disabled : ""}`}>
        <div className={`${styles.left} ${styles.arrow}`} aria-hidden="true">
          <LucideArrowRight />
        </div>
        <ButtonElement
          className={`${styles.button}`}
          {...(!isLinkContent && { type: isSubmit ? "submit" : "button" })}
        >
          <span className={`${styles.text} ${styles.top}`}>
            {isSubmit ? submitText : text}
          </span>
          <span className={`${styles.text} ${styles.bottom}`} aria-hidden="true">
            {isSubmit ? submitText : text}
          </span>
        </ButtonElement>
        <div className={`${styles.right} ${styles.arrow}`} aria-hidden="true">
          <LucideArrowUpRight />
        </div>
      </div>

      {/* Keep the filter in the render tree so WebKit can resolve it. */}
      <svg xmlns="http://www.w3.org/2000/svg" className={styles.filterDefinitions} aria-hidden="true" focusable="false" width="0" height="0">
        <defs>
          <filter id={filterId} x="-50%" y="-100%" width="200%" height="300%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                                1 0 0 0 0
                                0 1 0 0 0
                                0 0 1 0 0
                                0 0 0 30 -15"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
