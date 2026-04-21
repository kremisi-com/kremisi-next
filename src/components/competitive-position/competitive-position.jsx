"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  insight: "Strong technical base. Weak differentiation.",
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
    insight:
      data.insight === FALLBACK_DATA.insight
        ? data.insight
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
        <div className={styles.chartGlow} aria-hidden="true" />
        <svg
          viewBox="0 0 420 360"
          className={styles.chart}
          aria-label="Competitive position radar chart comparing your site, top competitor, and category average"
          role="img"
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
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
            </linearGradient>
            <linearGradient id="competitive-average-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
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

              return <circle key={`${set.id}-${position.axes[index]}`} className={set.dotClassName} cx={x} cy={y} r="3.2" />;
            }),
          )}

          {axes.map((axis) => (
            <text
              key={`label-${axis.label}`}
              className={styles.axisLabel}
              x={axis.labelX}
              y={axis.labelY}
              textAnchor={axis.labelX < centerX - 8 ? "end" : axis.labelX > centerX + 8 ? "start" : "middle"}
            >
              {axis.label}
            </text>
          ))}
        </svg>

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
