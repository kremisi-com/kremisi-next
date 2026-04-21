"use client";

import { useEffect, useRef } from "react";
import styles from "./market-momentum.module.css";

const MARKET_MOMENTUM_PERIODS = 5;

function getDefaultPeriodLabels() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: MARKET_MOMENTUM_PERIODS }, (_, index) =>
    String(currentYear - (MARKET_MOMENTUM_PERIODS - 1) + index),
  );
}

const DEFAULT_PERIOD_LABELS = getDefaultPeriodLabels();
const FALLBACK_DATA = {
  label: "Estimated category demand",
  delta_percent: 12,
  period_labels: DEFAULT_PERIOD_LABELS,
  series: [42, 47, 51, 58, 63],
  insight: "Submit a website to unlock an AI-estimated market demand read.",
  method_note: "Synthetic preview. Final chart is generated from the submitted site.",
};

function normalizeMomentumData(data) {
  if (!data || typeof data !== "object") {
    return FALLBACK_DATA;
  }

  return {
    label: data.label || FALLBACK_DATA.label,
    delta_percent:
      typeof data.delta_percent === "number"
        ? Math.round(data.delta_percent)
        : FALLBACK_DATA.delta_percent,
    period_labels:
      Array.isArray(data.period_labels) &&
      data.period_labels.length === DEFAULT_PERIOD_LABELS.length
        ? data.period_labels
        : FALLBACK_DATA.period_labels,
    series:
      Array.isArray(data.series) && data.series.length === DEFAULT_PERIOD_LABELS.length
        ? data.series
        : FALLBACK_DATA.series,
    insight: data.insight || FALLBACK_DATA.insight,
    method_note: data.method_note || FALLBACK_DATA.method_note,
  };
}

export default function MarketMomentum({
  className = "",
  data = null,
  locked = false,
}) {
  const canvasRef = useRef(null);
  const chartWrapRef = useRef(null);
  const momentum = normalizeMomentumData(data);

  useEffect(() => {
    const canvas = canvasRef.current;
    const chartWrap = chartWrapRef.current;
    if (!canvas || !chartWrap) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const minValue = Math.max(Math.min(...momentum.series) - 8, 20);
    const maxValue = Math.min(Math.max(...momentum.series) + 6, 100);
    const padding = { top: 10, right: 10, bottom: 20, left: 6 };
    const gridColor = "rgba(255, 255, 255, 0.05)";
    const tickColor = "rgba(255, 255, 255, 0.3)";
    const lineColor = "#dc143c";

    const getPoint = (value, index, width, height) => {
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const x =
        padding.left + (chartWidth * index) / Math.max(momentum.series.length - 1, 1);
      const y =
        padding.top +
        ((maxValue - value) / Math.max(maxValue - minValue, 1)) * chartHeight;

      return { x, y };
    };

    const drawLine = (points) => {
      if (!points.length) return;

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const controlX = (current.x + next.x) / 2;

        context.bezierCurveTo(controlX, current.y, controlX, next.y, next.x, next.y);
      }
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

      context.font = "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      context.textBaseline = "top";

      const points = momentum.series.map((value, index) =>
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
        const point = points[tickIndex];
        if (!point) return;

        context.beginPath();
        context.strokeStyle = gridColor;
        context.lineWidth = 1;
        context.moveTo(point.x, padding.top);
        context.lineTo(point.x, height - padding.bottom);
        context.stroke();

        context.fillStyle = tickColor;
        context.textAlign = tickIndex === 0 ? "left" : "center";
        context.fillText(
          momentum.period_labels[tickIndex],
          point.x,
          height - padding.bottom + 8,
        );
      });

      drawLine(points);
      const fillGradient = context.createLinearGradient(0, padding.top, 0, height);
      fillGradient.addColorStop(0, "rgba(220, 20, 60, 0.15)");
      fillGradient.addColorStop(1, "rgba(220, 20, 60, 0)");

      context.lineTo(points.at(-1).x, height - padding.bottom);
      context.lineTo(points[0].x, height - padding.bottom);
      context.closePath();
      context.fillStyle = fillGradient;
      context.fill();

      drawLine(points);
      context.strokeStyle = lineColor;
      context.lineWidth = 2;
      context.stroke();
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

  const badgeValue = `${momentum.delta_percent > 0 ? "+" : ""}${momentum.delta_percent}%`;

  return (
    <div className={[styles.panel, className].filter(Boolean).join(" ")}>
      <p className={styles.eyebrow}>Strategic Intelligence</p>
      <div className={styles.titleRow}>
        <p className={styles.title}>Market Momentum</p>
        <span className={styles.badge}>{badgeValue}</span>
      </div>
      <p className={styles.label}>{momentum.label}</p>
      <div
        className={`${styles.chartWrap} ${locked ? styles.chartWrapLocked : ""}`}
        ref={chartWrapRef}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Five-year market momentum trend line"
        />
        {locked && (
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>Unlock the real market read</p>
            <p className={styles.lockedText}>
              Submit a website to replace this preview with an AI-estimated
              five-year category demand trend.
            </p>
          </div>
        )}
      </div>
      <p className={styles.insight}>
        {momentum.insight}
      </p>
      <p className={styles.methodNote}>{momentum.method_note}</p>
    </div>
  );
}
