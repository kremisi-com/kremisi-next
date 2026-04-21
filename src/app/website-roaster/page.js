"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GitButton from "@/components/git-button/git-button";
import styles from "./page.module.css";

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

export default function WebsiteRoaster() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("it");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [roastLevel, setRoastLevel] = useState(null);
  const [shareFeedback, setShareFeedback] = useState("");

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

    setLoading(true);
    setResult(null);
    setError(null);
    setRoastLevel(null);
    setShareFeedback("");

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, language }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      setResult(data.roast);
      setRoastLevel(data.level || Math.floor(Math.random() * 3) + 3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const text = `I had my website roasted by Kremisi's AI. 🔥\n\nTry it here: https://kremisi.com/website-roaster\n\n"${result.slice(0, 120)}..."`;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(text);
      setShareFeedback("Text copied. Now you can paste it anywhere.");
    } catch {
      setShareFeedback("Copy failed. Try again in a second.");
    }
  };

  const currentHeat = roastLevel ? HEAT_LABELS[roastLevel - 1] : null;

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
                  Direct, ironic, annoyingly precise. It is not a joke. It is
                  worse.
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
                  disabled={loading || !url.trim()}
                >
                  {loading ? "Analyzing... 🔍" : "Start Review"}
                </button>
              </div>

              {loading && (
                <div className={styles.statusPanel} aria-live="polite">
                  <div className={styles.spinner} />
                  <div>
                    <p className={styles.statusTitle}>Analysis in progress</p>
                    <p className={styles.statusText}>
                      We are reading the site and preparing a verdict with no
                      anesthesia. Pain is imminent.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className={styles.errorPanel} aria-live="polite">
                  <p className={styles.statusTitle}>😬 Something is off</p>
                  <p className={styles.statusText}>{error}</p>
                </div>
              )}
            </div>

            <div className={`${styles.panel} ${styles.resultPanel}`}>
              <div className={styles.resultHeader}>
                <div>
                  <p className={styles.eyebrow}>Verdict</p>
                  {/* <h2 className={styles.resultTitle}>The AI roast</h2> */}
                </div>

                {currentHeat && (
                  <div className={styles.heatWrap}>
                    <span className={styles.heatLabel}>{currentHeat}</span>
                    <div className={styles.heatMeter} aria-hidden="true">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={`${styles.heatDot} ${
                            index < roastLevel ? styles.heatDotActive : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!result && !loading && !error && (
                <p className={styles.emptyState}>
                  The verdict will appear here. If your site deserves mercy, we
                  cannot promise it.
                </p>
              )}

              {result && !loading && (
                <>
                  <p className={styles.resultText}>{result}</p>

                  <div className={styles.actionsRow}>
                    {/* <button
                      className={styles.secondaryButton}
                      onClick={handleShare}
                    >
                      Copy the roast
                    </button> */}
                    <span className={styles.shareFeedback} aria-live="polite">
                      {shareFeedback}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

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
                <span className={styles.benefitIcon}>📈</span>
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
