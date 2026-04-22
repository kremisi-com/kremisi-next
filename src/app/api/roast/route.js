import { verifyTurnstileToken } from "@/lib/turnstile";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_MODEL_PREFERENCE_PREFIXES = [
  "claude-sonnet-",
  "claude-opus-",
  "claude-haiku-",
];
const MAIL_ENDPOINT =
  process.env.KREMISI_MAIL_ENDPOINT?.trim() ||
  "https://api.kremisi.com/send-mail.php";
const ROASTER_MAIL_KIND = "website-roaster";
const CATEGORY_NAMES = [
  "Visual Design",
  "Trust & Credibility",
  "Clarity of Offer",
  "Conversion Potential",
  "Performance & UX",
];
const MARKET_MOMENTUM_LABELS = ["2022", "2023", "2024", "2025", "2026"];
const MARKET_MOMENTUM_BADGES = [
  "Strong Growth",
  "Moderate Growth",
  "Stable",
  "Mixed Signals",
  "Under Pressure",
  "Declining",
];
const COMPETITIVE_POSITION_AXES = [
  "Trust",
  "UX",
  "SEO",
  "Offer",
  "Branding",
  "Conversion",
];
const REVENUE_FUNNEL_STEP_IDS = [
  "landing-visits",
  "hero-retention",
  "scroll-depth",
  "cta-reach",
  "cta-click",
  "lead-submit",
];
const REVENUE_UI_STEP_IDS = [
  "visits",
  "understood-offer",
  "trusted-brand",
  "clicked-cta",
  "submitted-lead",
];
const COMPETITIVE_POSITION_INSIGHT =
  "Strong technical base. Weak differentiation.";
const DEBUG_REVENUE_ENABLED =
  process.env.DEBUG_REVENUE?.trim().toLowerCase() === "true";
const REVIEW_MAX_TOKENS = 3200;
const REVIEW_RETRY_MAX_TOKENS = 3800;
const DEBUG_REVENUE_MAX_TOKENS = 1200;
const DEBUG_REVENUE_RETRY_MAX_TOKENS = 1600;
const PRIORITY_LEVELS = ["High", "Medium", "Low"];
const DEPTH_ONE_MAX_LINKS = 8;
const CRAWL_FETCH_CONCURRENCY = 3;
const HOMEPAGE_HTML_TIMEOUT_MS = 8000;
const JINA_FETCH_TIMEOUT_MS = 12000;
const HOMEPAGE_HTML_MAX_CHARS = 250000;
const PAGE_STAGE_ONE_MAX_CHARS = 900;
const GLOBAL_SITE_CONTENT_MAX_CHARS = 4200;
const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "_hsenc",
  "_hsmi",
  "ref",
  "source",
]);
const SKIPPED_PATH_PREFIXES = [
  "/wp-json",
  "/feed",
  "/xmlrpc",
  "/sitemap",
  "/cdn-cgi",
  "/.well-known",
  "/api",
  "/cart",
  "/checkout",
  "/account",
  "/login",
  "/register",
  "/wp-admin",
];
const BOILERPLATE_LINE_PATTERNS = [
  /\bcookie(s)?\b/i,
  /\bprivacy\b/i,
  /\bterms\b/i,
  /\ball rights reserved\b/i,
  /\bnewsletter\b/i,
  /\bsubscribe\b/i,
  /\baccept\b.{0,30}\bcookie/i,
];
const HIGH_SIGNAL_LINE_PATTERNS = [
  /^#{1,6}\s+/,
  /\b(offer|solution|service|product|pricing|price|plan|cta|call to action)\b/i,
  /\b(book|start|get|request|contact|call|demo|quote)\b/i,
  /\b(trust|testimonial|review|case study|portfolio|client|guarantee)\b/i,
  /\b(conversion|funnel|lead|checkout|form)\b/i,
];
const SUPPORTED_LANGUAGES = {
  it: {
    label: "Italian",
    instruction:
      "Write prose fields in Italian. Keep the tone elegant, sharp, professional, and natural for an Italian-speaking audience.",
  },
  en: {
    label: "English",
    instruction:
      "Write prose fields in English. Keep the tone elegant, sharp, professional, and natural for an English-speaking audience.",
  },
};

function extractErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;

  if (typeof payload === "string") return payload;
  if (typeof payload.error === "string") return payload.error;
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (payload.raw) return payload.raw;

  return fallbackMessage;
}

function mapProviderErrorMessage(status, payload) {
  const providerMessage = extractErrorMessage(
    payload,
    `Anthropic error ${status}`,
  );

  if (status === 400) {
    return `Invalid request to Anthropic: ${providerMessage}. Check the model ID configured in ANTHROPIC_MODEL.`;
  }

  if (status === 401 || status === 403) {
    return `Anthropic authentication failed: ${providerMessage}. Check ANTHROPIC_API_KEY.`;
  }

  return `AI provider error: ${providerMessage}`;
}

function extractProviderErrorType(payload) {
  return typeof payload?.error?.type === "string" ? payload.error.type : "";
}

function isMissingModelError(status, payload) {
  const providerMessage = extractErrorMessage(payload, "");
  const providerType = extractProviderErrorType(payload);

  return (
    status === 404 &&
    providerType === "not_found_error" &&
    providerMessage.toLowerCase().startsWith("model:")
  );
}

