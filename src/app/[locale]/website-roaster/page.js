"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GitButton from "@/components/git-button/git-button";
import styles from "./page.module.css";
import MarketMomentum from "@/components/market-momentum/market-momentum";
import CompetitivePosition from "@/components/competitive-position/competitive-position";
import RevenueOpportunity from "@/components/revenue-opportunity/revenue-opportunity";
import Turnstile from "@/components/turnstile/turnstile";

const FUNNEL_CACHE_PREFIX = "roaster:funnel:";
const FUNNEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeWebsiteUrl(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste a URL before starting.");
  }

  return new URL(
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
  ).toString();
}

function buildFunnelCacheKey(normalizedUrl, language) {
  return `${FUNNEL_CACHE_PREFIX}${encodeURIComponent(normalizedUrl)}:${language}`;
}

function readFunnelCache(normalizedUrl, language) {
  if (typeof window === "undefined") return null;

  const storageKey = buildFunnelCacheKey(normalizedUrl, language);
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const artifact =
      typeof parsed?.artifact === "string" ? parsed.artifact : "";
    const savedAt = Number(parsed?.savedAt || 0);
    const explicitExpiresAt = Date.parse(parsed?.expiresAt || "");
    const expiresAtMs = Number.isFinite(explicitExpiresAt)
      ? explicitExpiresAt
      : savedAt + FUNNEL_CACHE_TTL_MS;

    if (
      !artifact ||
      !Number.isFinite(expiresAtMs) ||
      Date.now() > expiresAtMs
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return {
      artifact,
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function writeFunnelCache({ normalizedUrl, language, artifact, expiresAt }) {
  if (typeof window === "undefined") return;

  if (!artifact) return;

  const storageKey = buildFunnelCacheKey(normalizedUrl, language);
  const payload = {
    artifact,
    expiresAt,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function clearFunnelCache(normalizedUrl, language) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(buildFunnelCacheKey(normalizedUrl, language));
}

export default function WebsiteRoaster() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("it");
  const [loading, setLoading] = useState(false);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [readMoreExpanded, setReadMoreExpanded] = useState(false);
  const [mobileCollapsedReviewHeight, setMobileCollapsedReviewHeight] =
    useState(null);
  const [reviewBase, setReviewBase] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [reviewContext, setReviewContext] = useState(null);
  const [funnelArtifact, setFunnelArtifact] = useState("");
  const [funnelExpiresAt, setFunnelExpiresAt] = useState("");
  const [funnelMessage, setFunnelMessage] = useState("");
  const [error, setError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [progress, setProgress] = useState(0);
  const [funnelProgress, setFunnelProgress] = useState(0);
  const [showSlowServerMessage, setShowSlowServerMessage] = useState(false);
  const turnstileRef = useRef(null);
  const reviewBodyRef = useRef(null);
  const clarityOfferRef = useRef(null);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) return prev + 1;
          return prev;
        });
      }, 150); // 15000ms / 100 steps = 150ms per step
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      setShowSlowServerMessage(false);
      return;
    }

    setShowSlowServerMessage(false);
    const timeout = setTimeout(() => {
      setShowSlowServerMessage(true);
    }, 45_000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (!funnelLoading) {
      setFunnelProgress(0);
      return;
    }

    const start = performance.now();
    const durationMs = 15_000;
    let frameId = null;

    const tick = (now) => {
      const elapsed = now - start;
      const nextProgress = Math.min((elapsed / durationMs) * 100, 100);
      setFunnelProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [funnelLoading]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const syncViewport = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    setReadMoreExpanded(false);
  }, [reviewBase]);

  useEffect(() => {
    if (!isMobileViewport) {
      setReadMoreExpanded(false);
    }
  }, [isMobileViewport]);

  const handleRoast = async () => {
    let normalizedUrl;

    try {
      normalizedUrl = normalizeWebsiteUrl(url);
    } catch {
      setError("The URL you entered does not look valid.");
      return;
    }

    if (!turnstileToken) {
      setError("Complete the security check before starting the review.");
      return;
    }

    setLoading(true);
    setReviewBase(null);
    setRevenueData(null);
    setReviewContext(null);
    setFunnelArtifact("");
    setFunnelExpiresAt("");
    setFunnelMessage("");
    setError(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "base",
          url: normalizedUrl,
          language,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");
      setReviewBase(data.review || null);
      setReviewContext({
        normalizedUrl,
        language,
      });

      const artifact =
        typeof data.funnel_artifact === "string" ? data.funnel_artifact : "";
      const expiresAt =
        typeof data.funnel_expires_at === "string"
          ? data.funnel_expires_at
          : "";

      setFunnelArtifact(artifact);
      setFunnelExpiresAt(expiresAt);

      if (artifact) {
        writeFunnelCache({
          normalizedUrl,
          language,
          artifact,
          expiresAt,
        });
      } else {
        setFunnelMessage(
          "Funnel cache is not available for this review. Run Start Review again.",
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setTurnstileToken("");
      turnstileRef.current?.reset?.();
      setLoading(false);
    }
  };

  const handleRunFunnel = async () => {
    if (!reviewContext) {
      setFunnelMessage(
        "Run Start Review first to prepare the cached page snapshot.",
      );
      return;
    }

    setFunnelLoading(true);
    setError(null);
    setFunnelMessage("");

    try {
      let artifactToUse = funnelArtifact;
      const expiresAtMs = Date.parse(funnelExpiresAt || "");
      const artifactExpired =
        Number.isFinite(expiresAtMs) && Date.now() > expiresAtMs;

      if (!artifactToUse || artifactExpired) {
        const cached = readFunnelCache(
          reviewContext.normalizedUrl,
          reviewContext.language,
        );

        if (cached) {
          artifactToUse = cached.artifact;
          setFunnelArtifact(cached.artifact);
          setFunnelExpiresAt(cached.expiresAt);
        }
      }

      if (!artifactToUse) {
        clearFunnelCache(reviewContext.normalizedUrl, reviewContext.language);
        setFunnelMessage(
          "Cached snapshot missing or expired. Run Start Review again.",
        );
        return;
      }

      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "funnel",
          funnel_artifact: artifactToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setRevenueData(data.revenue_opportunity || null);
      setFunnelMessage("");
    } catch (err) {
      if ((err.message || "").toLowerCase().includes("expired")) {
        clearFunnelCache(reviewContext.normalizedUrl, reviewContext.language);
        setFunnelArtifact("");
        setFunnelExpiresAt("");
        setFunnelMessage("Cached snapshot expired. Run Start Review again.");
      } else {
        setError(err.message);
      }
    } finally {
      setFunnelLoading(false);
    }
  };

  const showFullReview = Boolean(reviewBase);
  const uiLocale = reviewContext?.language || (reviewBase ? language : "en");
  const topStrengths = reviewBase?.top_strengths || [];
  const mobileReadMoreEnabled = isMobileViewport && Boolean(reviewBase);
  const shouldCollapseReview = mobileReadMoreEnabled && !readMoreExpanded;
  const reviewBodyId = "website-roaster-review-body";
  const readMoreIssuesId = "review-read-more-issues";
  const readMoreActionsId = "review-read-more-actions";
  const readMorePrompt =
    uiLocale === "it" ? "Leggi l'analisi completa" : "Read full analysis";
  const showLessPrompt = uiLocale === "it" ? "Mostra meno" : "Show less";
  const reviewBodyFrameStyle =
    shouldCollapseReview && mobileCollapsedReviewHeight
      ? {
          "--mobile-review-collapsed-height": `${mobileCollapsedReviewHeight}px`,
        }
      : undefined;
  const renderInfoIntro = (className = "") => (
    <div
      className={`${styles.infoIntro} ${className} ${
        showFullReview ? styles.infoIntroHiddenOnMobile : ""
      }`}
    >
      <div className={styles.infoBlock}>
        <p className={styles.eyebrow}>How it works</p>
        <p className={styles.leadText}>
          The AI analyzes your website structure, messaging and user experience,
          then returns a concise strategic review.
        </p>
      </div>

      <dl className={styles.metaList}>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Input</dt>
          <dd className={styles.metaValue}>
            Use a public URL for the most accurate review.
          </dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Tone</dt>
          <dd className={styles.metaValue}>
            Direct, ironic, annoyingly precise. It is not a joke. It is worse.
          </dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Note</dt>
          <dd className={styles.metaValue}>
            The roast is free. Fixing the site is the part we do together.
          </dd>
        </div>
      </dl>
    </div>
  );

  useEffect(() => {
    if (!mobileReadMoreEnabled || readMoreExpanded) {
      setMobileCollapsedReviewHeight(null);
      return;
    }

    const reviewNode = reviewBodyRef.current;
    const clarityNode = clarityOfferRef.current;

    if (!reviewNode || !clarityNode) return;

    const updateCollapsedHeight = () => {
      setMobileCollapsedReviewHeight(
        Math.ceil(
          clarityNode.offsetTop + Math.min(clarityNode.offsetHeight * 0.32, 92),
        ),
      );
    };

    updateCollapsedHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateCollapsedHeight);
      return () => {
        window.removeEventListener("resize", updateCollapsedHeight);
      };
    }

    const resizeObserver = new ResizeObserver(updateCollapsedHeight);
    resizeObserver.observe(reviewNode);
    resizeObserver.observe(clarityNode);
    window.addEventListener("resize", updateCollapsedHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCollapsedHeight);
    };
  }, [mobileReadMoreEnabled, readMoreExpanded, reviewBase]);

  const renderFunnelSimulationTrigger = (placementClassName) =>
    showFullReview &&
    !loading &&
    !revenueData && (
      <button
        type="button"
        className={`${styles.actionsCard} ${styles.funnelSimulationTrigger} ${placementClassName} ${funnelLoading ? styles.triggerLoading : ""}`}
        onClick={handleRunFunnel}
        disabled={funnelLoading}
      >
        {funnelLoading && (
          <div className={styles.triggerProgressBacking}>
            <div
              className={styles.triggerProgressBar}
              style={{ width: `${funnelProgress}%` }}
            />
            <div className={styles.triggerScanner} />
          </div>
        )}

        <div className={styles.actionsIntro}>
          <p className={styles.listLabel}>AI Funnel Simulation</p>
          <div className={styles.triggerHeaderRight}>
            {funnelLoading && (
              <motion.span
                className={styles.triggerLiveBadge}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                PROCESSING
              </motion.span>
            )}
            <span className={styles.actionsCaption}>
              {uiLocale === "it"
                ? "Analisi comportamentale"
                : "Behavioral analysis"}
            </span>
          </div>
        </div>

        <div className={styles.triggerContent}>
          <p className={styles.triggerText}>
            {uiLocale === "it" ? (
              <>
                I tuoi utenti abbandonano il sito?
                <br />
                Clicca per scoprire esattamente dove e perché.
              </>
            ) : (
              "Are users leaving your site? Click to discover exactly where and why."
            )}
          </p>

          <div className={styles.triggerActionRow}>
            <span className={styles.triggerAction}>
              {funnelLoading
                ? uiLocale === "it"
                  ? "Simulazione in corso..."
                  : "Simulation in progress..."
                : uiLocale === "it"
                  ? "Avvia Simulazione →"
                  : "Start Simulation →"}
            </span>

            {funnelLoading && (
              <div className={styles.triggerProgressBadge}>
                <span className={styles.progressCount}>
                  {Math.round(funnelProgress)}
                </span>
                <span className={styles.progressTotal}>/100</span>
              </div>
            )}
          </div>
        </div>

        {funnelMessage && (
          <p className={styles.statusText}>{funnelMessage}</p>
        )}
      </button>
    );

  return (
    <main className={`page-content-simple ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>AI Tool by Kremisi</p>
          <h1 className={styles.pageTitle}>
            Find out why your website is not converting.
            <br />
            Get a <span className={styles.accent}>sharp review 🔥</span>
          </h1>
          <p className={styles.subtitle}>
            Paste your URL and receive a focused review on clarity, trust,
            positioning and conversion friction.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.contentGrid}>
          <div className={styles.infoColumn}>
            {renderInfoIntro(styles.desktopInfoIntro)}
            <MarketMomentum
              className={styles.momentumWrap}
              data={reviewBase?.market_momentum}
              locked={!reviewBase}
              locale={uiLocale}
            />
            {!reviewBase && (
              <RevenueOpportunity
                className={styles.revenuePreviewWrap}
                locked
                locale={uiLocale}
              />
            )}
            {reviewBase && (
              <CompetitivePosition
                className={styles.competitiveWrap}
                data={reviewBase?.competitive_position}
                locked={!reviewBase}
              />
            )}
          </div>

          <div className={styles.toolColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTag}>
                  Paste the website to roast
                </span>
                <span className={styles.panelCaption}>Brutal honesty mode</span>
              </div>

              <div className={styles.inputRow}>
                <input
                  id="website-roaster-url"
                  className={styles.urlInput}
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !loading && handleRoast()
                  }
                  disabled={loading || funnelLoading}
                />
                <label
                  className={styles.languageField}
                  htmlFor="website-roaster-language"
                >
                  <span className={styles.languageLabel}>Output</span>
                  <select
                    id="website-roaster-language"
                    className={styles.languageSelect}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={loading || funnelLoading}
                  >
                    <option value="it">IT</option>
                    <option value="en">EN</option>
                  </select>
                </label>
                <div className={styles.buttonWrapper}>
                  <button
                    className={styles.roastButton}
                    onClick={handleRoast}
                    disabled={
                      loading || funnelLoading || !url.trim() || !turnstileToken
                    }
                  >
                    {loading ? "Analyzing..." : "Start Review"}
                  </button>
                </div>
              </div>

              <Turnstile
                ref={turnstileRef}
                className={styles.turnstileWrap}
                onTokenChange={setTurnstileToken}
              />

              <AnimatePresence>
                {loading && (
                  <motion.div
                    className={styles.statusPanel}
                    aria-live="polite"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.statusVisual}>
                      <div className={styles.spinner} />
                      <div className={styles.progressRingWrap}>
                        <svg
                          className={styles.progressRing}
                          width="36"
                          height="36"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            className={styles.progressRingBg}
                            cx="18"
                            cy="18"
                            r="16"
                          />
                          <motion.circle
                            className={styles.progressRingFill}
                            cx="18"
                            cy="18"
                            r="16"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 0.15, ease: "linear" }}
                          />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.statusContent}>
                      <div className={styles.statusHeaderRow}>
                        <p className={styles.statusTitle}>
                          Analysis in progress
                        </p>
                        <div className={styles.progressBadge}>
                          <span className={styles.progressCount}>
                            {progress}
                          </span>
                          <span className={styles.progressTotal}>/100</span>
                        </div>
                      </div>
                      <p className={styles.statusText}>
                        We are reading the site and preparing a strategic
                        assessment.
                        <br />
                        It can take from 30 to 90 seconds.
                      </p>
                      {showSlowServerMessage && (
                        <p className={styles.slowServerWarning}>
                          I server sono pieni, quindi ci sono rallentamenti.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {funnelLoading && (
                  <motion.div
                    className={`${styles.statusPanel} ${styles.funnelStatusPanel}`}
                    aria-live="polite"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.statusVisual}>
                      <div className={styles.spinner} />
                      <div className={styles.funnelVisualIcon}>
                        <motion.svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.6, 1, 0.6],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </motion.svg>
                      </div>
                    </div>
                    <div className={styles.statusContent}>
                      <div className={styles.statusHeaderRow}>
                        <p className={styles.statusTitle}>
                          Funnel simulation in progress
                        </p>
                        <span className={styles.liveTag}>LIVE SIMULATION</span>
                      </div>
                      <p className={styles.statusText}>
                        Reusing cached snapshot to estimate conversion leaks and
                        behavioral patterns.
                      </p>
                      <div className={styles.funnelMiniBar}>
                        <motion.div
                          className={styles.funnelMiniBarFill}
                          animate={{
                            left: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className={styles.errorPanel} aria-live="polite">
                  <p className={styles.statusTitle}>Something is off</p>
                  <p className={styles.statusText}>{error}</p>
                </div>
              )}

            </div>

            {renderInfoIntro(styles.mobileInfoIntro)}

            <div
              className={`${styles.scorecardStack} ${
                !reviewBase ? styles.scorecardStackEmpty : ""
              }`}
            >
              <div className={`${styles.panel} ${styles.resultPanel}`}>
                <div className={styles.resultHeader}>
                  <div>
                    <p className={styles.eyebrow}>Review</p>
                    <h2 className={styles.resultTitle}>Strategic scorecard</h2>
                  </div>

                  {showFullReview && (
                    <div className={styles.scoreWrap}>
                      <span className={styles.scoreLabel}>Overall Score</span>
                      <div className={styles.scoreValueRow}>
                        <span className={styles.scoreValue}>
                          {reviewBase.overall_score}
                        </span>
                        <span className={styles.scoreScale}>/5</span>
                      </div>
                      <div className={styles.scoreMeter} aria-hidden="true">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={index}
                            className={`${styles.scoreDot} ${
                              index < reviewBase.overall_score
                                ? styles.scoreDotActive
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!reviewBase && !loading && !funnelLoading && !error && (
                  <p className={styles.emptyState}>
                    The strategic review will appear here, structured and ready
                    for action.
                  </p>
                )}

                {showFullReview && !loading && (
                  <>
                    <div
                      className={`${styles.reviewBodyFrame} ${shouldCollapseReview ? styles.reviewBodyFrameCollapsed : ""}`}
                      style={reviewBodyFrameStyle}
                    >
                      <div
                        id={reviewBodyId}
                        ref={reviewBodyRef}
                        className={styles.reviewBody}
                      >
                        <section className={styles.summaryBlock}>
                          <p className={styles.summaryText}>
                            {reviewBase.summary}
                          </p>
                          <p className={styles.verdictText}>
                            {reviewBase.verdict}
                          </p>
                        </section>

                        <section className={styles.categoriesGrid}>
                          {reviewBase.categories.map((category) => (
                            <article
                              key={category.name}
                              ref={
                                category.name === "Clarity of Offer"
                                  ? clarityOfferRef
                                  : null
                              }
                              className={styles.categoryCard}
                            >
                              <div className={styles.categoryHeader}>
                                <h3 className={styles.categoryTitle}>
                                  {category.name}
                                </h3>
                                <span className={styles.categoryScore}>
                                  {category.score}/5
                                </span>
                              </div>
                              <p className={styles.categoryComment}>
                                {category.comment}
                              </p>
                            </article>
                          ))}
                        </section>

                        <section className={styles.listGrid}>
                          <div className={styles.listCard}>
                            <p className={styles.listLabel}>Top Strengths</p>
                            <ul className={styles.reviewList}>
                              {topStrengths.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div
                            id={readMoreIssuesId}
                            className={styles.listCard}
                          >
                            <p className={styles.listLabel}>Top Issues</p>
                            <ul className={styles.reviewList}>
                              {reviewBase.top_issues.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </section>

                        <section
                          id={readMoreActionsId}
                          className={styles.actionsCard}
                        >
                          <div className={styles.actionsIntro}>
                            <p className={styles.listLabel}>
                              Priority Actions
                            </p>
                            <span className={styles.actionsCaption}>
                              What to fix first
                            </span>
                          </div>
                          <div className={styles.priorityList}>
                            {reviewBase.priority_actions.map((item) => (
                              <div
                                key={item.priority}
                                className={styles.priorityItem}
                              >
                                <span className={styles.priorityBadge}>
                                  {item.priority}
                                </span>
                                <p className={styles.priorityText}>
                                  {item.action}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                      {shouldCollapseReview && (
                        <div className={styles.readMoreGradient} />
                      )}
                    </div>
                    {mobileReadMoreEnabled && (
                      <div className={styles.readMoreToggleWrap}>
                        <button
                          type="button"
                          className={styles.readMoreToggle}
                          aria-expanded={readMoreExpanded}
                          aria-controls={reviewBodyId}
                          onClick={() =>
                            setReadMoreExpanded((expanded) => !expanded)
                          }
                        >
                          {readMoreExpanded ? showLessPrompt : readMorePrompt}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {renderFunnelSimulationTrigger(styles.desktopFunnelTrigger)}
            </div>

            {!reviewBase && (
              <CompetitivePosition
                className={styles.competitiveWrap}
                data={reviewBase?.competitive_position}
                locked={!reviewBase}
              />
            )}
          </div>
        </div>

        {revenueData && (
          <RevenueOpportunity
            className={styles.revenueWrap}
            data={revenueData}
            locked={false}
            locale={uiLocale}
          />
        )}
      </section>

      {renderFunnelSimulationTrigger(styles.mobileFunnelTrigger)}

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaBlob} aria-hidden="true" />

          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>Clear enough?</p>
            <h2 className={styles.ctaTitle}>
              If the review is right
              <br />
              <span className={styles.accent}>it can be improved.</span>
            </h2>
          </div>

          <div className={styles.ctaRight}>
            <p className={styles.ctaText}>
              Find out what actually works on your website and what is slowing
              down your results. Kremisi gives you direct feedback on design,
              development, and structure.
            </p>

            <ul className={styles.ctaBenefits}>
              <li>
                <span className={styles.benefitIcon}>🎨</span>
                <span>Design that respects the audience</span>
              </li>
              <li>
                <span className={styles.benefitIcon}>⚙️</span>
                <span>Solid development, zero shortcuts</span>
              </li>
              <li>
                <span className={styles.benefitIcon}>🎯</span>
                <span>Structure built to convert</span>
              </li>
            </ul>

            <Link href="/contacts" className={styles.ctaGitButtonLink}>
              <GitButton
                text="Let's talk"
                revertColor
                className={styles.ctaGitButton}
                leftShift={10}
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
