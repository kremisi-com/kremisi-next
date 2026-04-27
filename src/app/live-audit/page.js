"use client";

import { useState } from "react";
import styles from "./page.module.css";

function normalizeAuditUrl(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("empty");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const normalizedUrl = new URL(withProtocol);

  if (!normalizedUrl.hostname.includes(".")) {
    throw new Error("invalid");
  }

  return normalizedUrl.toString();
}

function BrowserPreview({
  url,
  displayUrl,
  image,
  isLoading,
  hasError,
  errorMessage,
}) {
  if (!url) {
    return null;
  }

  return (
    <section className={styles.previewShell} aria-label="Website preview">
      <div className={styles.browserWindow}>
        <div className={styles.browserBar}>
          <div className={styles.trafficLights} aria-hidden="true">
            <span className={styles.lightRed} />
            <span className={styles.lightYellow} />
            <span className={styles.lightGreen} />
          </div>
          <div className={styles.addressBar}>
            <span className={styles.addressStatus} aria-hidden="true" />
            <span className={styles.addressText}>{displayUrl}</span>
          </div>
        </div>

        <div className={styles.browserBody}>
          {!hasError && image ? (
            <div className={styles.screenshotStage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.previewImage}
                src={image}
                alt={`Full-page screenshot preview of ${displayUrl}`}
              />
              <div className={styles.overlayLayer} aria-hidden="true" />
            </div>
          ) : null}

          {isLoading && !hasError ? (
            <div className={styles.previewOverlay} role="status">
              <span className={styles.loadingSpinner} aria-hidden="true" />
              <span>Capturing live preview...</span>
            </div>
          ) : null}

          {hasError ? (
            <div className={styles.blockedState}>
              <p className={styles.blockedKicker}>Preview unavailable</p>
              <h2>Screenshot capture failed.</h2>
              <p>
                {errorMessage ||
                  "Browserless could not capture this website. Some sites block automation, require login, or take too long to load."}
              </p>
              <a
                className={styles.openLink}
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                Open website
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function LiveAuditPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [displayUrl, setDisplayUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewErrorMessage, setPreviewErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    let normalizedUrl;

    try {
      normalizedUrl = normalizeAuditUrl(inputUrl);
    } catch {
      setErrorMessage("Enter a valid website URL to preview.");
      setIsLoading(false);
      setCaptureFailed(false);
      return;
    }

    setErrorMessage("");
    setPreviewErrorMessage("");
    setCaptureFailed(false);
    setIsLoading(true);
    setPreviewImage("");
    setPreviewUrl(normalizedUrl);
    setDisplayUrl(normalizedUrl);

    try {
      const response = await fetch("/api/live-audit/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "The screenshot could not be generated.");
      }

      setPreviewImage(data.image);
      setPreviewUrl(data.url);
      setDisplayUrl(data.url);
    } catch (error) {
      setCaptureFailed(true);
      setPreviewErrorMessage(
        error.message ||
          "Browserless could not capture this website. Try another URL.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Live website intelligence</p>
        <h1>Live Website Audit</h1>
        <p className={styles.subtitle}>
          Paste any website URL and preview it inside a polished browser frame.
          AI analysis and overlays will be added in the next phase.
        </p>

        <form className={styles.auditForm} onSubmit={handleSubmit} noValidate>
          <label className={styles.inputLabel} htmlFor="live-audit-url">
            Website URL
          </label>
          <div className={styles.inputRow}>
            <input
              id="live-audit-url"
              className={styles.urlInput}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="example.com"
              value={inputUrl}
              onChange={(event) => {
                setInputUrl(event.target.value);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "live-audit-error" : undefined}
            />
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Preview site"}
            </button>
          </div>
          {errorMessage ? (
            <p className={styles.errorText} id="live-audit-error">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </section>

      <BrowserPreview
        url={previewUrl}
        displayUrl={displayUrl}
        image={previewImage}
        isLoading={isLoading}
        hasError={captureFailed}
        errorMessage={previewErrorMessage}
      />
    </main>
  );
}