async function parseJsonSafely(response) {
  const raw = await response.text();

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

function normalizeInputUrl(input) {
  const trimmed = input?.trim();

  if (!trimmed) {
    throw new Error("Missing URL");
  }

  return new URL(
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
  );
}

function normalizeLanguage(input) {
  const normalized = typeof input === "string" ? input.trim().toLowerCase() : "";
  return SUPPORTED_LANGUAGES[normalized] ? normalized : "it";
}

function toCanonicalUrl(inputUrl) {
  const url = new URL(inputUrl.toString());
  url.hash = "";

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_QUERY_PARAMS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  url.searchParams.sort();

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url;
}

function isStaticAssetPath(pathname = "") {
  return /\.(?:avif|bmp|css|docx?|gif|ico|jpe?g|js|json|mp3|mp4|pdf|png|svg|txt|webm|webp|woff2?|xml|zip)$/i.test(
    pathname,
  );
}

function shouldSkipPathname(pathname = "") {
  const lowerPathname = pathname.toLowerCase();
  return SKIPPED_PATH_PREFIXES.some((prefix) => lowerPathname.startsWith(prefix));
}

function getDepthOnePriorityScore(url) {
  const target = `${url.pathname} ${url.search}`.toLowerCase();
  let score = 0;

  if (/\bpricing|price|plan\b/.test(target)) score += 120;
  if (/\bservice|solution|product\b/.test(target)) score += 110;
  if (/\babout|company|team\b/.test(target)) score += 95;
  if (/\bcontact|book|quote|demo\b/.test(target)) score += 90;
  if (/\bcase|portfolio|work|project|client\b/.test(target)) score += 85;
  if (/\btestimon|review|result|success\b/.test(target)) score += 70;

  const depth = url.pathname.split("/").filter(Boolean).length;
  score -= depth * 3;

  return score;
}

function extractHrefCandidates(html = "") {
  const hrefs = [];
  const hrefRegex = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi;
  let match;

  while ((match = hrefRegex.exec(html))) {
    const href = (match[1] || match[2] || match[3] || "").trim();
    if (href) hrefs.push(href);
  }

  return hrefs;
}

async function fetchHomepageHtml(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(HOMEPAGE_HTML_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Homepage HTML fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  return html.slice(0, HOMEPAGE_HTML_MAX_CHARS);
}

function discoverDepthOneLinks({ homepageUrl, homepageHtml }) {
  const homepageCanonical = toCanonicalUrl(homepageUrl).href;
  const hrefCandidates = extractHrefCandidates(homepageHtml);
  const seen = new Set();
  const candidates = [];

  hrefCandidates.forEach((href, index) => {
    if (!href || href.startsWith("#")) return;
    if (/^(mailto|tel|javascript):/i.test(href)) return;

    let resolved;
    try {
      resolved = new URL(href, homepageUrl);
    } catch {
      return;
    }

    if (!["http:", "https:"].includes(resolved.protocol)) return;
    if (resolved.hostname !== homepageUrl.hostname) return;
    if (isStaticAssetPath(resolved.pathname)) return;
    if (shouldSkipPathname(resolved.pathname)) return;

    const canonical = toCanonicalUrl(resolved);
    const canonicalHref = canonical.href;

    if (canonicalHref === homepageCanonical || seen.has(canonicalHref)) return;
    seen.add(canonicalHref);

    candidates.push({
      url: canonicalHref,
      score: getDepthOnePriorityScore(canonical),
      order: index,
    });
  });

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.order - b.order;
  });

  const selected = candidates.slice(0, DEPTH_ONE_MAX_LINKS).map((item) => item.url);
  return {
    selected,
    discoveredCount: candidates.length,
    droppedCount: Math.max(candidates.length - selected.length, 0),
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const safeLimit = Math.max(1, Math.min(limit, items.length || 1));
  const output = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const current = cursor;
      cursor += 1;
      if (current >= items.length) return;
      output[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: safeLimit }, () => worker()));
  return output;
}

async function fetchJinaPageText(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;

  try {
    const response = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
        "X-Remove-Selector": "header,footer,nav,script,style",
      },
      signal: AbortSignal.timeout(JINA_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        url,
        ok: false,
        status: response.status,
        error: `status ${response.status}`,
        text: "",
      };
    }

    const text = await response.text();
    return { url, ok: true, status: response.status, text };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "fetch error",
      text: "",
    };
  }
}

function toLineKey(line = "") {
  return line.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function compressPageTextStageOne(text = "", maxChars = PAGE_STAGE_ONE_MAX_CHARS) {
  if (!text) return "";

  const normalized = text.replace(/\r/g, "").replace(/\t/g, " ");
  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => line.length >= 8 && line.length <= 260)
    .filter((line) => !BOILERPLATE_LINE_PATTERNS.some((pattern) => pattern.test(line)));

  const seen = new Set();
  const highSignal = [];
  const fallback = [];

  for (const line of lines) {
    const key = toLineKey(line);
    if (!key || key.length < 10 || seen.has(key)) continue;
    seen.add(key);

    if (HIGH_SIGNAL_LINE_PATTERNS.some((pattern) => pattern.test(line))) {
      highSignal.push(line);
    } else {
      fallback.push(line);
    }
  }

  const selected = [];
  let total = 0;
  const ordered = [...highSignal, ...fallback];

  for (const line of ordered) {
    const additional = selected.length === 0 ? line.length : line.length + 1;
    if (total + additional > maxChars) break;
    selected.push(line);
    total += additional;
  }

  if (selected.length > 0) return selected.join("\n");

  return normalized.replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function buildCompressedSiteContent(pageResults) {
  const successfulPages = pageResults.filter((item) => item.ok && item.text.trim());

  if (successfulPages.length === 0) {
    return {
      siteContent: "",
      rawChars: 0,
      stageOneChars: 0,
      successfulPages: 0,
      failedPages: pageResults.length,
      failedDetails: pageResults
        .filter((item) => !item.ok)
        .map((item) => `${item.url} (${item.error || "unknown"})`),
    };
  }

  const stageOne = successfulPages.map((item) => ({
    url: item.url,
    rawChars: item.text.length,
    snippet: compressPageTextStageOne(item.text),
  }));

  const globalSeen = new Set();
  const blocks = [];
  let totalChars = 0;

  for (const [index, page] of stageOne.entries()) {
    const snippetLines = page.snippet
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => {
        const key = toLineKey(line);
        if (!key || globalSeen.has(key)) return false;
        globalSeen.add(key);
        return true;
      });

    if (snippetLines.length === 0) continue;

    const block = [`[PAGE ${index + 1}] ${page.url}`, ...snippetLines].join("\n");
    const additional = blocks.length === 0 ? block.length : block.length + 2;

    if (totalChars + additional > GLOBAL_SITE_CONTENT_MAX_CHARS) break;
    blocks.push(block);
    totalChars += additional;
  }

  return {
    siteContent: blocks.join("\n\n"),
    rawChars: stageOne.reduce((sum, item) => sum + item.rawChars, 0),
    stageOneChars: stageOne.reduce((sum, item) => sum + item.snippet.length, 0),
    successfulPages: successfulPages.length,
    failedPages: pageResults.length - successfulPages.length,
    failedDetails: pageResults
      .filter((item) => !item.ok)
      .map((item) => `${item.url} (${item.error || "unknown"})`),
  };
}

