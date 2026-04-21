"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GitButton from "@/components/git-button/git-button";
import styles from "./page.module.css";
import MarketMomentum from "@/components/market-momentum/market-momentum";
import CompetitivePosition from "@/components/competitive-position/competitive-position";
import RevenueOpportunity from "@/components/revenue-opportunity/revenue-opportunity";
import Turnstile from "@/components/turnstile/turnstile";

const HEAT_LABELS = [
  "Mild 🌡️",
  "Sharp 🔪",
  "Savage 🔥",
  "Brutal 💀",
  "Nuclear ☢️",
];

function normalizeWebsiteUrl(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste a URL before starting.");
  }

  return new URL(
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
  ).toString();
}

function buildShareText(review) {
  if (!review) return "";
  if (!review.summary || !review.overall_score) return "";

  const topAction = review.priority_actions?.[0]?.action || "";

  return [
    `I analyzed my website with Kremisi's AI review.`,
    `Overall score: ${review.overall_score}/5`,
    `Summary: ${review.summary}`,
    topAction ? `Top priority: ${topAction}` : "",
    "Try it here: https://kremisi.com/website-roaster",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function WebsiteRoaster() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("it");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [debugMode, setDebugMode] = useState("");
  const [error, setError] = useState(null);
  const [shareFeedback, setShareFeedback] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (!shareFeedback) return undefined;

    const timeoutId = window.setTimeout(() => setShareFeedback(""), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [shareFeedback]);

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
    setReview(null);
    setDebugMode("");
    setError(null);
    setShareFeedback("");

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          language,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      setReview(data.review);
      setDebugMode(data.debug_mode || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setTurnstileToken("");
      turnstileRef.current?.reset?.();
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!review) return;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(buildShareText(review));
      setShareFeedback("Review summary copied.");
    } catch {
      setShareFeedback("Copy failed. Try again in a second.");
    }
  };

  const isRevenueDebug = debugMode === "revenue";
  const showFullReview = Boolean(review) && !isRevenueDebug;

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
            {!isRevenueDebug && (
              <>
                <div className={styles.infoBlock}>
                  <p className={styles.eyebrow}>How it works</p>
                  <p className={styles.leadText}>
                    The AI analyzes your website structure, messaging and user
                    experience, then returns a concise strategic review.
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
                      Direct, ironic, annoyingly precise. It is not a joke. It
                      is worse.
                    </dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}>Note</dt>
                    <dd className={styles.metaValue}>
                      The roast is free. Fixing the site is the part we do
                      together.
                    </dd>
                  </div>
                </dl>
                <MarketMomentum
                  className={styles.momentumWrap}
                  data={review?.market_momentum}
                  locked={!review}
                  locale={language}
                />
                {review && (
                  <CompetitivePosition
                    className={styles.competitiveWrap}
                    data={review?.competitive_position}
                    locked={!review}
                  />
                )}
              </>
            )}
            <RevenueOpportunity
              className={styles.revenueWrap}
              data={review?.revenue_opportunity}
              locked={!review}
              locale={language}
            />
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
                  disabled={loading}
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
                    disabled={loading}
                  >
                    <option value="it">IT</option>
                    <option value="en">EN</option>
                  </select>
                </label>
                <button
                  className={styles.roastButton}
                  onClick={handleRoast}
                  disabled={loading || !url.trim() || !turnstileToken}
                >
                  {loading ? "Analyzing..." : "Start Review"}
                </button>
              </div>

              <Turnstile
                ref={turnstileRef}
                className={styles.turnstileWrap}
                onTokenChange={setTurnstileToken}
              />

              {loading && (
                <div className={styles.statusPanel} aria-live="polite">
                  <div className={styles.spinner} />
                  <div>
                    <p className={styles.statusTitle}>Analysis in progress</p>
                    <p className={styles.statusText}>
                      We are reading the site and preparing a strategic
                      assessment.
                      <br />
                      It can take up to a minute.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className={styles.errorPanel} aria-live="polite">
                  <p className={styles.statusTitle}>Something is off</p>
                  <p className={styles.statusText}>{error}</p>
                </div>
              )}
            </div>

            {!isRevenueDebug && (
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
                        {review.overall_score}
                      </span>
                      <span className={styles.scoreScale}>/5</span>
                    </div>
                    <div className={styles.scoreMeter} aria-hidden="true">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={`${styles.scoreDot} ${
                            index < review.overall_score
                              ? styles.scoreDotActive
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!review && !loading && !error && (
                <p className={styles.emptyState}>
                  The strategic review will appear here, structured and ready
                  for action.
                </p>
              )}

              {showFullReview && !loading && (
                <div className={styles.reviewBody}>
                  <section className={styles.summaryBlock}>
                    <p className={styles.summaryText}>{review.summary}</p>
                    <p className={styles.verdictText}>{review.verdict}</p>
                  </section>

                  <section className={styles.categoriesGrid}>
                    {review.categories.map((category) => (
                      <article
                        key={category.name}
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
                        {review.top_strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.listCard}>
                      <p className={styles.listLabel}>Top Issues</p>
                      <ul className={styles.reviewList}>
                        {review.top_issues.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section className={styles.actionsCard}>
                    <div className={styles.actionsIntro}>
                      <p className={styles.listLabel}>Priority Actions</p>
                      <span className={styles.actionsCaption}>
                        What to fix first
                      </span>
                    </div>
                    <div className={styles.priorityList}>
                      {review.priority_actions.map((item) => (
                        <div
                          key={item.priority}
                          className={styles.priorityItem}
                        >
                          <span className={styles.priorityBadge}>
                            {item.priority}
                          </span>
                          <p className={styles.priorityText}>{item.action}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
              </div>
            )}

            {!review && !isRevenueDebug && (
              <CompetitivePosition
                className={styles.competitiveWrap}
                data={review?.competitive_position}
                locked={!review}
              />
            )}
          </div>
        </div>
      </section>

      {!isRevenueDebug && (
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
      )}
    </main>
  );
}
