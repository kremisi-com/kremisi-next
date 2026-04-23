"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import styles from "./competitive-position.module.css";

const COMPETITIVE_AXES = [
  "Trust",
  "UX",
  "SEO",
  "Offer",
  "Branding",
  "Conversion",
];

const FALLBACK_DATA = {
  axes: COMPETITIVE_AXES,
  your_site: [76, 71, 84, 55, 42, 61],
  top_competitor: [83, 80, 76, 79, 74, 77],
  category_average: [62, 59, 64, 58, 56, 54],
  axis_explanations: {
    Trust:
      "The opening area does not show named proof, quantified outcomes, or authority badges near the first action.",
    UX:
      "Primary actions are not consistently repeated through sections, so users must scan to find the next step.",
    SEO:
      "Headings and service copy include explicit intent terms, but the page still needs more specific wording to fully own its search intent.",
    Offer:
      "Service intent is visible, but scope and deliverables are not summarized early in one compact block.",
    Branding:
      "Visual style is coherent, yet the unique promise is not repeated consistently across headline, proof, and CTA copy.",
    Conversion:
      "CTA priority softens after the hero and the contact path lacks urgency cues near the action point.",
  },
  insight: "The page has a strong structural base, but the remaining gap is sharper differentiation.",
  method_note:
    "Synthetic preview. Final chart is generated from the submitted site.",
};

