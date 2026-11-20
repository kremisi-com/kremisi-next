"use client";

import DigitalEcosystem from "@/components/digital-ecosystem/digital-ecosystem";
import styles from "./overview.module.css";

export default function Overview({
    isVisible = true,
    textShouldAnimate,
    onFadeInComplete,
    children,
    variant,
    id = "overview",
    "aria-labelledby": ariaLabelledby,
}) {
    function handleTransitionEnd(event) {
        if (
            !isVisible ||
            event.target !== event.currentTarget ||
            event.propertyName !== "opacity"
        ) {
            return;
        }

        onFadeInComplete?.();
    }

    return (
        <section
            className={`${styles.overview} ${isVisible ? styles.visible : styles.hidden} ${variant === "campaign" ? styles.campaign : ""} ${!children ? styles.ecosystemOverview : ""}`}
            id={id}
            aria-labelledby={ariaLabelledby || (!children ? "ecosystem-claim" : undefined)}
            onTransitionEnd={handleTransitionEnd}
        >
            <div
                className={`${styles.background} ${
                    isVisible ? styles.backgroundActive : ""
                }`}
                aria-hidden="true"
            >
                <div className={styles.blob1}></div>
                <div className={styles.blob2}></div>
                <div className={styles.blob3}></div>
                <div className={styles.noise}></div>
            </div>
            
            <div className={children ? styles.campaignContent : styles.ecosystemContent}>
                {children || <DigitalEcosystem isActive={isVisible} play={textShouldAnimate} />}
            </div>
        </section>
    );
}
