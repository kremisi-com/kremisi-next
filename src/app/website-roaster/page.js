"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const HEAT_LABELS = ["Mild", "Sharp", "Savage", "Brutal", "Nuclear"];

export default function WebsiteRoaster() {
  const [url, setUrl] = useState("");
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
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setRoastLevel(null);
    setShareFeedback("");

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Errore sconosciuto");

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

    const text = `Ho fatto roastare il mio sito da un'AI di Kremisi. 🔥\n\nProva anche tu: https://kremisi.com/website-roaster\n\n\"${result.slice(0, 120)}...\"`;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(text);
      setShareFeedback("Testo copiato. Ora puoi incollarlo dove vuoi.");
    } catch {
      setShareFeedback("Copia non riuscita. Riprova tra un secondo.");
    }
  };

  const currentHeat = roastLevel ? HEAT_LABELS[roastLevel - 1] : null;

  return (
    <main className={`page-content-simple ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>AI Tool by Kremisi</p>
          <h1 className={styles.pageTitle}>
            Fatti fare un <span className={styles.accent}>roast</span> del tuo
            sito
          </h1>
          <p className={styles.subtitle}>
            Inserisci un URL e ottieni un giudizio diretto, ironico e utile.
            Nessuna supercazzola: solo quello che regge, quello che stona e
            quello che andrebbe sistemato subito.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.contentGrid}>
          <div className={styles.infoColumn}>
            <div className={styles.infoBlock}>
              <p className={styles.eyebrow}>Come funziona</p>
              <p className={styles.leadText}>
                L&apos;AI analizza il contenuto pubblico del sito e restituisce
                un roast in stile Kremisi: tagliente, leggibile e con abbastanza
                sostanza da non sembrare una battuta scritta male.
              </p>
            </div>

            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Input</dt>
                <dd className={styles.metaValue}>
                  URL pubblico, homepage o pagina interna.
                </dd>
              </div>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Tono</dt>
                <dd className={styles.metaValue}>
                  Diretto e simpatico, ma non clownesco.
                </dd>
              </div>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Nota</dt>
                <dd className={styles.metaValue}>
                  Nessun dato viene salvato. Premi invio o usa il bottone.
                </dd>
              </div>
            </dl>
          </div>

          <div className={styles.toolColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTag}>Website Roaster</span>
                <span className={styles.panelCaption}>Brutal honesty mode</span>
              </div>

              <label className={styles.inputLabel} htmlFor="website-roaster-url">
                Incolla il sito da roastare
              </label>

              <div className={styles.inputRow}>
                <input
                  id="website-roaster-url"
                  className={styles.urlInput}
                  type="url"
                  placeholder="https://tuosito.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleRoast()}
                  disabled={loading}
                />
                <button
                  className={styles.roastButton}
                  onClick={handleRoast}
                  disabled={loading || !url.trim()}
                >
                  {loading ? "Analisi..." : "Roastami"}
                </button>
              </div>

              <p className={styles.helperText}>
                Meglio un URL reale. Se il sito è vuoto, il roast sarà onestamente
                mediocre.
              </p>

              {loading && (
                <div className={styles.statusPanel} aria-live="polite">
                  <div className={styles.spinner} />
                  <div>
                    <p className={styles.statusTitle}>Analisi in corso</p>
                    <p className={styles.statusText}>
                      Stiamo leggendo il sito e preparando un giudizio senza
                      anestesia.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className={styles.errorPanel} aria-live="polite">
                  <p className={styles.statusTitle}>Qualcosa non torna</p>
                  <p className={styles.statusText}>{error}</p>
                </div>
              )}
            </div>

            <div className={`${styles.panel} ${styles.resultPanel}`}>
              <div className={styles.resultHeader}>
                <div>
                  <p className={styles.eyebrow}>Verdetto</p>
                  <h2 className={styles.resultTitle}>Il roast dell&apos;AI</h2>
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
                  Qui comparirà il responso. Se il sito merita pietà, non possiamo
                  prometterla.
                </p>
              )}

              {result && !loading && (
                <>
                  <p className={styles.resultText}>{result}</p>

                  <div className={styles.actionsRow}>
                    <button className={styles.secondaryButton} onClick={handleShare}>
                      Copia il roast
                    </button>
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
          <p className={styles.eyebrow}>Troppo vero?</p>
          <h2 className={styles.ctaTitle}>
            Se il roast ha ragione, si puo&apos; sistemare.
          </h2>
          <p className={styles.ctaText}>
            Se vuoi trasformare un sito confuso in un sito che converte davvero,
            Kremisi puo&apos; aiutarti con design, sviluppo e struttura.
          </p>
          <Link href="/contacts" className={styles.ctaLink}>
            Parliamone
          </Link>
        </div>
      </section>
    </main>
  );
}
