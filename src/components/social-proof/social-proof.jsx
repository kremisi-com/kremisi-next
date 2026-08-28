"use client";
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from './social-proof.module.css';
import GitButton from '../git-button/git-button';

const LOGOS = [
    "beyond-reiki.png", "bioli.png", "ccom.png", "chora-full.png", "chora.png",
    "crystal.png", "e2l-2.png", "e2l.png", "fa.png", "fleder.jpg",
    "gamelia.png", "glapix.png", "godo.png", "ims-2.png", "ims.png",
    "jester-2.png", "jester.png", "makuda.png", "narai.png", "naturalia.png",
    "obm.png", "pc.png", "sgs-2.png", "sgs.png", "ssb.png",
    "studylux.png", "theorica.png", "vecchi360.png"
];

const LOGO_CYCLE_DELAY = 6000;
const LOGO_FADE_DURATION = 1400;
const LOGO_FADE_BUFFER = 120;

const preloadedLogoUrls = new Set();

function preloadLogo(index) {
    const url = `/projects-logos/${LOGOS[index]}`;

    if (preloadedLogoUrls.has(url)) return;

    preloadedLogoUrls.add(url);
    const image = new window.Image();
    const releaseImage = () => {
        image.onload = null;
        image.onerror = null;
    };

    image.onload = releaseImage;
    image.onerror = releaseImage;
    image.src = url;
}

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    return prefersReducedMotion;
}

const LogoCard = ({ className, initialIndex, shouldAnimate }) => {
    const [startDelay, setStartDelay] = useState(null);
    const [indices, setIndices] = useState([
        initialIndex,
        (initialIndex + 1) % LOGOS.length
    ]);
    const indicesRef = useRef([
        initialIndex,
        (initialIndex + 1) % LOGOS.length
    ]);
    const [activeSlot, setActiveSlot] = useState(0);
    const activeSlotRef = useRef(0);
    const hasBegunCyclingRef = useRef(false);
    const cycleTimeoutRef = useRef(null);
    const swapTimeoutRef = useRef(null);

    useEffect(() => {
        setStartDelay(Math.random() * 8000);
    }, []);

    useEffect(() => {
        if (!shouldAnimate || startDelay === null) return;

        const clearTimers = () => {
            if (cycleTimeoutRef.current) {
                window.clearTimeout(cycleTimeoutRef.current);
                cycleTimeoutRef.current = null;
            }

            if (swapTimeoutRef.current) {
                window.clearTimeout(swapTimeoutRef.current);
                swapTimeoutRef.current = null;
            }
        };

        const scheduleCycle = () => {
            clearTimers();

            cycleTimeoutRef.current = window.setTimeout(() => {
                hasBegunCyclingRef.current = true;
                const currentActiveSlot = activeSlotRef.current;
                const nextActiveSlot = currentActiveSlot === 0 ? 1 : 0;

                setActiveSlot(nextActiveSlot);
                activeSlotRef.current = nextActiveSlot;

                swapTimeoutRef.current = window.setTimeout(() => {
                    const nextIndices = [...indicesRef.current];
                    nextIndices[currentActiveSlot] = (nextIndices[currentActiveSlot] + 2) % LOGOS.length;
                    indicesRef.current = nextIndices;
                    setIndices(nextIndices);

                    // Preload only the logo that will be revealed after the next cross-fade.
                    preloadLogo((nextIndices[nextActiveSlot] + 2) % LOGOS.length);

                    scheduleCycle();
                }, LOGO_FADE_DURATION + LOGO_FADE_BUFFER);
            }, hasBegunCyclingRef.current ? LOGO_CYCLE_DELAY : startDelay);
        };

        // The first swap replaces slot 0, so warm just that upcoming logo.
        preloadLogo((initialIndex + 2) % LOGOS.length);
        scheduleCycle();

        return () => {
            clearTimers();
        };
    }, [initialIndex, shouldAnimate, startDelay]);

    return (
        <div className={`${styles.placeholder} ${className}`}>
            <img 
                src={`/projects-logos/${LOGOS[indices[0]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 0 ? styles.active : styles.background}`}
                decoding="async"
                draggable="false"
            />
            <img 
                src={`/projects-logos/${LOGOS[indices[1]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 1 ? styles.active : styles.background}`}
                decoding="async"
                draggable="false"
            />
        </div>
    );
};


export default function SocialProof({ isActive }) {
    const t = useTranslations("socialProof");
    const prefersReducedMotion = usePrefersReducedMotion();
    const shouldAnimate = isActive && !prefersReducedMotion;

    const renderLogoCard = (className, initialIndex) => (
        <LogoCard
            className={className}
            initialIndex={initialIndex}
            shouldAnimate={shouldAnimate}
        />
    );
    return (
        <section className={styles.socialProofSection} id="social-proof">
            <div className={styles.container}>
                <div className={styles.badge}>{t("badge")}</div>
                
                {isActive && (
                    <div className={styles.galleryTop}>
                        <div className={styles.galleryInner}>
                            {renderLogoCard(styles.p1, 0)}
                            {renderLogoCard(styles.p2, 3)}
                            {renderLogoCard(styles.p3, 6)}
                            {renderLogoCard(styles.p4, 9)}
                            {renderLogoCard(styles.p5, 12)}
                            {renderLogoCard(styles.p6, 15)}
                        </div>
                    </div>
                )}

                <h2 className={styles.title}>
                    {t("title")}<br/>
                    <span className={styles.titleLight}>{t("titleLight")}</span>
                </h2>

                {isActive && (
                    <div className={styles.galleryBottom}>
                        <div className={styles.galleryInner}>
                            {renderLogoCard(styles.p7, 18)}
                            {renderLogoCard(styles.p8, 21)}
                            {renderLogoCard(styles.p9, 24)}
                        </div>
                    </div>
                )}
                
                <p className={styles.description}>
                    {t("description")}
                </p>
                
                <Link href="/contacts" className={styles.buttonWrapper}>
                    <GitButton text={t("cta")} className={styles.socialProofGitButton} leftShift="-20px" />
                </Link>
            </div>
        </section>
    );
}