function isValidSeries(series) {
  return (
    Array.isArray(series) &&
    series.length === COMPETITIVE_AXES.length &&
    series.every(
      (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100,
    )
  );
}

function normalizeCompetitiveData(data) {
  if (!data || typeof data !== "object") {
    return FALLBACK_DATA;
  }

  const axes =
    Array.isArray(data.axes) &&
    data.axes.length === COMPETITIVE_AXES.length &&
    data.axes.every((axis, index) => axis === COMPETITIVE_AXES[index])
      ? data.axes
      : FALLBACK_DATA.axes;
  const axisExplanations =
    data.axis_explanations &&
    typeof data.axis_explanations === "object" &&
    !Array.isArray(data.axis_explanations)
      ? data.axis_explanations
      : {};

  return {
    axes,
    your_site: isValidSeries(data.your_site)
      ? data.your_site
      : FALLBACK_DATA.your_site,
    top_competitor: isValidSeries(data.top_competitor)
      ? data.top_competitor
      : FALLBACK_DATA.top_competitor,
    category_average: isValidSeries(data.category_average)
      ? data.category_average
      : FALLBACK_DATA.category_average,
    axis_explanations: Object.fromEntries(
      COMPETITIVE_AXES.map((axis) => [
        axis,
        typeof axisExplanations[axis] === "string" &&
        axisExplanations[axis].trim()
          ? axisExplanations[axis].trim()
          : FALLBACK_DATA.axis_explanations[axis],
      ]),
    ),
    insight:
      typeof data.insight === "string" && data.insight.trim()
        ? data.insight.trim()
        : FALLBACK_DATA.insight,
    method_note:
      typeof data.method_note === "string" && data.method_note.trim()
        ? data.method_note
        : FALLBACK_DATA.method_note,
  };
}

function buildRadarPath(series, centerX, centerY, radius) {
  return series
    .map((value, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / series.length;
      const scaledRadius = (Math.max(value, 0) / 100) * radius;
      const x = centerX + Math.cos(angle) * scaledRadius;
      const y = centerY + Math.sin(angle) * scaledRadius;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ")
    .concat(" Z");
}

export default function CompetitivePosition({
  className = "",
  data = null,
  locked = false,
}) {
  const reduceMotion = useReducedMotion();
  const [activeAxisIndex, setActiveAxisIndex] = useState(null);
  const position = normalizeCompetitiveData(data);
  const centerX = 210;
  const centerY = 176;
  const radius = 114;
  const rings = [0.25, 0.5, 0.75, 1];

  const axes = position.axes.map((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / position.axes.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const labelX = centerX + Math.cos(angle) * (radius + 28);
    const labelY = centerY + Math.sin(angle) * (radius + 28);

    return { label, x, y, labelX, labelY, angle };
  });

  const chartSets = [
    {
      id: "category-average",
      label: "Category Average",
      series: position.category_average,
      className: styles.averageShape,
      dotClassName: styles.averageDot,
    },
    {
      id: "top-competitor",
      label: "Top Competitor",
      series: position.top_competitor,
      className: styles.competitorShape,
      dotClassName: styles.competitorDot,
    },
    {
      id: "your-site",
      label: "Your Site",
      series: position.your_site,
      className: styles.siteShape,
      dotClassName: styles.siteDot,
    },
  ];
  const activeAxis = Number.isInteger(activeAxisIndex)
    ? axes[activeAxisIndex]
    : null;
  const activeValue = Number.isInteger(activeAxisIndex)
    ? position.your_site[activeAxisIndex]
    : null;
  const activePoint =
    activeAxis && typeof activeValue === "number"
      ? {
          x: centerX + Math.cos(activeAxis.angle) * ((activeValue / 100) * radius),
          y: centerY + Math.sin(activeAxis.angle) * ((activeValue / 100) * radius),
        }
      : null;
  const tooltipLeftPercent = activePoint
    ? Math.min(92, Math.max(8, (activePoint.x / 420) * 100))
    : 50;
  const tooltipTopPercent = activePoint
    ? Math.min(90, Math.max(12, (activePoint.y / 360) * 100))
    : 50;
  const tooltipAnchor =
    tooltipLeftPercent <= 40
      ? "start"
      : tooltipLeftPercent >= 60
        ? "end"
        : "center";
  const tooltipTranslateX =
    tooltipAnchor === "start"
      ? "0%"
      : tooltipAnchor === "end"
        ? "-100%"
        : "-50%";

  return (
    <motion.div
      className={[styles.panel, className].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.eyebrow}>Strategic Intelligence</p>
      <div className={styles.titleBlock}>
        <div>
          <p className={styles.title}>Competitive Position</p>
          <p className={styles.subtitle}>Execution gap across the category</p>
        </div>
      </div>

      <div className={`${styles.chartShell} ${locked ? styles.chartShellLocked : ""}`}>
        <div className={styles.chartGlowContainer} aria-hidden="true">
          <div className={styles.chartGlow} />
        </div>
        <svg
          viewBox="0 0 420 360"
          className={styles.chart}
          aria-label="Competitive position radar chart comparing your site, top competitor, and category average"
          role="img"
          onClick={() => setActiveAxisIndex(null)}
        >
          <defs>
            <linearGradient id="competitive-site-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(220, 20, 60, 0.32)" />
              <stop offset="100%" stopColor="rgba(220, 20, 60, 0.08)" />
            </linearGradient>
            <linearGradient
              id="competitive-competitor-fill"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style={{ stopColor: "var(--competitor-fill-start)" }} />
              <stop offset="100%" style={{ stopColor: "var(--competitor-fill-stop)" }} />
            </linearGradient>
            <linearGradient id="competitive-average-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--average-fill-start)" }} />
              <stop offset="100%" style={{ stopColor: "var(--average-fill-stop)" }} />
            </linearGradient>
          </defs>

          {rings.map((ring) => (
            <polygon
              key={ring}
              className={styles.gridRing}
              points={axes
                .map(({ angle }) => {
                  const x = centerX + Math.cos(angle) * radius * ring;
                  const y = centerY + Math.sin(angle) * radius * ring;
                  return `${x.toFixed(2)},${y.toFixed(2)}`;
                })
                .join(" ")}
            />
          ))}

          {axes.map((axis) => (
            <line
              key={axis.label}
              className={styles.axisLine}
              x1={centerX}
              y1={centerY}
              x2={axis.x}
              y2={axis.y}
            />
          ))}

          {chartSets.map((set, index) => {
            const path = buildRadarPath(set.series, centerX, centerY, radius);

            return (
              <motion.path
                key={set.id}
                d={path}
                className={set.className}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                whileInView={reduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.95,
                  delay: 0.12 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}

          {chartSets.map((set) =>
            set.series.map((value, index) => {
              const angle = -Math.PI / 2 + (Math.PI * 2 * index) / set.series.length;
              const scaledRadius = (value / 100) * radius;
              const x = centerX + Math.cos(angle) * scaledRadius;
              const y = centerY + Math.sin(angle) * scaledRadius;

              if (set.id === "your-site") {
                return (
                  <g
                    key={`${set.id}-${position.axes[index]}`}
                    onMouseEnter={() => setActiveAxisIndex(index)}
                    onMouseLeave={() => setActiveAxisIndex(null)}
                    onFocus={() => setActiveAxisIndex(index)}
                    onBlur={() => setActiveAxisIndex(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAxisIndex(index === activeAxisIndex ? null : index);
                    }}
                  >
                    <motion.circle
                      className={styles.dotHitArea}
                      cx={x}
                      cy={y}
                      r="22"
                      tabIndex={0}
                      aria-label={`${position.axes[index]}: ${value}/100`}
                    />
                    <motion.circle
                      className={`${set.dotClassName} ${
                        activeAxisIndex === index ? styles.siteDotActive : ""
                      }`}
                      cx={x}
                      cy={y}
                      r={activeAxisIndex === index ? 7 : 5.5}
                      animate={activeAxisIndex === index ? { scale: 1.2 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    {/* Add a pulse effect to show it's clickable */}
                    <motion.circle
                      className={styles.dotPulse}
                      cx={x}
                      cy={y}
                      r="5.5"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: index * 0.3,
                      }}
                    />
                  </g>
                );
              }

              return (
                <circle
                  key={`${set.id}-${position.axes[index]}`}
                  className={set.dotClassName}
                  cx={x}
                  cy={y}
                  r="4"
                />
              );
            }),
          )}

          {axes.map((axis, index) => {
            const isLeft = axis.labelX < centerX - 8;
            const isRight = axis.labelX > centerX + 8;
            const textAnchor = isLeft ? "end" : isRight ? "start" : "middle";
            const labelX = axis.labelX + (isLeft ? 10 : isRight ? -10 : 0);

            return (
              <text
                key={`label-${axis.label}`}
                className={`${styles.axisLabel} ${
                  activeAxisIndex === index ? styles.axisLabelActive : ""
                } ${activeAxisIndex !== null && activeAxisIndex !== index ? styles.axisLabelDimmed : ""}`}
                x={labelX}
                y={axis.labelY}
                textAnchor={textAnchor}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAxisIndex(index === activeAxisIndex ? null : index);
                }}
                onMouseEnter={() => setActiveAxisIndex(index)}
                onMouseLeave={() => setActiveAxisIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {axis.label}
              </text>
            );
          })}
        </svg>

        <AnimatePresence>
          {!locked && activeAxis && activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, x: tooltipTranslateX }}
              animate={{ opacity: 1, y: 0, scale: 1, x: tooltipTranslateX }}
              exit={{ opacity: 0, scale: 0.95, x: tooltipTranslateX }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={styles.axisTooltip}
              style={{
                left: `${tooltipLeftPercent}%`,
                top: `${tooltipTopPercent}%`,
              }}
            >
              <p className={styles.axisTooltipTitle}>
                {activeAxis.label} · {activeValue}/100
              </p>
              <p className={styles.axisTooltipText}>
                {position.axis_explanations[activeAxis.label]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.legend} aria-hidden="true">
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.siteSwatch}`} />
            Your Site
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.competitorSwatch}`} />
            Top Competitor
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.averageSwatch}`} />
            Category Average
          </span>
        </div>

        {locked && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>Unlock the execution gap</p>
            <p className={styles.lockedText}>
              Submit a website to replace this preview with an AI-estimated competitive position read.
            </p>
          </div>
        )}
      </div>

      <p className={styles.insight}>{position.insight}</p>
      <p className={styles.methodNote}>{position.method_note}</p>
    </motion.div>
  );
}
