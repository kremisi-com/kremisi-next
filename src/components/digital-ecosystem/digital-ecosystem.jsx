"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./digital-ecosystem.module.css";

const TOP_AREAS = ["development", "automation", "design", "marketing", "strategy"];
const BOTTOM_AREAS = ["intelligence", "security", "compliance", "cloud", "operations"];
const WAVE_LINES = Array.from({ length: 24 }, (_, index) => index);

function CapabilityIcon({ area }) {
    const accent = "var(--primary)";
    const shapes = {
        development: <><path d="m15 12-11 12 11 12m18-24 11 12-11 12" /><path d="m28 7-8 34" stroke={accent} /></>,
        automation: <><path d="m20 15-9 15m17-15 9 15" /><circle cx="24" cy="9" r="7" stroke={accent} /><circle cx="9" cy="37" r="7" /><circle cx="39" cy="37" r="7" /></>,
        design: <><path d="m4 24 20 10 20-10M4 34l20 10 20-10" /><path d="m4 14 20-10 20 10-20 10Z" stroke={accent} /></>,
        marketing: <><path d="M6 39h36M9 31l10-12 9 5L40 9" /><path d="M29 9h11v11" stroke={accent} /></>,
        strategy: <><path d="M8 37V26a7 7 0 0 1 7-7h18a7 7 0 0 0 7-7V8" /><circle cx="8" cy="38" r="5" /><circle cx="40" cy="7" r="5" stroke={accent} /></>,
        intelligence: <><path d="M6 40V29h7v11Zm14 0V18h7v22Z" /><path d="M34 40V6h7v34Z" stroke={accent} /></>,
        security: <><path d="M24 4c7 5 13 6 18 7-1 18-7 26-18 33C13 37 7 29 6 11c5-1 11-2 18-7Z" /><path d="m15 24 6 6 13-14" stroke={accent} /></>,
        compliance: <><path d="M24 6v36M12 43h24M6 13h36M10 13 3 30h14Zm28 0-7 17h14Z" /><path d="M3 30a7 5 0 0 0 14 0m14 0a7 5 0 0 0 14 0" stroke={accent} /></>,
        cloud: <><path d="M13 29a9 9 0 1 1 1-18 11 11 0 0 1 21 3 8 8 0 1 1 1 15Z" /><path d="M24 29v12m-11-12v7H8v5m27-12v7h5v5" stroke={accent} /><circle cx="8" cy="43" r="2" /><circle cx="24" cy="43" r="2" /><circle cx="40" cy="43" r="2" /></>,
        operations: <><path d="M7 26a17 17 0 0 1 29-14l5 5M41 5v12H29M41 24A17 17 0 0 1 12 36l-5-5" /><path d="M7 43V31h12" stroke={accent} /></>,
    };

    return <svg className={styles.icon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[area]}</svg>;
}

function CapabilityArtwork({ area }) {
    const id = useId().replaceAll(":", "");
    const gradientId = `ecosystem-${id}`;
    const isLayered = area === "design" || area === "cloud";
    const isDiagonal = area === "marketing" || area === "compliance";

    return (
        <svg className={styles.artwork} viewBox="0 0 360 180" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="75" y1="150" x2="350" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="currentColor" stopOpacity="0" />
                    <stop offset=".48" stopColor="currentColor" stopOpacity=".35" />
                    <stop offset="1" stopColor="var(--primary)" stopOpacity=".8" />
                </linearGradient>
            </defs>
            {isLayered ? (
                WAVE_LINES.slice(0, 12).map((line) => (
                    <ellipse key={line} cx="335" cy={172 + line * 7} rx={125 + line * 7} ry={95 + line * 7} stroke={`url(#${gradientId})`} strokeWidth={area === "design" ? "5" : "1"} opacity={area === "design" ? ".28" : ".65"} />
                ))
            ) : isDiagonal ? (
                WAVE_LINES.slice(0, 15).map((line) => (
                    <path key={line} d={`M${90 + line * 14} 190 ${320 + line * 14} -15`} stroke={`url(#${gradientId})`} strokeWidth="1" />
                ))
            ) : (
                WAVE_LINES.map((line) => (
                    <path key={line} d={`M70 ${146 + line * 3} C145 ${45 + line * 4}, 190 ${230 - line * 3}, 265 ${107 + line * 2} S345 ${32 + line * 3}, 385 ${51 + line * 3}`} stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeDasharray=".1 5" strokeLinecap="round" />
                ))
            )}
        </svg>
    );
}

function CapabilityCard({ area, label }) {
    return (
        <li className={styles.card}>
            <CapabilityArtwork area={area} />
            <CapabilityIcon area={area} />
            <span className={styles.cardLabel}>{label}</span>
        </li>
    );
}

function CapabilityBand({ areas, reverse = false, t }) {
    const bandRef = useRef(null);
    const groupRef = useRef(null);
    const [copies, setCopies] = useState(2);

    useEffect(() => {
        const band = bandRef.current;
        const group = groupRef.current;
        const updateCopies = () => {
            const groupWidth = group.getBoundingClientRect().width;
            if (!groupWidth) return;

            // One group moves out during the loop; the remaining copies must fill the viewport.
            setCopies(Math.max(2, Math.ceil(band.clientWidth / groupWidth) + 1));
        };
        updateCopies();
        const observer = new ResizeObserver(updateCopies);
        observer.observe(band);
        observer.observe(group);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={bandRef} className={`${styles.band} ${reverse ? styles.reverse : ""}`} tabIndex={0} role="group" aria-label={t(reverse ? "bottomBand" : "topBand")}>
            <div className={styles.track} style={{ "--marquee-copies": copies }}>
                {Array.from({ length: copies }, (_, index) => (
                    <ul ref={index === 0 ? groupRef : undefined} className={styles.group} key={index} aria-hidden={index > 0 || undefined}>
                        {areas.map((area) => <CapabilityCard key={area} area={area} label={t(`areas.${area}`)} />)}
                    </ul>
                ))}
            </div>
        </div>
    );
}

export default function DigitalEcosystem({ isActive = true, play = true }) {
    const t = useTranslations("ecosystem");
    const claim = useTranslations("overview");
    const rootRef = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
        observer.observe(rootRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={rootRef} className={`${styles.ecosystem} ${isActive && inView ? styles.running : ""}`}>
            <div className={styles.intro}>
                <h1 className={`${styles.claim} ${play ? styles.claimReady : ""}`} id="ecosystem-claim">
                    <span className={styles.claimIntro}>{claim("line1")}</span>{" "}
                    <em className={styles.claimHighlight}>{claim("highlight")}</em>{" "}
                    <span className={styles.claimEnd}>{claim("line3")}</span>{" "}
                    <em className={styles.claimEmphasis}>{claim("emphasis")}</em>
                </h1>
            </div>
            <div className={styles.separator}>
                <CapabilityBand areas={TOP_AREAS} t={t} />
                <CapabilityBand areas={BOTTOM_AREAS} reverse t={t} />
            </div>
        </div>
    );
}
