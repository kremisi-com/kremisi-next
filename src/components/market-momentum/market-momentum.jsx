"use client";

import { useEffect, useRef } from "react";
import styles from "./market-momentum.module.css";

function buildMarketMomentumLabels(currentYear = new Date().getUTCFullYear()) {
  return Array.from({ length: 5 }, (_, index) => String(currentYear - 2 + index));
}

const DEFAULT_PERIOD_LABELS = buildMarketMomentumLabels();
const BADGE_VARIANTS = {
  "Strong Growth": "strongGrowth",
  "Moderate Growth": "moderateGrowth",
  Stable: "stable",
  "Diverging Trends": "mixedSignals",
  "Under Pressure": "underPressure",
  Declining: "declining",
};
const LOCALE_COPY = {
  en: {
    eyebrow: "Strategic Intelligence",
    title: "Market Momentum",
    subtitleTemplate: "Industry trend {sector} vs brand momentum",
    defaultSector: "General",
    industryTrend: "Industry Trend",
    brandMomentum: "Brand Momentum",
    badge: {
      "Strong Growth": "Strong Growth",
      "Moderate Growth": "Moderate Growth",
      Stable: "Stable",
      "Diverging Trends": "Diverging Trends",
      "Under Pressure": "Under Pressure",
      Declining: "Declining",
    },
    lockedTitle: "Unlock the real market read",
    lockedText:
      "Submit a website to replace this preview with an AI-estimated industry-versus-brand momentum read.",
    ariaLabel:
      "Five-year strategic chart comparing industry trend and brand momentum",
    fallbackInsight:
      "The market may improve while the brand loses ground when execution feels dated, but a clear offer or credible specialization can still create room to recover.",
    fallbackMethod:
      "Illustrative preview. Final industry and brand curves are AI-estimated from the submitted site.",
  },
  it: {
    eyebrow: "Intelligence Strategica",
    title: "Momentum di Mercato",
    subtitleTemplate: "Trend di settore {sector} vs slancio del brand",
    defaultSector: "Settore",
    industryTrend: "Trend di Settore",
    brandMomentum: "Slancio del Brand",
    badge: {
      "Strong Growth": "Forte Crescita",
      "Moderate Growth": "Crescita Moderata",
      Stable: "Stabile",
      "Diverging Trends": "Trend Divergenti",
      "Under Pressure": "Sotto Pressione",
      Declining: "In Calo",
    },
    lockedTitle: "Sblocca la vera lettura del mercato",
    lockedText:
      "Invia un sito per sostituire questa anteprima con una lettura AI del trend di settore e dello slancio del brand.",
    ariaLabel:
      "Grafico strategico quinquennale che confronta trend di settore e slancio del brand",
    fallbackInsight:
      "Il mercato puo crescere mentre il brand perde slancio se il sito appare datato o poco distintivo, ma un'offerta chiara o una specializzazione credibile possono ancora sostenerne il potenziale.",
    fallbackMethod:
      "Anteprima illustrativa. Le curve finali di settore e brand sono stime AI basate sul sito inviato.",
  },
};
const FALLBACK_DATA = {
  period_labels: DEFAULT_PERIOD_LABELS,
  industry_trend: [44, 48, 53, 57, 61],
  brand_momentum: [52, 50, 47, 43, 40],
  badge: "Diverging Trends",
};

function normalizeSeries(series, fallback) {
  return Array.isArray(series) && series.length === DEFAULT_PERIOD_LABELS.length
    ? series
    : fallback;
}

function normalizeSectorLabel(sector, fallbackSector) {
  if (typeof sector !== "string") return fallbackSector;

  const cleaned = sector.trim().replace(/[()]/g, "");
  return cleaned || fallbackSector;
}

function normalizeMomentumData(data, copy) {
  if (!data || typeof data !== "object") {
    return {
      ...FALLBACK_DATA,
      sector: copy.defaultSector,
      insight: copy.fallbackInsight,
      method_note: copy.fallbackMethod,
    };
  }

  return {
    period_labels:
      Array.isArray(data.period_labels) &&
      data.period_labels.length === DEFAULT_PERIOD_LABELS.length
        ? data.period_labels
        : FALLBACK_DATA.period_labels,
    sector: normalizeSectorLabel(data.sector, copy.defaultSector),
    industry_trend: normalizeSeries(
      data.industry_trend,
      FALLBACK_DATA.industry_trend,
    ),
    brand_momentum: normalizeSeries(
      data.brand_momentum,
      FALLBACK_DATA.brand_momentum,
    ),
    badge: BADGE_VARIANTS[data.badge] ? data.badge : FALLBACK_DATA.badge,
    insight: data.insight || copy.fallbackInsight,
    method_note: data.method_note || copy.fallbackMethod,
  };
}

