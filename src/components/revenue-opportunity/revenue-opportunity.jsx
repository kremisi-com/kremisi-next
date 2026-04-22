"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import styles from "./revenue-opportunity.module.css";

const FUNNEL_STEP_IDS = [
  "visits",
  "understood-offer",
  "trusted-brand",
  "clicked-cta",
  "submitted-lead",
];

const LEGACY_FUNNEL_STEP_IDS = [
  "landing-visits",
  "hero-retention",
  "scroll-depth",
  "cta-reach",
  "cta-click",
  "lead-submit",
];

const FALLBACK_FUNNEL_STEPS = [
  { id: "visits", range_min: 100, range_max: 100 },
  { id: "understood-offer", range_min: 62, range_max: 78 },
  { id: "trusted-brand", range_min: 43, range_max: 58 },
  { id: "clicked-cta", range_min: 15, range_max: 24 },
  { id: "submitted-lead", range_min: 4, range_max: 9 },
];

const EXPLANATION_MICROCOPY =
  "Estimated from CTA placement, visual hierarchy, trust signals, readability and friction patterns.";
const STEP_INSIGHT_EXPLANATION_MAX_CHARS = 190;
const STEP_INSIGHT_QUICK_FIX_MAX_CHARS = 90;

const LOCALE_COPY = {
  en: {
    eyebrow: "Strategic Intelligence",
    title: "AI Funnel Simulation",
    subtitle: "Estimated conversion flow from landing to lead",
    badge: "Opportunity Score",
    funnelHeading: "Estimated Funnel",
    analysisHeading: "AI Readout",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    biggestLeak: "Biggest Leak",
    quickestWin: "Quickest Win",
    stepInsightHeading: "Live Step Insight",
    stepRatingLabel: "Rate",
    quickFixLabel: "Quick Fix",
    noFixLabel: "No Fix Needed",
    noFixText: "This step is already performing at top level.",
    dropOff: "Drop-off",
    steps: {
      visits: "Visits",
      "understood-offer": "Understood Offer",
      "trusted-brand": "Trusted Brand",
      "clicked-cta": "Clicked CTA",
      "submitted-lead": "Submitted Lead",
    },
    insightByStep: {
      visits: {
        explanation:
          "Traffic reaches the page, but users bounce fast when the first screen feels crowded, has weak headline contrast, or opens with generic copy instead of a clear promise.",
        quickFixes: [
          "Replace vague hero copy with one concrete outcome in the first headline line.",
          "Remove one competing visual block above the fold to reduce split attention.",
        ],
      },
      "understood-offer": {
        explanation:
          "Users keep scrolling without understanding what is sold when pricing logic, deliverables, or audience fit are hidden behind abstract branding and long intro sections.",
        quickFixes: [
          "Add a one-line 'what you get' strip directly under the hero with scope and timeline.",
          "Show a visible package or service summary before any long storytelling section.",
        ],
      },
      "trusted-brand": {
        explanation:
          "Visitors hesitate when proof is weak: no named client logos, no outcome metrics, and testimonials that do not mention measurable results or real business context.",
        quickFixes: [
          "Move strongest proof block (logos, numbers, case snippet) above the first CTA.",
          "Rewrite one testimonial to include specific outcome and timeframe.",
        ],
      },
      "clicked-cta": {
        explanation:
          "Intent drops when the CTA blends into the layout, repeats too late, or uses low-commitment labels that do not explain what happens after the click.",
        quickFixes: [
          "Increase CTA contrast and keep one primary action color across the page.",
          "Change CTA text to outcome-based language (for example, 'Get My Audit').",
        ],
      },
      "submitted-lead": {
        explanation:
          "Form starts are lost when fields feel excessive, response time is unclear, or users cannot see privacy reassurance near the submit action.",
        quickFixes: [
          "Cut non-essential fields and keep only what is needed for first contact.",
          "Add a short trust line under submit with response window and privacy note.",
        ],
      },
    },
    lockedTitle: "Unlock the funnel simulation",
    lockedText:
      "Submit a website to replace this preview with an AI-estimated funnel, key leaks, and fastest wins.",
    fallbackStrengths: [
      "Primary value proposition is visible early.",
      "Visual contrast supports headline readability.",
    ],
    fallbackWeaknesses: [
      "Primary CTA loses visibility after the hero.",
      "Mid-page sections dilute decision momentum.",
    ],
    fallbackLeak:
      "Conversion momentum drops most between scroll depth and CTA reach.",
    fallbackWin: "Repeat the primary CTA sooner with tighter supporting proof.",
  },
  it: {
    eyebrow: "Intelligence Strategica",
    title: "Simulazione Funnel AI",
    subtitle: "Flusso di conversione stimato da landing a lead",
    badge: "Opportunity Score",
    funnelHeading: "Funnel Stimato",
    analysisHeading: "Lettura AI",
    strengths: "Punti di Forza",
    weaknesses: "Debolezze",
    biggestLeak: "Perdita Maggiore",
    quickestWin: "Win Più Rapido",
    stepInsightHeading: "Insight Dinamico",
    stepRatingLabel: "Valutazione",
    quickFixLabel: "Quick Fix",
    noFixLabel: "Nessuna Correzione",
    noFixText: "Questo step è già performante al massimo livello.",
    dropOff: "Perdita",
    steps: {
      visits: "Visits",
      "understood-offer": "Understood Offer",
      "trusted-brand": "Trusted Brand",
      "clicked-cta": "Clicked CTA",
      "submitted-lead": "Submitted Lead",
    },
    insightByStep: {
      visits: {
        explanation:
          "Il 100% in Visits rappresenta il pubblico iniziale che entra nel funnel: sono gli step successivi a determinare la conversione.",
        quickFixes: [
          "Sostituisci il titolo hero con una promessa concreta già nella prima riga.",
          "Rimuovi un elemento visivo sopra la piega per ridurre distrazioni.",
        ],
      },
      "understood-offer": {
        explanation:
          "Gli utenti scorrono ma non capiscono cosa vendi quando pacchetti, deliverable e target sono nascosti dietro branding astratto e sezioni introduttive troppo lunghe.",
        quickFixes: [
          "Inserisci sotto la hero una riga chiara con risultato, scope e tempi.",
          "Mostra sintesi servizi/pacchetti prima delle sezioni narrative estese.",
        ],
      },
      "trusted-brand": {
        explanation:
          "La fiducia cala quando mancano prove visibili: loghi clienti, metriche di risultato e testimonianze con numeri reali e contesto business.",
        quickFixes: [
          "Sposta il blocco prova più forte sopra la prima CTA.",
          "Aggiorna una testimonianza con risultato specifico e finestra temporale.",
        ],
      },
      "clicked-cta": {
        explanation:
          "L'intenzione si perde quando la CTA non emerge visivamente, riappare tardi o usa testo debole che non spiega cosa succede dopo il click.",
        quickFixes: [
          "Aumenta il contrasto CTA e mantieni un solo colore d'azione primario.",
          "Usa un testo CTA orientato al risultato, non generico.",
        ],
      },
      "submitted-lead": {
        explanation:
          "I lead si perdono nel form quando i campi sono troppi, il tempo di risposta non è chiaro e mancano rassicurazioni privacy vicino al submit.",
        quickFixes: [
          "Riduci i campi al minimo indispensabile per il primo contatto.",
          "Aggiungi sotto al bottone tempi di risposta e nota privacy sintetica.",
        ],
      },
    },
    lockedTitle: "Sblocca la simulazione del funnel",
    lockedText:
      "Invia un sito per sostituire questa anteprima con un funnel stimato dall'AI, le perdite principali e i win più rapidi.",
    fallbackStrengths: [
      "La proposta di valore principale emerge subito.",
      "Il contrasto visivo aiuta la leggibilità del messaggio.",
    ],
    fallbackWeaknesses: [
      "La CTA primaria perde visibilità dopo la hero.",
      "Le sezioni centrali rallentano la spinta alla decisione.",
    ],
    fallbackLeak:
      "La perdita maggiore avviene tra profondità di scroll e reach della CTA.",
    fallbackWin:
      "Ripeti la CTA primaria prima con prove di fiducia più immediate.",
  },
};

