"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./revenue-opportunity.module.css";

const REVENUE_STAGES = [
  {
    id: "visits",
    label: "Visits",
    currentValue: "24k",
    optimizedValue: "26k",
    currentWidth: 100,
    optimizedWidth: 100,
  },
  {
    id: "leads",
    label: "Leads",
    currentValue: "540",
    optimizedValue: "930",
    currentWidth: 46,
    optimizedWidth: 68,
  },
  {
    id: "sales",
    label: "Sales",
    currentValue: "42",
    optimizedValue: "71",
    currentWidth: 24,
    optimizedWidth: 40,
  },
  {
    id: "revenue",
    label: "Revenue",
    currentValue: "$12.4k",
    optimizedValue: "$23.5k",
    currentWidth: 18,
    optimizedWidth: 34,
  },
];

export default function RevenueOpportunity({
  className = "",
  locked = false,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={[styles.panel, className].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.eyebrow}>Strategic Intelligence</p>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Revenue Opportunity</p>
          <p className={styles.subtitle}>
            Current vs optimized website performance
          </p>
        </div>
        <span className={styles.badge}>+89% potential</span>
      </div>

      <div className={`${styles.chartShell} ${locked ? styles.chartShellLocked : ""}`}>
        <div className={styles.chartGlow} aria-hidden="true" />
        <div className={styles.chartHeader} aria-hidden="true">
          <span className={styles.chartTitle}>Conversion Funnel</span>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.currentSwatch}`} />
              Current Site
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.optimizedSwatch}`} />
              Optimized Site
            </span>
          </div>
        </div>

        <div className={styles.stageList}>
          {REVENUE_STAGES.map((stage, index) => (
            <div key={stage.id} className={styles.stageRow}>
              <div className={styles.stageMeta}>
                <span className={styles.stageLabel}>{stage.label}</span>
              </div>

              <div className={styles.trackGroup}>
                <div className={styles.trackRow}>
                  <div className={styles.trackRail}>
                    <motion.div
                      className={`${styles.trackFill} ${styles.currentFill}`}
                      initial={reduceMotion ? false : { scaleX: 0, opacity: 0.7 }}
                      whileInView={reduceMotion ? undefined : { scaleX: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.08 + index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ width: `${stage.currentWidth}%` }}
                    />
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Current Site</span>
                    <span className={styles.metricValue}>{stage.currentValue}</span>
                  </div>
                </div>

                <div className={styles.trackRow}>
                  <div className={styles.trackRail}>
                    <motion.div
                      className={`${styles.trackFill} ${styles.optimizedFill}`}
                      initial={reduceMotion ? false : { scaleX: 0, opacity: 0.7 }}
                      whileInView={reduceMotion ? undefined : { scaleX: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{
                        duration: 0.85,
                        delay: 0.16 + index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ width: `${stage.optimizedWidth}%` }}
                    />
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Optimized Site</span>
                    <span className={styles.metricValue}>{stage.optimizedValue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {locked && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>Unlock the revenue projection</p>
            <p className={styles.lockedText}>
              Submit a website to reveal a full funnel view of where conversion
              friction is suppressing revenue.
            </p>
          </div>
        )}
      </div>

      <p className={styles.insight}>
        Small UX and trust improvements can create disproportionate revenue
        gains.
      </p>
    </motion.div>
  );
}
