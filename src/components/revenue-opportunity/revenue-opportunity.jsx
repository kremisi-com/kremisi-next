"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./revenue-opportunity.module.css";

const LOCALE_COPY = {
  en: {
    title: "Revenue Opportunity",
    subtitle: "Current site vs optimized positioning",
    badge: "Opportunity Score",
    chartTitle: "Performance Delta",
    chartHint: "Scale reads left to right: weaker signal to stronger signal.",
    current: "Current",
    target: "Target",
    scaleStart: "Weaker",
    scaleEnd: "Stronger",
    lockedTitle: "Unlock the opportunity profile",
    lockedText:
      "Submit a website to reveal comparative signals across trust, conversion readiness, CTA clarity, and funnel efficiency.",
    insight: "Based on public website signals and conversion benchmarks.",
  },
  it: {
    title: "Opportunita di Ricavo",
    subtitle: "Sito attuale vs posizionamento ottimizzato",
    badge: "Opportunity Score",
    chartTitle: "Delta di Performance",
    chartHint:
      "La scala si legge da sinistra a destra: segnale piu debole, segnale piu forte.",
    current: "Attuale",
    target: "Target",
    scaleStart: "Piu debole",
    scaleEnd: "Piu forte",
    lockedTitle: "Sblocca il profilo di opportunita",
    lockedText:
      "Invia un sito per vedere i segnali comparativi su trust, prontezza alla conversione, chiarezza della CTA ed efficienza del funnel.",
    insight: "Basato su segnali pubblici del sito e benchmark di conversione.",
  },
};

export default function RevenueOpportunity({
  className = "",
  data = null,
  locked = false,
  locale = "en",
}) {
  const reduceMotion = useReducedMotion();
  const signals = Array.isArray(data?.signals) ? data.signals : [];
  const hasData = signals.length === 5;
  const displayScore =
    typeof data?.opportunity_score === "number" ? data.opportunity_score : 89;
  const copy = LOCALE_COPY[locale] || LOCALE_COPY.en;

  return (
    <motion.div
      className={[styles.panel, className].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.eyebrow}>Strategic Intelligence</p>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{copy.title}</p>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>
        <span className={styles.badge}>
          {copy.badge} +{displayScore}
        </span>
      </div>

      <div
        className={`${styles.chartShell} ${locked ? styles.chartShellLocked : ""}`}
      >
        <div className={styles.chartGlow} aria-hidden="true" />
        <div className={styles.chartHeader} aria-hidden="true">
          <div className={styles.chartHeading}>
            <span className={styles.chartTitle}>{copy.chartTitle}</span>
            <span className={styles.chartHint}>{copy.chartHint}</span>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.currentSwatch}`} />
              {copy.current}
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.optimizedSwatch}`} />
              {copy.target}
            </span>
          </div>
        </div>

        <div className={styles.stageList}>
          {signals.map((stage, index) => (
            <motion.div
              key={stage.id}
              className={styles.stageRow}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.55,
                delay: 0.08 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className={styles.stageMeta}>
                <span className={styles.stageLabel}>{stage.label}</span>
                <span className={styles.stageDirection}>{stage.direction}</span>
              </div>

              <div className={styles.barColumn}>
                <div className={styles.stageSignal} aria-hidden="true">
                  <div className={styles.signalRail} />

                  <motion.div
                    className={`${styles.signalFill} ${styles.currentFill}`}
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={
                      reduceMotion
                        ? undefined
                        : { width: `${stage.current_score}%` }
                    }
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.16 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />

                  <motion.div
                    className={`${styles.signalFill} ${styles.optimizedFill}`}
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={
                      reduceMotion
                        ? undefined
                        : { width: `${stage.optimized_score}%` }
                    }
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.82,
                      delay: 0.24 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                  <motion.div
                    className={styles.signalDot}
                    initial={reduceMotion ? false : { left: 0, opacity: 0 }}
                    whileInView={
                      reduceMotion
                        ? undefined
                        : {
                            left: `${stage.optimized_score}%`,
                            opacity: 1,
                          }
                    }
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.82,
                      delay: 0.24 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>

              <div className={styles.valuesGroup}>
                <div className={styles.valueItem}>
                  <span className={styles.valueType}>{copy.current}</span>
                  <span className={styles.valueNumber}>
                    {stage.current_value}
                  </span>
                </div>

                <div className={styles.valueDivider} />

                <div className={`${styles.valueItem} ${styles.optimizedValueItem}`}>
                  <span className={styles.valueType}>{copy.target}</span>
                  <span className={styles.valueNumber}>
                    {stage.optimized_value}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {(locked || !hasData) && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>{copy.lockedTitle}</p>
            <p className={styles.lockedText}>{copy.lockedText}</p>
          </div>
        )}
      </div>

      <p className={styles.insight}>{copy.insight}</p>
    </motion.div>
  );
}