function isValidFunnelStep(step, index, expectedIds, previousStep = null) {
  if (!step || typeof step !== "object" || Array.isArray(step)) return false;

  if (
    step.id !== expectedIds[index] ||
    !Number.isInteger(step.range_min) ||
    !Number.isInteger(step.range_max) ||
    step.range_min < 0 ||
    step.range_max > 100 ||
    step.range_min > step.range_max
  ) {
    return false;
  }

  if (index === 0) {
    return step.range_min === 100 && step.range_max === 100;
  }

  return (
    Boolean(previousStep) &&
    step.range_min <= previousStep.range_min &&
    step.range_max <= previousStep.range_max
  );
}

function hasValidFunnelShape(steps, expectedIds) {
  return (
    Array.isArray(steps) &&
    steps.length === expectedIds.length &&
    steps.every((step, index, sourceSteps) =>
      isValidFunnelStep(
        step,
        index,
        expectedIds,
        index > 0 ? sourceSteps[index - 1] : null,
      ),
    )
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function truncateWithEllipsis(value, maxChars) {
  if (!isNonEmptyString(value)) return "";

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxChars) {
    return normalized;
  }

  const cutLength = Math.max(maxChars - 3, 1);
  return `${normalized.slice(0, cutLength).trimEnd()}...`;
}

function normalizeStepInsight(stepInsight, fallbackInsight) {
  const source =
    stepInsight && typeof stepInsight === "object" && !Array.isArray(stepInsight)
      ? stepInsight
      : {};

  const fallbackQuickFixes = Array.isArray(fallbackInsight.quickFixes)
    ? fallbackInsight.quickFixes
    : [];
  const sourceQuickFixes = Array.isArray(source.quick_fixes)
    ? source.quick_fixes
    : [];

  return {
    explanation: truncateWithEllipsis(
      isNonEmptyString(source.explanation)
        ? source.explanation
        : fallbackInsight.explanation,
      STEP_INSIGHT_EXPLANATION_MAX_CHARS,
    ),
    quickFixes: fallbackQuickFixes.map((fallbackItem, index) =>
      truncateWithEllipsis(
        isNonEmptyString(sourceQuickFixes[index])
          ? sourceQuickFixes[index]
          : fallbackItem,
        STEP_INSIGHT_QUICK_FIX_MAX_CHARS,
      ),
    ),
  };
}

function normalizeStepInsights(stepInsights, copy) {
  const source =
    stepInsights &&
    typeof stepInsights === "object" &&
    !Array.isArray(stepInsights)
      ? stepInsights
      : {};

  return Object.fromEntries(
    FUNNEL_STEP_IDS.map((stepId) => [
      stepId,
      normalizeStepInsight(source[stepId], copy.insightByStep[stepId]),
    ]),
  );
}

function normalizeTwoItemList(input, fallback) {
  const source = Array.isArray(input) ? input : [];

  return fallback.map((fallbackItem, index) =>
    isNonEmptyString(source[index]) ? source[index] : fallbackItem,
  );
}

function mapLegacyFunnelToCurrent(legacySteps) {
  const byId = Object.fromEntries(legacySteps.map((step) => [step.id, step]));

  return [
    {
      id: "visits",
      range_min: byId["landing-visits"].range_min,
      range_max: byId["landing-visits"].range_max,
    },
    {
      id: "understood-offer",
      range_min: byId["hero-retention"].range_min,
      range_max: byId["hero-retention"].range_max,
    },
    {
      id: "trusted-brand",
      range_min: byId["scroll-depth"].range_min,
      range_max: byId["scroll-depth"].range_max,
    },
    {
      id: "clicked-cta",
      range_min: byId["cta-click"].range_min,
      range_max: byId["cta-click"].range_max,
    },
    {
      id: "submitted-lead",
      range_min: byId["lead-submit"].range_min,
      range_max: byId["lead-submit"].range_max,
    },
  ];
}

function normalizeRevenueData(data, copy) {
  const source =
    data && typeof data === "object" && !Array.isArray(data) ? data : {};

  const hasValidCurrentFunnel = hasValidFunnelShape(
    source.funnel_steps,
    FUNNEL_STEP_IDS,
  );
  const hasValidLegacyFunnel = hasValidFunnelShape(
    source.funnel_steps,
    LEGACY_FUNNEL_STEP_IDS,
  );

  const funnel_steps = hasValidCurrentFunnel
    ? source.funnel_steps
    : hasValidLegacyFunnel
      ? mapLegacyFunnelToCurrent(source.funnel_steps)
      : FALLBACK_FUNNEL_STEPS;

  const strengths = normalizeTwoItemList(source.strengths, copy.fallbackStrengths);

  const weaknesses = normalizeTwoItemList(
    source.weaknesses,
    copy.fallbackWeaknesses,
  );
  const step_insights = normalizeStepInsights(source.step_insights, copy);

  return {
    hasRealData: hasValidCurrentFunnel || hasValidLegacyFunnel,
    opportunity_score:
      Number.isInteger(source.opportunity_score) &&
      source.opportunity_score >= 0 &&
      source.opportunity_score <= 100
        ? source.opportunity_score
        : 89,
    funnel_steps,
    strengths,
    weaknesses,
    step_insights,
    biggest_leak:
      typeof source.biggest_leak === "string" && source.biggest_leak.trim()
        ? source.biggest_leak
        : copy.fallbackLeak,
    quickest_win:
      typeof source.quickest_win === "string" && source.quickest_win.trim()
        ? source.quickest_win
        : copy.fallbackWin,
  };
}

function formatRange(min, max) {
  return min === max ? `${min}%` : `${min}-${max}%`;
}

function getStepScore(step) {
  const average = (step.range_min + step.range_max) / 2;
  const scaled = Math.round((average / 100) * 5);
  return Math.min(5, Math.max(1, scaled));
}

export default function RevenueOpportunity({
  className = "",
  data = null,
  locked = false,
  locale = "en",
}) {
  const reduceMotion = useReducedMotion();
  const copy = LOCALE_COPY[locale] || LOCALE_COPY.en;
  const revenue = normalizeRevenueData(data, copy);
  const showLockedOverlay = locked || !revenue.hasRealData;
  const [activeStepId, setActiveStepId] = useState(FUNNEL_STEP_IDS[0]);
  const [hasUserHoveredFunnel, setHasUserHoveredFunnel] = useState(false);

  useEffect(() => {
    const stepStillAvailable = revenue.funnel_steps.some(
      (step) => step.id === activeStepId,
    );

    if (!stepStillAvailable) {
      setActiveStepId(revenue.funnel_steps[0]?.id || FUNNEL_STEP_IDS[0]);
    }
  }, [activeStepId, revenue.funnel_steps]);

  useEffect(() => {
    if (
      hasUserHoveredFunnel ||
      showLockedOverlay ||
      revenue.funnel_steps.length < 2
    ) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setActiveStepId((currentStepId) => {
        const currentIndex = revenue.funnel_steps.findIndex(
          (step) => step.id === currentStepId,
        );
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + 1) % revenue.funnel_steps.length;

        return revenue.funnel_steps[nextIndex].id;
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, [hasUserHoveredFunnel, revenue.funnel_steps, showLockedOverlay]);

  const activeStep = useMemo(
    () =>
      revenue.funnel_steps.find((step) => step.id === activeStepId) ||
      revenue.funnel_steps[0],
    [activeStepId, revenue.funnel_steps],
  );

  const activeInsight = revenue.step_insights[activeStep.id];
  const activeScore = getStepScore(activeStep);
  const isPerfectStep = activeScore === 5;

  return (
    <motion.div
      className={[styles.panel, className].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{copy.title}</p>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>
        <span className={styles.badge}>
          {copy.badge} +{revenue.opportunity_score}
        </span>
      </div>

      <div
        className={`${styles.chartShell} ${showLockedOverlay ? styles.chartShellLocked : ""}`}
      >
        <div className={styles.chartGlow} aria-hidden="true" />

        <div className={styles.simulationGrid}>
          <section className={styles.funnelPanel}>
            <p className={styles.sectionHeading}>{copy.funnelHeading}</p>

            <div className={styles.funnelList}>
              {revenue.funnel_steps.map((step, index) => {
                const previousStepMin =
                  index > 0 ? revenue.funnel_steps[index - 1].range_min : 100;
                const dropOffWidth = Math.max(
                  previousStepMin - step.range_min,
                  0,
                );
                const isActive = step.id === activeStep.id;

                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    className={`${styles.funnelRow} ${isActive ? styles.funnelRowActive : ""}`}
                    aria-pressed={isActive}
                    onMouseEnter={() => {
                      setActiveStepId(step.id);
                      setHasUserHoveredFunnel(true);
                    }}
                    onFocus={() => setActiveStepId(step.id)}
                    onClick={() => setActiveStepId(step.id)}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={
                      reduceMotion ? undefined : { opacity: 1, y: 0 }
                    }
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.52,
                      delay: 0.08 + index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className={styles.funnelTop}>
                      <span className={styles.stepLabel}>
                        {copy.steps[step.id]}
                      </span>
                      <span className={styles.rangeValue}>
                        {formatRange(step.range_min, step.range_max)}
                      </span>
                    </div>

                    <div className={styles.funnelRail} aria-hidden="true">
                      <motion.span
                        className={styles.funnelCore}
                        style={{ width: `${step.range_min}%` }}
                        initial={reduceMotion ? false : { width: 0 }}
                        whileInView={
                          reduceMotion
                            ? undefined
                            : { width: `${step.range_min}%` }
                        }
                        viewport={{ once: true, amount: 0.65 }}
                        transition={{
                          duration: 0.62,
                          delay: 0.14 + index * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                      <motion.span
                        className={styles.funnelRange}
                        style={{
                          left: `${step.range_min}%`,
                          width: `${dropOffWidth}%`,
                        }}
                        initial={
                          reduceMotion ? false : { width: 0, opacity: 0 }
                        }
                        whileInView={
                          reduceMotion
                            ? undefined
                            : {
                                width: `${isActive ? 0 : dropOffWidth}%`,
                                opacity: isActive ? 0 : 1,
                              }
                        }
                        viewport={{ once: true, amount: 0.65 }}
                        transition={{
                          duration: isActive ? 0.38 : 0.7,
                          delay: isActive ? 0 : 0.2 + index * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <div className={styles.stepInsightPanel}>
            <p className={styles.sectionHeading}>{copy.stepInsightHeading}</p>

            <AnimatePresence mode="wait">
              <motion.article
                key={activeStep.id}
                className={styles.stepInsightCard}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className={styles.stepInsightTop}>
                  <p className={styles.stepInsightTitle}>
                    {copy.steps[activeStep.id]}
                  </p>
                  <p className={styles.stepInsightScore}>
                    {copy.stepRatingLabel} {activeScore}/5
                  </p>
                </div>

                <p className={styles.stepInsightText}>
                  {activeInsight.explanation}
                </p>

                <div className={styles.stepInsightMeta}>
                  {isPerfectStep ? (
                    <p className={styles.noFixText}>
                      <span className={styles.noFixLabel}>
                        {copy.noFixLabel}:
                      </span>{" "}
                      {copy.noFixText}
                    </p>
                  ) : (
                    <div>
                      <p className={styles.quickFixLabel}>
                        {copy.quickFixLabel}
                      </p>
                      <ul className={styles.quickFixList}>
                        {activeInsight.quickFixes.map((item, index) => (
                          <li key={`${activeStep.id}-fix-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <aside className={styles.analysisPanel}>
            <p className={styles.sectionHeading}>{copy.analysisHeading}</p>

            <div className={styles.analysisGrid}>
              <article className={styles.analysisCard}>
                <p className={styles.analysisLabel}>{copy.strengths}</p>
                <ul className={styles.analysisList}>
                  {revenue.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.analysisCard}>
                <p className={styles.analysisLabel}>{copy.weaknesses}</p>
                <ul className={styles.analysisList}>
                  {revenue.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.analysisCard}>
                <p className={styles.analysisLabel}>{copy.biggestLeak}</p>
                <p className={styles.analysisText}>{revenue.biggest_leak}</p>
              </article>

              <article
                className={`${styles.analysisCard} ${styles.quickWinCard}`}
              >
                <p className={styles.analysisLabel}>{copy.quickestWin}</p>
                <p className={styles.analysisText}>{revenue.quickest_win}</p>
              </article>
            </div>
          </aside>
        </div>

        <p className={styles.methodNote}>{EXPLANATION_MICROCOPY}</p>

        {showLockedOverlay && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>{copy.lockedTitle}</p>
            <p className={styles.lockedText}>{copy.lockedText}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