async function requestReview({ apiKey, model, prompt, maxTokens = 2200 }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
    }),
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
}

async function requestAvailableModels({ apiKey }) {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
}

function pickFallbackAnthropicModel(payload) {
  const models = Array.isArray(payload?.data) ? payload.data : [];
  const modelIds = models
    .map((model) => (typeof model?.id === "string" ? model.id.trim() : ""))
    .filter(Boolean);

  for (const prefix of ANTHROPIC_MODEL_PREFERENCE_PREFIXES) {
    const match = modelIds.find((id) => id.startsWith(prefix));

    if (match) return match;
  }

  return modelIds[0] || "";
}

function normalizeModelText(text) {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  return trimmed;
}

function extractModelTextBlocks(payload) {
  if (!Array.isArray(payload?.content)) return "";

  return payload.content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function isTruncatedResponse(payload) {
  return payload?.stop_reason === "max_tokens";
}

function isScore(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateCategories(categories) {
  if (!Array.isArray(categories) || categories.length !== CATEGORY_NAMES.length) {
    return false;
  }

  return categories.every((category, index) => {
    return (
      category &&
      category.name === CATEGORY_NAMES[index] &&
      isScore(category.score) &&
      isNonEmptyString(category.comment)
    );
  });
}

function validateStringList(values) {
  return (
    Array.isArray(values) &&
    values.length === 3 &&
    values.every((value) => isNonEmptyString(value))
  );
}

function validatePriorityActions(priorityActions) {
  if (!Array.isArray(priorityActions) || priorityActions.length !== 3) {
    return false;
  }

  return priorityActions.every((item, index) => {
    return (
      item &&
      item.priority === PRIORITY_LEVELS[index] &&
      isNonEmptyString(item.action)
    );
  });
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoundedInteger(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function validateMarketMomentum(marketMomentum) {
  if (
    !marketMomentum ||
    typeof marketMomentum !== "object" ||
    Array.isArray(marketMomentum)
  ) {
    return false;
  }

  const {
    badge,
    period_labels,
    industry_trend,
    brand_momentum,
    insight,
    method_note,
  } = marketMomentum;

  if (
    !MARKET_MOMENTUM_BADGES.includes(badge) ||
    !isNonEmptyString(insight) ||
    !isNonEmptyString(method_note)
  ) {
    return false;
  }

  if (
    !Array.isArray(period_labels) ||
    period_labels.length !== MARKET_MOMENTUM_LABELS.length ||
    period_labels.some((item, index) => item !== MARKET_MOMENTUM_LABELS[index])
  ) {
    return false;
  }

  if (
    !Array.isArray(industry_trend) ||
    industry_trend.length !== MARKET_MOMENTUM_LABELS.length ||
    industry_trend.some(
      (value) => !isFiniteNumber(value) || value < 25 || value > 100,
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(brand_momentum) ||
    brand_momentum.length !== MARKET_MOMENTUM_LABELS.length ||
    brand_momentum.some(
      (value) => !isFiniteNumber(value) || value < 25 || value > 100,
    )
  ) {
    return false;
  }

  return true;
}

function validateRevenueFunnelStep(step, index, previousStep = null) {
  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return false;
  }

  if (
    step.id !== REVENUE_FUNNEL_STEP_IDS[index] ||
    !isBoundedInteger(step.range_min, 0, 100) ||
    !isBoundedInteger(step.range_max, 0, 100) ||
    step.range_min > step.range_max
  ) {
    return false;
  }

  if (index === 0) {
    return step.range_min === 100 && step.range_max === 100;
  }

  if (!previousStep) {
    return false;
  }

  return (
    step.range_min <= previousStep.range_min &&
    step.range_max <= previousStep.range_max
  );
}

function validateRevenueStepInsight(stepInsight) {
  if (
    !stepInsight ||
    typeof stepInsight !== "object" ||
    Array.isArray(stepInsight)
  ) {
    return false;
  }

  return (
    isNonEmptyString(stepInsight.explanation) &&
    Array.isArray(stepInsight.quick_fixes) &&
    stepInsight.quick_fixes.length === 2 &&
    stepInsight.quick_fixes.every(isNonEmptyString)
  );
}

function validateRevenueStepInsights(stepInsights) {
  if (!stepInsights || typeof stepInsights !== "object" || Array.isArray(stepInsights)) {
    return false;
  }

  const stepIds = Object.keys(stepInsights);

  return (
    stepIds.length === REVENUE_UI_STEP_IDS.length &&
    REVENUE_UI_STEP_IDS.every((stepId) => validateRevenueStepInsight(stepInsights[stepId]))
  );
}

function validateRevenueOpportunity(revenueOpportunity) {
  if (
    !revenueOpportunity ||
    typeof revenueOpportunity !== "object" ||
    Array.isArray(revenueOpportunity)
  ) {
    return false;
  }

  return (
    isBoundedInteger(revenueOpportunity.opportunity_score, 0, 100) &&
    Array.isArray(revenueOpportunity.funnel_steps) &&
    revenueOpportunity.funnel_steps.length === REVENUE_FUNNEL_STEP_IDS.length &&
    revenueOpportunity.funnel_steps.every((step, index, steps) =>
      validateRevenueFunnelStep(step, index, index > 0 ? steps[index - 1] : null),
    ) &&
    Array.isArray(revenueOpportunity.strengths) &&
    revenueOpportunity.strengths.length === 2 &&
    revenueOpportunity.strengths.every(isNonEmptyString) &&
    Array.isArray(revenueOpportunity.weaknesses) &&
    revenueOpportunity.weaknesses.length === 2 &&
    revenueOpportunity.weaknesses.every(isNonEmptyString) &&
    isNonEmptyString(revenueOpportunity.biggest_leak) &&
    isNonEmptyString(revenueOpportunity.quickest_win) &&
    validateRevenueStepInsights(revenueOpportunity.step_insights)
  );
}

function validateCompetitiveSeries(series) {
  return (
    Array.isArray(series) &&
    series.length === COMPETITIVE_POSITION_AXES.length &&
    series.every((value) => isFiniteNumber(value) && value >= 0 && value <= 100)
  );
}

function validateCompetitivePosition(competitivePosition) {
  if (
    !competitivePosition ||
    typeof competitivePosition !== "object" ||
    Array.isArray(competitivePosition)
  ) {
    return false;
  }

  const {
    axes,
    your_site,
    top_competitor,
    category_average,
    insight,
    method_note,
  } = competitivePosition;

  return (
    Array.isArray(axes) &&
    axes.length === COMPETITIVE_POSITION_AXES.length &&
    axes.every((axis, index) => axis === COMPETITIVE_POSITION_AXES[index]) &&
    validateCompetitiveSeries(your_site) &&
    validateCompetitiveSeries(top_competitor) &&
    validateCompetitiveSeries(category_average) &&
    insight === COMPETITIVE_POSITION_INSIGHT &&
    isNonEmptyString(method_note)
  );
}

function validateReviewShape(review) {
  if (!review || typeof review !== "object" || Array.isArray(review)) {
    return false;
  }

  return (
    isNonEmptyString(review.summary) &&
    isScore(review.overall_score) &&
    validateCategories(review.categories) &&
    validateStringList(review.top_strengths) &&
    validateStringList(review.top_issues) &&
    validatePriorityActions(review.priority_actions) &&
    isNonEmptyString(review.verdict) &&
    validateMarketMomentum(review.market_momentum) &&
    validateCompetitivePosition(review.competitive_position) &&
    validateRevenueOpportunity(review.revenue_opportunity)
  );
}

function parseReviewPayload(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload.review && typeof payload.review === "object"
      ? payload.review
      : payload;
  }

  throw new Error("AI response is not a JSON object.");
}

function parseAndValidateReview(text) {
  const normalizedText = normalizeModelText(text);

  if (!normalizedText) {
    throw new Error("AI response is empty.");
  }

  let parsed;

  try {
    parsed = JSON.parse(normalizedText);
  } catch {
    throw new Error("AI response is not valid JSON.");
  }

  const review = parseReviewPayload(parsed);

  if (!validateReviewShape(review)) {
    throw new Error("AI response JSON does not match the required review schema.");
  }

  return review;
}

function parseAndValidateRevenueOpportunity(text) {
  const normalizedText = normalizeModelText(text);

  if (!normalizedText) {
    throw new Error("AI response is empty.");
  }

  let parsed;

  try {
    parsed = JSON.parse(normalizedText);
  } catch {
    throw new Error("AI response is not valid JSON.");
  }

  const payload =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed.review && typeof parsed.review === "object"
        ? parsed.review
        : parsed
      : null;

  const revenueOpportunity = payload?.revenue_opportunity || payload;

  if (!validateRevenueOpportunity(revenueOpportunity)) {
    throw new Error(
      "AI response JSON does not match the required revenue opportunity schema.",
    );
  }

  return {
    revenue_opportunity: revenueOpportunity,
  };
}

function buildReviewPreview(review) {
  if (!review) return "";

  if (review.revenue_opportunity && !review.summary) {
    const funnelSummary = review.revenue_opportunity.funnel_steps
      ?.map(
        (step) =>
          `${step.id}:${step.range_min}-${step.range_max}%`,
      )
      .join(", ");

    return [
      `Opportunity score: ${review.revenue_opportunity.opportunity_score}/100`,
      `Funnel: ${funnelSummary || "n/a"}`,
    ]
      .join("\n")
      .slice(0, 280);
  }

  const preview = [
    `Summary: ${review.summary}`,
    `Overall score: ${review.overall_score}/5`,
    `Verdict: ${review.verdict}`,
  ].join("\n");

  return preview.slice(0, 280);
}

async function sendRoasterNotification({
  rawUrl = "",
  normalizedUrl = "",
  hostname = "",
  status,
  error = "",
  review = null,
}) {
  const payload = new URLSearchParams({
    kind: ROASTER_MAIL_KIND,
    url: rawUrl,
    normalizedUrl,
    hostname,
    status,
    error,
    roastPreview: buildReviewPreview(review),
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetch(MAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!response.ok) {
      const mailPayload = await parseJsonSafely(response);
      console.error(
        "Website roaster mail error:",
        response.status,
        JSON.stringify(mailPayload, null, 2),
      );
    }
  } catch (mailError) {
    console.error("Website roaster mail request failed:", mailError);
  }
}

async function sendErrorResponse({
  rawUrl = "",
  parsedUrl = null,
  error,
  status = 500,
}) {
  const message = error || "Server error";

  await sendRoasterNotification({
    rawUrl,
    normalizedUrl: parsedUrl?.href || "",
    hostname: parsedUrl?.hostname || "",
    status: "error",
    error: message,
  });

  return Response.json({ error: message }, { status });
}

function buildPrompt({ hostname, siteContent, languageConfig }) {
  return `You are a senior web strategist and conversion consultant.

Analyze the following website content from "${hostname}" and produce a premium, structured review designed for direct UI rendering.

Return JSON only.
Do not use markdown.
Do not include any text before or after the JSON.
Use this exact structure and key names:
{
  "summary": "Short executive summary in 1-2 sentences.",
  "overall_score": 1-5,
  "categories": [
    {
      "name": "Visual Design",
      "score": 1-5,
      "comment": "Short professional explanation."
    },
    {
      "name": "Trust & Credibility",
      "score": 1-5,
      "comment": "Short professional explanation."
    },
    {
      "name": "Clarity of Offer",
      "score": 1-5,
      "comment": "Short professional explanation."
    },
    {
      "name": "Conversion Potential",
      "score": 1-5,
      "comment": "Short professional explanation."
    },
    {
      "name": "Performance & UX",
      "score": 1-5,
      "comment": "Short professional explanation."
    }
  ],
  "top_strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "top_issues": [
    "Issue 1",
    "Issue 2",
    "Issue 3"
  ],
  "priority_actions": [
    {
      "priority": "High",
      "action": "What should be fixed first"
    },
    {
      "priority": "Medium",
      "action": "What should be fixed second"
    },
    {
      "priority": "Low",
      "action": "What should be fixed third"
    }
  ],
  "verdict": "Sharp final verdict in one sentence.",
  "market_momentum": {
    "period_labels": ["${MARKET_MOMENTUM_LABELS[0]}", "${MARKET_MOMENTUM_LABELS[1]}", "${MARKET_MOMENTUM_LABELS[2]}", "${MARKET_MOMENTUM_LABELS[3]}", "${MARKET_MOMENTUM_LABELS[4]}"],
    "industry_trend": [42, 47, 51, 58, 63],
    "brand_momentum": [48, 46, 43, 40, 38],
    "badge": "Mixed Signals",
    "insight": "Short explanation of the relationship between the market and the analyzed brand, including why and any visible upside.",
    "method_note": "Short disclosure that both lines are AI-estimated."
  },
  "competitive_position": {
    "axes": ["${COMPETITIVE_POSITION_AXES[0]}", "${COMPETITIVE_POSITION_AXES[1]}", "${COMPETITIVE_POSITION_AXES[2]}", "${COMPETITIVE_POSITION_AXES[3]}", "${COMPETITIVE_POSITION_AXES[4]}", "${COMPETITIVE_POSITION_AXES[5]}"],
    "your_site": [76, 71, 84, 55, 42, 61],
    "top_competitor": [83, 80, 76, 79, 74, 77],
    "category_average": [62, 59, 64, 58, 56, 54],
    "insight": "${COMPETITIVE_POSITION_INSIGHT}",
    "method_note": "Short disclosure that the chart is AI-estimated."
  },
  "revenue_opportunity": {
    "opportunity_score": 89,
    "funnel_steps": [
      { "id": "landing-visits", "range_min": 100, "range_max": 100 },
      { "id": "hero-retention", "range_min": 72, "range_max": 84 },
      { "id": "scroll-depth", "range_min": 54, "range_max": 70 },
      { "id": "cta-reach", "range_min": 35, "range_max": 50 },
      { "id": "cta-click", "range_min": 12, "range_max": 20 },
      { "id": "lead-submit", "range_min": 3, "range_max": 7 }
    ],
    "strengths": [
      "Strong above-the-fold visual hierarchy",
      "Trust indicators appear early in the page flow"
    ],
    "weaknesses": [
      "CTA visibility drops after the hero section",
      "Form friction likely too high for cold traffic"
    ],
    "biggest_leak": "Users lose momentum between first scroll and CTA reach.",
    "quickest_win": "Surface a stronger primary CTA earlier with clearer contrast.",
    "step_insights": {
      "visits": {
        "explanation": "The hero reaches broad traffic, but first-screen clarity is diluted by generic framing and a crowded opening hierarchy.",
        "quick_fixes": [
          "Lead with one concrete hero outcome in the first headline line.",
          "Remove one above-the-fold visual block to reduce split attention."
        ]
      },
      "understood-offer": {
        "explanation": "Users continue browsing but offer comprehension drops when scope, deliverables, and audience fit appear late in the page flow.",
        "quick_fixes": [
          "Add a one-line what-you-get strip under the hero.",
          "Surface package summary before longer narrative sections."
        ]
      },
      "trusted-brand": {
        "explanation": "Trust weakens when proof signals are soft, with limited named references, sparse outcomes, and testimonials lacking measurable context.",
        "quick_fixes": [
          "Move the strongest proof block above the first CTA.",
          "Rewrite one testimonial with a measurable business result."
        ]
      },
      "clicked-cta": {
        "explanation": "Intent falls when CTA visibility is inconsistent, repetition is delayed, and action labels do not set clear post-click expectations.",
        "quick_fixes": [
          "Increase primary CTA contrast and keep one action color.",
          "Use outcome-led CTA copy instead of generic wording."
        ]
      },
      "submitted-lead": {
        "explanation": "Lead completion declines when form load feels heavy, response timing is unclear, and privacy reassurance is weak near submit.",
        "quick_fixes": [
          "Reduce form fields to first-contact essentials only.",
          "Add response-time and privacy reassurance under submit."
        ]
      }
    }
  }
}

Hard requirements:
- Keep all JSON keys exactly as written above.
- Keep category "name" values exactly as written above and in the same order.
- All scores must be integers from 1 to 5.
- overall_score must reflect the overall business effectiveness of the site.
- Write concise, premium consultancy-style comments.
- Keep summary to 2 sentences max.
- Keep each category comment to 1 sentence, max 28 words.
- Keep each strength, issue, and action to a short single sentence or phrase.
- Keep verdict to 1 sentence, max 20 words.
- The market_momentum object is required.
- market_momentum.period_labels must use exactly these 5 labels and in this order: ${MARKET_MOMENTUM_LABELS.join(", ")}.
- market_momentum.industry_trend must contain exactly 5 numbers in the 25-100 range.
- market_momentum.brand_momentum must contain exactly 5 numbers in the 25-100 range.
- market_momentum.badge must be exactly one of: ${MARKET_MOMENTUM_BADGES.join(", ")}.
- Never merge category trend with brand execution.
- This section is an external strategic read, not business analytics.

- Define market_momentum.industry_trend as Trend di Settore:
  estimate how attractive/active/growing the visible category appears from public signals and broad category perception.

- Define market_momentum.brand_momentum as Slancio del Brand:
  estimate how strong the brand’s external momentum appears from visible website execution and positioning.
  This is NOT revenue, user growth, retention, or internal company performance.

- Use only visible/public signals such as:
  clarity of value proposition, UI/UX modernity, brand consistency, differentiation, messaging confidence,
  trust cues, visible maturity of offer, perceived innovation, category competitiveness, premium perception,
  and content quality.

- Never infer or claim: revenue, MRR, churn, retention, funding health, internal growth, user numbers,
  or certain customer satisfaction outcomes.

- Curve rules for 2024-2028:
  keep both series realistic and strategically plausible.
  Prefer gradual rise, plateau, mild decline, delayed acceleration, converging lines, or modest divergence.
  Avoid dramatic jumps/collapses unless clearly justified by strong visible evidence.
  Both lines may rise together or fall together.

- If evidence is mixed or weak, keep both curves moderate and avoid confident extremes.
- If the brand shows visible strengths, acknowledge them; avoid uniformly negative framing.
- Neutral, evidence-led output is better than invented confidence.

- market_momentum.insight must explain the relationship between sector trajectory and brand momentum
  using only visible signals from the site.
- market_momentum.insight must be max 70 words, premium consultant tone, balanced and intelligent.
- Use probabilistic language where appropriate (e.g., "suggests", "appears", "may indicate", "seems", "likely").
- No roasting, arrogance, or fake certainty.

- market_momentum.method_note must clearly state both lines are AI-estimated from visible website signals
  and broad market perception, not internal company data.
- The competitive_position object is required.
- competitive_position.axes must use exactly these 6 labels and in this order: ${COMPETITIVE_POSITION_AXES.join(", ")}.
- competitive_position.your_site, competitive_position.top_competitor, and competitive_position.category_average must each contain exactly 6 numbers in the 0-100 range.
- competitive_position must estimate visible execution quality and positioning strength from the website content, not hidden analytics.
- competitive_position.insight must be exactly: "${COMPETITIVE_POSITION_INSIGHT}".
- competitive_position.method_note must clearly frame the chart as an AI-estimated comparative read.
- The three competitive_position series should be internally consistent and strategically plausible for the site's visible maturity, clarity, and differentiation.
- The revenue_opportunity object is required.
- revenue_opportunity.opportunity_score must be an integer from 0 to 100.
- revenue_opportunity.funnel_steps must contain exactly 6 items.
- Use exactly these step ids and this exact order: ${REVENUE_FUNNEL_STEP_IDS.join(", ")}.
- Each funnel step must include: id, range_min, range_max.
- range_min and range_max must be integers from 0 to 100.
- range_min must be less than or equal to range_max for each step.
- The first step (landing-visits) must be exactly 100-100.
- For every following step, both range_min and range_max must be less than or equal to the previous step values (non-increasing funnel).
- Use realistic strategic ranges, not fake exact precision and not overly narrow ranges unless clearly justified.
- revenue_opportunity.strengths must contain exactly 2 concise items.
- revenue_opportunity.weaknesses must contain exactly 2 concise items.
- revenue_opportunity.biggest_leak must be one concise sentence.
- revenue_opportunity.quickest_win must be one concise sentence.
- strengths, weaknesses, biggest_leak, and quickest_win must reference visible site cues when possible.
- Keep revenue_opportunity prose length close to the provided examples.
- revenue_opportunity.step_insights must be an object with exactly these keys and order: ${REVENUE_UI_STEP_IDS.join(", ")}.
- Each revenue_opportunity.step_insights entry must include: explanation, quick_fixes.
- explanation must be a single short paragraph, about 18-40 words.
- quick_fixes must contain exactly 2 concise items, about 8-18 words each.
- step_insights text must reference concrete page elements (hero, CTA placement, proof blocks, form friction, structure) when visible.
- Avoid generic formulas; tie each step insight to observed site cues.
- The revenue_opportunity output must be internally consistent with the rest of the review.
- Use "${hostname}" as a stable anchor and prefer internally consistent outputs over novelty.
- Focus on strategic business value, not only technical quality.
- Evaluate whether the site feels premium, whether the offer is clear, whether trust is established quickly, whether users would convert, and whether the UX feels smooth.
- Tone: elegant, sharp, professional, honest, premium consultancy style.
- No jokes. No cringe. No exaggerated negativity.
- Do not mention missing access to code, analytics, or backend systems.
- Avoid generic praise or generic criticism; make every point specific to the provided content.
- ${languageConfig.instruction}
- Keep all prose content concise and directly useful.

WEBSITE CONTENT:
${siteContent || "No content available: the website may be empty or inaccessible."}`;
}

function buildRevenuePrompt({ hostname, siteContent, languageConfig }) {
  return `You are a senior web strategist and conversion consultant.

Analyze the following website content from "${hostname}" and produce only the Revenue Opportunity card payload for direct UI rendering.

Return JSON only.
Do not use markdown.
Do not include any text before or after the JSON.
Use this exact structure and key names:
{
  "revenue_opportunity": {
    "opportunity_score": 89,
    "funnel_steps": [
      { "id": "landing-visits", "range_min": 100, "range_max": 100 },
      { "id": "hero-retention", "range_min": 72, "range_max": 84 },
      { "id": "scroll-depth", "range_min": 54, "range_max": 70 },
      { "id": "cta-reach", "range_min": 35, "range_max": 50 },
      { "id": "cta-click", "range_min": 12, "range_max": 20 },
      { "id": "lead-submit", "range_min": 3, "range_max": 7 }
    ],
    "strengths": [
      "Strong above-the-fold visual hierarchy",
      "Trust indicators appear early in the page flow"
    ],
    "weaknesses": [
      "CTA visibility drops after the hero section",
      "Form friction likely too high for cold traffic"
    ],
    "biggest_leak": "Users lose momentum between first scroll and CTA reach.",
    "quickest_win": "Surface a stronger primary CTA earlier with clearer contrast.",
    "step_insights": {
      "visits": {
        "explanation": "The opening section attracts traffic, but initial clarity weakens when the hero promise is too generic.",
        "quick_fixes": [
          "Rewrite the first headline line with one concrete outcome.",
          "Simplify above-the-fold visuals to focus attention on value."
        ]
      },
      "understood-offer": {
        "explanation": "Offer understanding drops when users must scroll too far to see scope, deliverables, and audience fit.",
        "quick_fixes": [
          "Place a concise offer summary directly below the hero.",
          "Show service packages before long brand storytelling."
        ]
      },
      "trusted-brand": {
        "explanation": "Trust conversion slows when proof is not immediate through strong logos, outcomes, or specific case evidence.",
        "quick_fixes": [
          "Move the strongest proof asset above the first CTA.",
          "Add one testimonial with a specific measurable result."
        ]
      },
      "clicked-cta": {
        "explanation": "CTA click intent declines when the primary action lacks contrast and appears too late in the flow.",
        "quick_fixes": [
          "Increase CTA contrast with one consistent action color.",
          "Use direct outcome-oriented CTA copy."
        ]
      },
      "submitted-lead": {
        "explanation": "Lead submission drops when the form feels long and response expectations are not visible near submit.",
        "quick_fixes": [
          "Remove non-essential fields from first-contact form.",
          "Add response-time and privacy reassurance under submit."
        ]
      }
    }
  }
}

Hard requirements:
- Return only the revenue_opportunity object shown above.
- revenue_opportunity.opportunity_score must be an integer from 0 to 100.
- revenue_opportunity.funnel_steps must contain exactly 6 items.
- Use exactly these step ids and this exact order: ${REVENUE_FUNNEL_STEP_IDS.join(", ")}.
- Each funnel step must include: id, range_min, range_max.
- range_min and range_max must be integers from 0 to 100.
- range_min must be less than or equal to range_max for each step.
- The first step (landing-visits) must be exactly 100-100.
- For every following step, both range_min and range_max must be less than or equal to the previous step values (non-increasing funnel).
- Use realistic strategic ranges, not fake exact precision and not overly narrow ranges unless clearly justified.
- revenue_opportunity.strengths must contain exactly 2 concise items.
- revenue_opportunity.weaknesses must contain exactly 2 concise items.
- revenue_opportunity.biggest_leak must be one concise sentence.
- revenue_opportunity.quickest_win must be one concise sentence.
- strengths, weaknesses, biggest_leak, and quickest_win must reference visible site cues when possible.
- Keep revenue_opportunity prose length close to the provided examples.
- revenue_opportunity.step_insights must be an object with exactly these keys and order: ${REVENUE_UI_STEP_IDS.join(", ")}.
- Each revenue_opportunity.step_insights entry must include: explanation, quick_fixes.
- explanation must be a single short paragraph, about 18-40 words.
- quick_fixes must contain exactly 2 concise items, about 8-18 words each.
- step_insights text must reference concrete page elements (hero, CTA placement, proof blocks, form friction, structure) when visible.
- Avoid generic formulas; tie each step insight to observed site cues.
- Keep the output strategically honest and internally plausible.
- ${languageConfig.instruction}

WEBSITE CONTENT:
${siteContent || "No content available: the website may be empty or inaccessible."}`;
}

function buildSchemaRepairPrompt({ basePrompt, previousOutput, validationError }) {
  return `${basePrompt}

SCHEMA CORRECTION:
Your previous output failed schema validation.
Validation error: ${validationError || "Unknown schema error"}.

Return the full JSON again, valid and complete.
Do not omit any required key.
Do not add commentary.

PREVIOUS INVALID OUTPUT:
${previousOutput || "<empty>"}`;
}

export async function POST(request) {
  try {
    const { url, language, turnstileToken } = await request.json();
    const rawUrl = typeof url === "string" ? url.trim() : "";
    const outputLanguage = normalizeLanguage(language);
    const languageConfig = SUPPORTED_LANGUAGES[outputLanguage];
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const clientIp = forwardedFor.split(",")[0]?.trim() || "";

    const turnstileResult = await verifyTurnstileToken({
      token: turnstileToken,
      ip: clientIp,
    });

    if (!turnstileResult.success) {
      return sendErrorResponse({
        rawUrl,
        error: "Security check failed. Refresh the page and try again.",
        status: 400,
      });
    }

    let parsedUrl;
    try {
      parsedUrl = normalizeInputUrl(url);
    } catch (error) {
      return sendErrorResponse({
        rawUrl,
        error: error.message || "Invalid URL",
        status: 400,
      });
    }

    const homepageCanonical = toCanonicalUrl(parsedUrl).href;
    let depthOneLinks = [];
    let discoveredDepthOneCount = 0;
    let droppedDepthOneCount = 0;

    try {
      const homepageHtml = await fetchHomepageHtml(homepageCanonical);
      const discovery = discoverDepthOneLinks({
        homepageUrl: toCanonicalUrl(parsedUrl),
        homepageHtml,
      });
      depthOneLinks = discovery.selected;
      discoveredDepthOneCount = discovery.discoveredCount;
      droppedDepthOneCount = discovery.droppedCount;
    } catch (discoveryError) {
      console.warn(
        "Website roaster depth-1 discovery fallback to homepage only:",
        discoveryError instanceof Error ? discoveryError.message : discoveryError,
      );
    }

    const targetUrls = [homepageCanonical, ...depthOneLinks];
    const pageResults = await mapWithConcurrency(
      targetUrls,
      CRAWL_FETCH_CONCURRENCY,
      (targetUrl) => fetchJinaPageText(targetUrl),
    );
    const compression = buildCompressedSiteContent(pageResults);

    let siteContent = compression.siteContent;
    if (!siteContent) {
      siteContent = "Unable to read the website content.";
    }

    console.log(
      "Website roaster crawl summary:",
      JSON.stringify({
        homepage: homepageCanonical,
        candidate_depth1: discoveredDepthOneCount,
        selected_depth1: depthOneLinks.length,
        dropped_depth1: droppedDepthOneCount,
        total_targets: targetUrls.length,
        successful_pages: compression.successfulPages,
        failed_pages: compression.failedPages,
        raw_chars: compression.rawChars,
        stage1_chars: compression.stageOneChars,
        final_chars: siteContent.length,
      }),
    );

    if (compression.failedDetails.length > 0) {
      console.warn(
        "Website roaster page fetch failures:",
        compression.failedDetails.join(" | "),
      );
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: "Anthropic API key is not configured",
      });
    }

    const configuredModel =
      process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;

    const prompt = DEBUG_REVENUE_ENABLED
      ? buildRevenuePrompt({
          hostname: parsedUrl.hostname,
          siteContent,
          languageConfig,
        })
      : buildPrompt({
          hostname: parsedUrl.hostname,
          siteContent,
          languageConfig,
        });

    const primaryMaxTokens = DEBUG_REVENUE_ENABLED
      ? DEBUG_REVENUE_MAX_TOKENS
      : REVIEW_MAX_TOKENS;
    const retryMaxTokens = DEBUG_REVENUE_ENABLED
      ? DEBUG_REVENUE_RETRY_MAX_TOKENS
      : REVIEW_RETRY_MAX_TOKENS;

    let modelInUse = configuredModel;
    let { response, payload } = await requestReview({
      apiKey: ANTHROPIC_API_KEY,
      model: modelInUse,
      prompt,
      maxTokens: primaryMaxTokens,
    });

    if (isMissingModelError(response.status, payload)) {
      console.warn(
        `Anthropic model unavailable: ${modelInUse}. Looking up available models.`,
      );

      const {
        response: modelsResponse,
        payload: modelsPayload,
      } = await requestAvailableModels({
        apiKey: ANTHROPIC_API_KEY,
      });

      if (modelsResponse.ok) {
        const fallbackModel = pickFallbackAnthropicModel(modelsPayload);

        if (fallbackModel && fallbackModel !== modelInUse) {
          console.warn(
            `Retrying Anthropic request with fallback model: ${fallbackModel}`,
          );

          modelInUse = fallbackModel;
          ({ response, payload } = await requestReview({
            apiKey: ANTHROPIC_API_KEY,
            model: modelInUse,
            prompt,
            maxTokens: primaryMaxTokens,
          }));
        }
      } else {
        console.error(
          "Unable to list Anthropic models:",
          JSON.stringify(modelsPayload, null, 2),
        );
      }
    }

    if (!response.ok) {
      let message = mapProviderErrorMessage(response.status, payload);

      if (modelInUse !== configuredModel) {
        message = `${message} Requested model: ${configuredModel}. Retried with: ${modelInUse}.`;
      }

      console.error("Anthropic status:", response.status);
      console.error("Anthropic error:", JSON.stringify(payload, null, 2));

      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: message,
      });
    }

    console.log("Anthropic model used:", modelInUse);

    let reviewText = extractModelTextBlocks(payload);

    if (isTruncatedResponse(payload)) {
      console.warn("AI review was truncated on first attempt. Retrying once.");

      const truncationRepairPrompt = buildSchemaRepairPrompt({
        basePrompt: prompt,
        previousOutput: reviewText,
        validationError:
          "Response was truncated because max output tokens were reached.",
      });

      const {
        response: truncationRetryResponse,
        payload: truncationRetryPayload,
      } = await requestReview({
        apiKey: ANTHROPIC_API_KEY,
        model: modelInUse,
        prompt: truncationRepairPrompt,
        maxTokens: retryMaxTokens,
      });

      if (!truncationRetryResponse.ok) {
        const retryMessage = mapProviderErrorMessage(
          truncationRetryResponse.status,
          truncationRetryPayload,
        );

        return sendErrorResponse({
          rawUrl,
          parsedUrl,
          error: retryMessage,
          status: 502,
        });
      }

      if (isTruncatedResponse(truncationRetryPayload)) {
        console.error(
          "AI review was truncated again after retry:",
          JSON.stringify(truncationRetryPayload, null, 2),
        );

        return sendErrorResponse({
          rawUrl,
          parsedUrl,
          error:
            "The AI response was truncated before the JSON completed. Please try again.",
          status: 502,
        });
      }

      reviewText = extractModelTextBlocks(truncationRetryPayload);
      payload = truncationRetryPayload;
    }

    const parseResponse = (text) =>
      DEBUG_REVENUE_ENABLED
        ? parseAndValidateRevenueOpportunity(text)
        : parseAndValidateReview(text);

    let review;

    try {
      review = parseResponse(reviewText);
    } catch (firstParseError) {
      console.error("Invalid AI review payload (attempt 1):", firstParseError);

      const repairPrompt = buildSchemaRepairPrompt({
        basePrompt: prompt,
        previousOutput: reviewText,
        validationError: firstParseError?.message || "Invalid AI response",
      });

      const { response: retryResponse, payload: retryPayload } = await requestReview({
        apiKey: ANTHROPIC_API_KEY,
        model: modelInUse,
        prompt: repairPrompt,
        maxTokens: retryMaxTokens,
      });

      if (!retryResponse.ok) {
        const retryMessage = mapProviderErrorMessage(retryResponse.status, retryPayload);

        return sendErrorResponse({
          rawUrl,
          parsedUrl,
          error: retryMessage,
          status: 502,
        });
      }

      if (isTruncatedResponse(retryPayload)) {
        return sendErrorResponse({
          rawUrl,
          parsedUrl,
          error:
            "The AI response was truncated before the JSON completed. Please try again.",
          status: 502,
        });
      }

      const retryText = extractModelTextBlocks(retryPayload);

      try {
        review = parseResponse(retryText);
      } catch (secondParseError) {
        console.error("Invalid AI review payload (attempt 2):", secondParseError);
        console.error("Raw AI payload (attempt 1):", JSON.stringify(payload, null, 2));
        console.error("Raw AI payload (attempt 2):", JSON.stringify(retryPayload, null, 2));

        return sendErrorResponse({
          rawUrl,
          parsedUrl,
          error: secondParseError.message || "Invalid AI response",
          status: 502,
        });
      }
    }

    await sendRoasterNotification({
      rawUrl,
      normalizedUrl: parsedUrl.href,
      hostname: parsedUrl.hostname,
      status: "success",
      review,
    });

    return Response.json({
      review,
      debug_mode: DEBUG_REVENUE_ENABLED ? "revenue" : null,
    });
  } catch (err) {
    console.error("Roast API error:", err);
    return sendErrorResponse({
      error: "Server error",
    });
  }
}
