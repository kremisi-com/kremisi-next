"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const locale = useLocale();
  const t = useTranslations("roaster");
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
      setError(t("invalidUrl"));
      return;
    }

    if (!turnstileToken) {
      setError(t("securityRequired"));
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

      if (!res.ok) {
        if (res.status === 422) {
          setError(t("unreadableSite"));
        } else if (data.error === "Security check failed. Refresh the page and try again.") {
          setError(t("securityFailed"));
        } else {
          setError(locale === "en" ? data.error || t("unknownError") : t("reviewFailed"));
        }
        return;
      }
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
        setFunnelMessage(t("noFunnelCache"));
      }
    } catch (err) {
      setError(locale === "en" ? err.message : t("reviewFailed"));
    } finally {
      setTurnstileToken("");
      turnstileRef.current?.reset?.();
      setLoading(false);
    }
  };

  const handleRunFunnel = async () => {
    if (!reviewContext) {
      setFunnelMessage(t("prepareSnapshot"));
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
        setFunnelMessage(t("snapshotMissing"));
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
      if (!res.ok) throw new Error(data.error || t("unknownError"));

      setRevenueData(data.revenue_opportunity || null);
      setFunnelMessage("");
    } catch (err) {
      if ((err.message || "").toLowerCase().includes("expired")) {
        clearFunnelCache(reviewContext.normalizedUrl, reviewContext.language);
        setFunnelArtifact("");
        setFunnelExpiresAt("");
        setFunnelMessage(t("snapshotExpired"));
      } else {
        setError(locale === "en" ? err.message : t("funnelFailed"));
      }
    } finally {
      setFunnelLoading(false);
    }
  };

  const showFullReview = Boolean(reviewBase);
  const outputLocale = reviewContext?.language || language;
  const categories = t.raw("categories");
  const topStrengths = reviewBase?.top_strengths || [];
  const mobileReadMoreEnabled = isMobileViewport && Boolean(reviewBase);
  const shouldCollapseReview = mobileReadMoreEnabled && !readMoreExpanded;
  const reviewBodyId = "website-roaster-review-body";
  const readMoreIssuesId = "review-read-more-issues";
  const readMoreActionsId = "review-read-more-actions";
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
        <p className={styles.eyebrow}>{t("howItWorks")}</p>
        <p className={styles.leadText}>
          {t("howItWorksText")}
        </p>
      </div>

      <dl className={styles.metaList}>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>{t("inputLabel")}</dt>
          <dd className={styles.metaValue}>
            {t("inputText")}
          </dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>{t("toneLabel")}</dt>
          <dd className={styles.metaValue}>
            {t("toneText")}
          </dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>{t("noteLabel")}</dt>
          <dd className={styles.metaValue}>
            {t("noteText")}
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
          <p className={styles.listLabel}>{t("simulation")}</p>
          <div className={styles.triggerHeaderRight}>
            {funnelLoading && (
              <motion.span
                className={styles.triggerLiveBadge}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {t("processing")}
              </motion.span>
            )}
            <span className={styles.actionsCaption}>
              {t("behavioralAnalysis")}
            </span>
          </div>
        </div>

        <div className={styles.triggerContent}>
          <p className={styles.triggerText}>
            {t("simulationDescription")}
          </p>

          <div className={styles.triggerActionRow}>
            <span className={styles.triggerAction}>
              {t(funnelLoading ? "simulationProgress" : "simulationStart")}
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
          <p className={styles.kicker}>{t("kicker")}</p>
          <h1 className={styles.pageTitle}>
            {t("heading")}
            <br />
            {t.rich("headingAccent", {
              accent: (chunks) => <span className={styles.accent}>{chunks}</span>,
            })}
          </h1>
          <p className={styles.subtitle}>
            {t("subtitle")}
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
              locale={locale}
            />
            {!reviewBase && (
              <RevenueOpportunity
                className={styles.revenuePreviewWrap}
                locked
                locale={locale}
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
                  {t("panelTag")}
                </span>
                <span className={styles.panelCaption}>{t("panelCaption")}</span>
              </div>

              <div className={styles.inputRow}>
                <input
                  id="website-roaster-url"
                  className={styles.urlInput}
                  type="url"
                  aria-label={t("urlLabel")}
                  placeholder={t("urlPlaceholder")}
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
                  <span className={styles.languageLabel}>{t("outputLabel")}</span>
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
                    {t(loading ? "analyzing" : "startReview")}
                  </button>
                </div>
              </div>

              <Turnstile
                ref={turnstileRef}
                className={styles.turnstileWrap}
                onTokenChange={setTurnstileToken}
                unavailableMessage={locale === "it" ? t("securityUnavailable") : undefined}
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
                          {t("analyzingTitle")}
                        </p>
                        <div className={styles.progressBadge}>
                          <span className={styles.progressCount}>
                            {progress}
                          </span>
                          <span className={styles.progressTotal}>/100</span>
                        </div>
                      </div>
                      <p className={styles.statusText}>
                        {t("analyzingText")}
                        <br />
                        {t("analyzingTime")}
                      </p>
                      {showSlowServerMessage && (
                        <p className={styles.slowServerWarning}>
                          {t("slowServer")}
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
                          {t("funnelRunning")}
                        </p>
                        <span className={styles.liveTag}>{t("liveSimulation")}</span>
                      </div>
                      <p className={styles.statusText}>
                        {t("funnelRunningText")}
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
                  <p className={styles.statusTitle}>{t("errorTitle")}</p>
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
                    <p className={styles.eyebrow}>{t("review")}</p>
                    <h2 className={styles.resultTitle}>{t("scorecard")}</h2>
                  </div>

                  {showFullReview && (
                    <div className={styles.scoreWrap}>
                      <span className={styles.scoreLabel}>{t("overallScore")}</span>
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
                    {t("emptyReview")}
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
                          <p className={styles.summaryText} lang={outputLocale}>
                            {reviewBase.summary}
                          </p>
                          <p className={styles.verdictText} lang={outputLocale}>
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
                                  {categories[category.name] || category.name}
                                </h3>
                                <span className={styles.categoryScore}>
                                  {category.score}/5
                                </span>
                              </div>
                              <p className={styles.categoryComment} lang={outputLocale}>
                                {category.comment}
                              </p>
                            </article>
                          ))}
                        </section>

                        <section className={styles.listGrid}>
                          <div className={styles.listCard}>
                            <p className={styles.listLabel}>{t("topStrengths")}</p>
                            <ul className={styles.reviewList}>
                              {topStrengths.map((item, index) => (
                                <li key={`${item}-${index}`} lang={outputLocale}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div
                            id={readMoreIssuesId}
                            className={styles.listCard}
                          >
                            <p className={styles.listLabel}>{t("topIssues")}</p>
                            <ul className={styles.reviewList}>
                              {reviewBase.top_issues.map((item) => (
                                <li key={item} lang={outputLocale}>{item}</li>
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
                              {t("priorityActions")}
                            </p>
                            <span className={styles.actionsCaption}>
                              {t("fixFirst")}
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
                                <p className={styles.priorityText} lang={outputLocale}>
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
                          {t(readMoreExpanded ? "showLess" : "readMore")}
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
            locale={locale}
          />
        )}
      </section>

      {renderFunnelSimulationTrigger(styles.mobileFunnelTrigger)}

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaBlob} aria-hidden="true" />

          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>{t("ctaEyebrow")}</p>
            <h2 className={styles.ctaTitle}>
              {t("ctaHeading")}
              <br />
              <span className={styles.accent}>{t("ctaAccent")}</span>
            </h2>
          </div>

          <div className={styles.ctaRight}>
            <p className={styles.ctaText}>
              {t("ctaText")}
            </p>

            <ul className={styles.ctaBenefits}>
              <li>
                <span className={styles.benefitIcon}>🎨</span>
                <span>{t("ctaDesign")}</span>
              </li>
              <li>
                <span className={styles.benefitIcon}>⚙️</span>
                <span>{t("ctaDevelopment")}</span>
              </li>
              <li>
                <span className={styles.benefitIcon}>🎯</span>
                <span>{t("ctaStructure")}</span>
              </li>
            </ul>

            <Link href="/contacts" className={styles.ctaGitButtonLink}>
              <GitButton
                text={t("ctaButton")}
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