export default function MarketMomentum({
  className = "",
  data = null,
  locked = false,
  locale = "it",
}) {
  const canvasRef = useRef(null);
  const chartWrapRef = useRef(null);
  const copy = LOCALE_COPY[locale] || LOCALE_COPY.it;
  const momentum = normalizeMomentumData(data, copy);
  const hasResult = !locked && Boolean(data && typeof data === "object");
  const subtitleParts = copy.subtitleTemplate.split(/(\{sector\})/);

  useEffect(() => {
    const canvas = canvasRef.current;
    const chartWrap = chartWrapRef.current;
    if (!canvas || !chartWrap) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const allValues = [...momentum.industry_trend, ...momentum.brand_momentum];
    const minValue = Math.max(Math.min(...allValues) - 8, 20);
    const maxValue = Math.min(Math.max(...allValues) + 8, 100);
    const padding = { top: 10, right: 0, bottom: 44, left: 0 };
    const gridColor = "rgba(255, 255, 255, 0.04)";
    const tickColor = "rgba(255, 255, 255, 0.44)";
    const industryColor = "#b55d6d";
    const brandColor = "#dc143c";

    const getPoint = (value, index, width, height) => {
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const x =
        padding.left +
        (chartWidth * index) / Math.max(momentum.period_labels.length - 1, 1);
      const y =
        padding.top +
        ((maxValue - value) / Math.max(maxValue - minValue, 1)) * chartHeight;

      return { x, y };
    };

    const drawLine = (points, closePath = false, height = 0) => {
      if (!points.length) return;

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const controlX = (current.x + next.x) / 2;

        context.bezierCurveTo(
          controlX,
          current.y,
          controlX,
          next.y,
          next.x,
          next.y,
        );
      }

      if (closePath) {
        context.lineTo(points[points.length - 1].x, height);
        context.lineTo(points[0].x, height);
        context.closePath();
      }
    };

    const drawSeries = (points, color, width = 2.2, height = 0) => {
      // Draw Area Gradient
      const gradient = context.createLinearGradient(0, padding.top, 0, height);
      gradient.addColorStop(0, `${color}22`);
      gradient.addColorStop(1, "transparent");

      drawLine(points, true, height);
      context.fillStyle = gradient;
      context.fill();

      // Draw Main Line
      drawLine(points);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.lineCap = "round";
      context.lineJoin = "round";

      // Add Glow
      context.shadowBlur = 8;
      context.shadowColor = color;
      context.stroke();

      // Reset Glow for points
      context.shadowBlur = 0;

      const lastPoint = points.at(-1);
      if (!lastPoint) return;

      context.beginPath();
      context.fillStyle = color;
      context.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
      context.fill();
    };

    const drawChart = () => {
      const { width: cssWidth, height: cssHeight } =
        chartWrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(Math.floor(cssWidth), 1);
      const height = Math.max(Math.floor(cssHeight), 1);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      context.font =
        "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      context.textBaseline = "top";

      const industryPoints = momentum.industry_trend.map((value, index) =>
        getPoint(value, index, width, height),
      );
      const brandPoints = momentum.brand_momentum.map((value, index) =>
        getPoint(value, index, width, height),
      );
      const tickIndexes = momentum.period_labels.map((_, index) => index);
      const yTicks = 4;

      for (let index = 0; index < yTicks; index += 1) {
        const y =
          padding.top +
          ((height - padding.top - padding.bottom) * index) / (yTicks - 1);

        context.beginPath();
        context.strokeStyle = gridColor;
        context.lineWidth = 1;
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();
      }

      tickIndexes.forEach((tickIndex) => {
        const point = industryPoints[tickIndex];
        if (!point) return;

        context.beginPath();
        context.strokeStyle = gridColor;
        context.lineWidth = 1;
        context.moveTo(point.x, 0);
        context.lineTo(point.x, height - padding.bottom);
        context.stroke();

        context.fillStyle = tickColor;
        let xPos = point.x;
        
        if (tickIndex === 0) {
          context.textAlign = "left";
          xPos += 8; // Slight margin for the first number
        } else if (tickIndex === tickIndexes.length - 1) {
          context.textAlign = "right";
          xPos -= 8; // Slight margin for the last number
        } else {
          context.textAlign = "center";
        }

        context.fillText(
          momentum.period_labels[tickIndex],
          xPos,
          height - padding.bottom + 12,
        );
      });

      drawSeries(industryPoints, industryColor, 2.2, height - padding.bottom);
      drawSeries(brandPoints, brandColor, 2.6, height - padding.bottom);
    };

    let frameId = 0;
    const scheduleDraw = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(drawChart);
    };

    scheduleDraw();

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(chartWrap);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [momentum]);

  const badgeVariant = BADGE_VARIANTS[momentum.badge] || BADGE_VARIANTS.Stable;
  const badgeLabel = copy.badge[momentum.badge] || momentum.badge;

  return (
    <div className={[styles.panel, className].filter(Boolean).join(" ")}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <div className={styles.titleRow}>
        <div className={styles.titleBlock}>
          <p className={styles.title}>{copy.title}</p>
          <p className={styles.label}>
            {subtitleParts.map((part, i) =>
              part === "{sector}" ? (
                <span key={i} className={styles.sectorHighlight}>
                  ({momentum.sector})
                </span>
              ) : (
                part
              ),
            )}
          </p>
        </div>
        {hasResult && (
          <span className={`${styles.badge} ${styles[badgeVariant]}`}>{badgeLabel}</span>
        )}
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendIndustry}`} />
          {copy.industryTrend}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendBrand}`} />
          {copy.brandMomentum}
        </span>
      </div>
      <div
        className={`${styles.chartWrap} ${locked ? styles.chartWrapLocked : ""}`}
        ref={chartWrapRef}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label={copy.ariaLabel}
        />
        {locked && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>{copy.lockedTitle}</p>
            <p className={styles.lockedText}>{copy.lockedText}</p>
          </div>
        )}
      </div>
      <p className={styles.insight}>{momentum.insight}</p>
      <p className={styles.methodNote}>{momentum.method_note}</p>
    </div>
  );
}
