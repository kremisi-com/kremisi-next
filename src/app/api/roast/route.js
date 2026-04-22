import { verifyTurnstileToken } from "@/lib/turnstile";
import crypto from "node:crypto";
import { translate as translateText } from "@vitalets/google-translate-api";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_PRIMARY_MODEL = "claude-3-5-haiku-latest";
const DEFAULT_OPENROUTER_MODEL = "openrouter/auto";
const DEFAULT_AI_API_MODE = "anthropic";
const AI_API_MODES = new Set([
  "anthropic",
  "openrouter",
  "both",
  "openrouter-before",
  "anthropic-before",
]);
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
function buildMarketMomentumLabels(currentYear = new Date().getUTCFullYear()) {
  return Array.from({ length: 5 }, (_, index) => String(currentYear - 2 + index));
}

const MARKET_MOMENTUM_LABELS = buildMarketMomentumLabels();
const MARKET_MOMENTUM_BADGES = [
  "Strong Growth",
  "Moderate Growth",
  "Stable",
  "Diverging Trends",
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
const OPENROUTER_FALLBACK_NOTICE =
  "Il modello gratuito su OpenRouter ci sta mettendo piu del previsto. Ho completato l'analisi con Anthropic.";
const COMPETITIVE_POSITION_INSIGHT =
  "Strong technical base. Weak differentiation.";
const DEFAULT_ROASTER_COST_TARGET_PERCENT = 40;
const DEFAULT_ROASTER_CACHE_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_ROASTER_CACHE_MAX_ENTRIES = 500;
const DEFAULT_ROASTER_PROMPT_VERSION = "1";
const FUNNEL_ARTIFACT_TTL_MS = 24 * 60 * 60 * 1000;
const FUNNEL_ARTIFACT_VERSION = 1;
const PRIORITY_LEVELS = ["High", "Medium", "Low"];
const CRAWL_FETCH_CONCURRENCY = 3;
const HOMEPAGE_HTML_TIMEOUT_MS = 8000;
const JINA_FETCH_TIMEOUT_MS = 12000;
const HOMEPAGE_HTML_MAX_CHARS = 250000;
const REVENUE_STEP_INSIGHT_EXPLANATION_CHAR_MAX = 190;
const REVENUE_STEP_INSIGHT_QUICK_FIX_CHAR_MAX = 90;
const COMPETITIVE_AXIS_EXPLANATION_CHAR_MAX = 230;
const COST_PROFILE_DEFAULTS = {
  conservative: {
    depthOneMaxLinks: 6,
    pageStageOneMaxChars: 700,
    globalSiteContentMaxChars: 3200,
    baseReviewMaxTokens: 2200,
    baseReviewRetryMaxTokens: 2800,
    revenuePromptMaxTokens: 1000,
    revenuePromptRetryMaxTokens: 1400,
  },
  balanced: {
    depthOneMaxLinks: 3,
    pageStageOneMaxChars: 500,
    globalSiteContentMaxChars: 2200,
    baseReviewMaxTokens: 1200,
    baseReviewRetryMaxTokens: 1600,
    revenuePromptMaxTokens: 700,
    revenuePromptRetryMaxTokens: 1000,
  },
  aggressive: {
    depthOneMaxLinks: 2,
    pageStageOneMaxChars: 360,
    globalSiteContentMaxChars: 1500,
    baseReviewMaxTokens: 850,
    baseReviewRetryMaxTokens: 1200,
    revenuePromptMaxTokens: 500,
    revenuePromptRetryMaxTokens: 700,
  },
};
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
const TRUST_SIGNAL_LINE_PATTERNS = [
  /\b(testimonial|testimonials|review|reviews|case study|case studies|social proof|proof|success story|success stories)\b/i,
  /\b(client|clients|customer|customers|trusted by|what clients say)\b/i,
  /\b(testimonianze?|recensioni?|casi studio|clienti)\b/i,
];
const TRUST_SECTION_HEADER_PATTERNS = [
  /\bwhat clients say\b/i,
  /\btestimonial|testimonials\b/i,
  /\breview|reviews\b/i,
  /\bcase study|case studies\b/i,
  /\btestimonianze?|recensioni?|casi studio|clienti\b/i,
  /\btrusted by\b/i,
];
const TRUST_SIGNAL_MIN_CHARS = 220;
const TRUST_SIGNAL_CHAR_SHARE = 0.28;
const TRUST_CONTEXT_LOOKAHEAD_LINES = 6;
const TRUST_FALLBACK_MAX_CHARS = 460;
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
const COMPETITIVE_AXIS_EXPLANATION_FALLBACKS = {
  Trust:
    "The hero does not show a concrete client result, named proof, or certification above the first CTA, so credibility relies on style instead of evidence.",
  UX:
    "Primary actions are not repeated with consistent styling after the first section, forcing users to search for the next step during scroll.",
  SEO:
    "Section headings and service copy include clear topic terms, giving search engines enough context to map the page to commercial intent queries.",
  Offer:
    "The homepage introduces services but does not define scope, deliverables, or who each package is for in one compact above-the-fold block.",
  Branding:
    "Visual style is coherent, but the brand promise and voice are not repeated consistently across headline, section copy, and CTA microcopy as one clear identity.",
  Conversion:
    "CTA hierarchy weakens mid-page and the path to contact lacks urgency cues, reducing momentum between interest and form submission.",
};

function toIntegerEnv(value, fallback, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function toBooleanEnv(value, fallback) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function resolveAiApiMode() {
  const normalized = process.env.AI_API?.trim().toLowerCase();
  if (normalized && AI_API_MODES.has(normalized)) {
    return normalized;
  }

  if (toBooleanEnv(process.env.USE_OPENROUTER, false)) {
    return "openrouter";
  }

  return DEFAULT_AI_API_MODE;
}

function resolveCostProfile(targetPercent) {
  if (targetPercent <= 25) return "conservative";
  if (targetPercent <= 45) return "balanced";
  return "aggressive";
}

function resolveRoasterRuntimeConfig() {
  const costTargetPercent = toIntegerEnv(
    process.env.ROASTER_COST_TARGET_PERCENT,
    DEFAULT_ROASTER_COST_TARGET_PERCENT,
    { min: 0, max: 70 },
  );
  const profileName = resolveCostProfile(costTargetPercent);
  const profileDefaults = COST_PROFILE_DEFAULTS[profileName];

  return {
    costTargetPercent,
    profileName,
    depthOneMaxLinks: toIntegerEnv(
      process.env.ROASTER_DEPTH_ONE_MAX_LINKS,
      profileDefaults.depthOneMaxLinks,
      { min: 1, max: 12 },
    ),
    pageStageOneMaxChars: toIntegerEnv(
      process.env.ROASTER_PAGE_STAGE_ONE_MAX_CHARS,
      profileDefaults.pageStageOneMaxChars,
      { min: 120, max: 1800 },
    ),
    globalSiteContentMaxChars: toIntegerEnv(
      process.env.ROASTER_GLOBAL_SITE_CONTENT_MAX_CHARS,
      profileDefaults.globalSiteContentMaxChars,
      { min: 600, max: 12000 },
    ),
    baseReviewMaxTokens: toIntegerEnv(
      process.env.ROASTER_BASE_MAX_TOKENS,
      profileDefaults.baseReviewMaxTokens,
      { min: 300, max: 4096 },
    ),
    baseReviewRetryMaxTokens: toIntegerEnv(
      process.env.ROASTER_BASE_RETRY_MAX_TOKENS,
      profileDefaults.baseReviewRetryMaxTokens,
      { min: 400, max: 4096 },
    ),
    revenuePromptMaxTokens: toIntegerEnv(
      process.env.ROASTER_REVENUE_MAX_TOKENS,
      profileDefaults.revenuePromptMaxTokens,
      { min: 250, max: 4096 },
    ),
    revenuePromptRetryMaxTokens: toIntegerEnv(
      process.env.ROASTER_REVENUE_RETRY_MAX_TOKENS,
      profileDefaults.revenuePromptRetryMaxTokens,
      { min: 300, max: 4096 },
    ),
    cacheTtlSeconds: toIntegerEnv(
      process.env.ROASTER_CACHE_TTL_SECONDS,
      DEFAULT_ROASTER_CACHE_TTL_SECONDS,
      { min: 0, max: 7 * 24 * 60 * 60 },
    ),
    cacheMaxEntries: toIntegerEnv(
      process.env.ROASTER_CACHE_MAX_ENTRIES,
      DEFAULT_ROASTER_CACHE_MAX_ENTRIES,
      { min: 0, max: 5000 },
    ),
    enableModelFallback: toBooleanEnv(
      process.env.ROASTER_ENABLE_MODEL_FALLBACK,
      true,
    ),
    primaryModel:
      process.env.ROASTER_PRIMARY_MODEL?.trim() ||
      process.env.ANTHROPIC_MODEL?.trim() ||
      DEFAULT_PRIMARY_MODEL,
    fallbackModel:
      process.env.ROASTER_FALLBACK_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
    aiApiMode: resolveAiApiMode(),
    openRouterModel:
      process.env.ROASTER_OPENROUTER_MODEL?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      DEFAULT_OPENROUTER_MODEL,
    openRouterFallbackModel:
      process.env.ROASTER_OPENROUTER_FALLBACK_MODEL?.trim() || "",
    enableOpenRouterModelFallback: toBooleanEnv(
      process.env.ROASTER_ENABLE_OPENROUTER_MODEL_FALLBACK,
      false,
    ),
    promptVersion:
      process.env.ROASTER_PROMPT_VERSION?.trim() || DEFAULT_ROASTER_PROMPT_VERSION,
  };
}

const ROASTER_RUNTIME = resolveRoasterRuntimeConfig();
const DEPTH_ONE_MAX_LINKS = ROASTER_RUNTIME.depthOneMaxLinks;
const PAGE_STAGE_ONE_MAX_CHARS = ROASTER_RUNTIME.pageStageOneMaxChars;
const GLOBAL_SITE_CONTENT_MAX_CHARS = ROASTER_RUNTIME.globalSiteContentMaxChars;
const BASE_REVIEW_MAX_TOKENS = ROASTER_RUNTIME.baseReviewMaxTokens;
const BASE_REVIEW_RETRY_MAX_TOKENS = ROASTER_RUNTIME.baseReviewRetryMaxTokens;
const REVENUE_PROMPT_MAX_TOKENS = ROASTER_RUNTIME.revenuePromptMaxTokens;
const REVENUE_PROMPT_RETRY_MAX_TOKENS =
  ROASTER_RUNTIME.revenuePromptRetryMaxTokens;

const roasterReviewCache = new Map();

function extractErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;

  if (typeof payload === "string") return payload;
  if (typeof payload.error === "string") return payload.error;
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (payload.raw) return payload.raw;

  return fallbackMessage;
}

function mapProviderErrorMessage(status, payload, { provider = "anthropic" } = {}) {
  const providerLabel = provider === "openrouter" ? "OpenRouter" : "Anthropic";
  const providerMessage = extractErrorMessage(
    payload,
    `${providerLabel} error ${status}`,
  );

  if (status === 400) {
    if (provider === "openrouter") {
      return `Invalid request to OpenRouter: ${providerMessage}. Check ROASTER_OPENROUTER_MODEL.`;
    }

    return `Invalid request to Anthropic: ${providerMessage}. Check the model ID configured in ANTHROPIC_MODEL.`;
  }

  if (status === 401 || status === 403) {
    if (provider === "openrouter") {
      return `OpenRouter authentication failed: ${providerMessage}. Check OPENROUTER_API_KEY.`;
    }

    return `Anthropic authentication failed: ${providerMessage}. Check ANTHROPIC_API_KEY.`;
  }

  return `AI provider (${providerLabel}) error: ${providerMessage}`;
}

function extractProviderErrorType(payload) {
  return typeof payload?.error?.type === "string" ? payload.error.type : "";
}

function isMissingModelError(status, payload, provider) {
  if (provider !== "anthropic") return false;

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

function resolveReviewMode(mode) {
  const normalized = typeof mode === "string" ? mode.trim().toLowerCase() : "base";
  return normalized === "funnel" ? "funnel" : "base";
}

function buildLanguageGuardrails(languageConfig) {
  const targetLanguage =
    languageConfig?.label === "Italian" ? "Italian" : "English";

  return [
    `Language lock (mandatory): write every prose value in ${targetLanguage}.`,
    "Do not mix Italian and English in the same response.",
    "If any generated sentence is in the wrong language, rewrite it before returning JSON.",
    "Keep schema keys, ids, and fixed enum labels exactly as specified even if they are in English.",
    "Proper nouns, brand names, URLs, and quoted on-page text may stay in original form.",
  ];
}

function createHttpError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function buildRoasterCacheKey({ canonicalUrl, language, mode }) {
  return `${mode}|${language}|${canonicalUrl}|${ROASTER_RUNTIME.promptVersion}`;
}

function getCachedRoasterPayload({ canonicalUrl, language, mode }) {
  if (ROASTER_RUNTIME.cacheTtlSeconds <= 0 || ROASTER_RUNTIME.cacheMaxEntries <= 0) {
    return null;
  }

  const key = buildRoasterCacheKey({ canonicalUrl, language, mode });
  const entry = roasterReviewCache.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAtMs) {
    roasterReviewCache.delete(key);
    return null;
  }

  // Refresh insertion order for simple LRU-like eviction.
  roasterReviewCache.delete(key);
  roasterReviewCache.set(key, entry);
  return entry.payload;
}

function setCachedRoasterPayload({ canonicalUrl, language, mode, payload }) {
  if (ROASTER_RUNTIME.cacheTtlSeconds <= 0 || ROASTER_RUNTIME.cacheMaxEntries <= 0) {
    return;
  }

  const key = buildRoasterCacheKey({ canonicalUrl, language, mode });
  const expiresAtMs = Date.now() + ROASTER_RUNTIME.cacheTtlSeconds * 1000;
  roasterReviewCache.set(key, { expiresAtMs, payload });

  while (roasterReviewCache.size > ROASTER_RUNTIME.cacheMaxEntries) {
    const firstKey = roasterReviewCache.keys().next().value;
    if (!firstKey) break;
    roasterReviewCache.delete(firstKey);
  }
}

function getFunnelArtifactSecret(apiKey = "") {
  return process.env.ROASTER_ARTIFACT_SECRET?.trim() || apiKey.trim();
}

function signFunnelArtifactBody(encodedBody, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(encodedBody)
    .digest("base64url");
}

function createFunnelArtifact({
  siteContent,
  url,
  language,
  expiresAtMs,
  secret,
}) {
  const payload = {
    v: FUNNEL_ARTIFACT_VERSION,
    url,
    language,
    site_content: siteContent,
    exp: expiresAtMs,
  };

  const encodedBody = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signFunnelArtifactBody(encodedBody, secret);
  return `${encodedBody}.${signature}`;
}

function parseAndVerifyFunnelArtifact(artifact, secret) {
  if (typeof artifact !== "string" || !artifact.trim()) {
    throw createHttpError("Missing funnel artifact.", 400);
  }

  const [encodedBody, providedSignature, ...rest] = artifact.trim().split(".");

  if (!encodedBody || !providedSignature || rest.length > 0) {
    throw createHttpError("Invalid funnel artifact format.", 400);
  }

  const expectedSignature = signFunnelArtifactBody(encodedBody, secret);
  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw createHttpError("Invalid or tampered funnel artifact.", 401);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedBody, "base64url").toString("utf8"));
  } catch {
    throw createHttpError("Invalid funnel artifact payload.", 400);
  }

  const isValidShape =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.v === FUNNEL_ARTIFACT_VERSION &&
    isNonEmptyString(payload.url) &&
    isNonEmptyString(payload.site_content) &&
    isNonEmptyString(payload.language) &&
    SUPPORTED_LANGUAGES[payload.language] &&
    Number.isInteger(payload.exp);

  if (!isValidShape) {
    throw createHttpError("Malformed funnel artifact payload.", 400);
  }

  if (Date.now() > payload.exp) {
    throw createHttpError("Funnel artifact expired. Run Start Review again.", 401);
  }

  return payload;
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

function isTrustSignalLine(line = "") {
  return TRUST_SIGNAL_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function collectTrustContextLineKeys(lines = []) {
  const trustContextKeys = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) continue;
    if (!TRUST_SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(line))) continue;

    for (
      let cursor = index;
      cursor < Math.min(lines.length, index + TRUST_CONTEXT_LOOKAHEAD_LINES);
      cursor += 1
    ) {
      const key = toLineKey(lines[cursor]);
      if (key) trustContextKeys.add(key);
    }
  }

  return trustContextKeys;
}

function appendLineWithinBudget(selected, line, totalChars, maxChars) {
  const additional = selected.length === 0 ? line.length : line.length + 1;
  if (totalChars + additional > maxChars) {
    return { added: false, totalChars };
  }

  selected.push(line);
  return { added: true, totalChars: totalChars + additional };
}

function extractTrustSnippetFromRawText(text = "", maxChars = TRUST_FALLBACK_MAX_CHARS) {
  if (!text) return "";

  const normalized = text.replace(/\r/g, "").replace(/\t/g, " ");
  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => line.length >= 8 && line.length <= 260)
    .filter((line) => !BOILERPLATE_LINE_PATTERNS.some((pattern) => pattern.test(line)));

  if (lines.length === 0) return "";

  const trustStartIndex = lines.findIndex(
    (line) =>
      isTrustSignalLine(line) ||
      TRUST_SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(line)),
  );

  if (trustStartIndex === -1) return "";

  const snippetLines = [];
  const seen = new Set();
  let totalChars = 0;
  const startIndex = Math.max(0, trustStartIndex - 1);
  const endIndex = Math.min(lines.length, trustStartIndex + TRUST_CONTEXT_LOOKAHEAD_LINES);

  for (let index = startIndex; index < endIndex; index += 1) {
    const line = lines[index];
    const key = toLineKey(line);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const result = appendLineWithinBudget(snippetLines, line, totalChars, maxChars);
    if (!result.added) break;
    totalChars = result.totalChars;
  }

  return snippetLines.join("\n");
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
  const trustSignal = [];
  const highSignal = [];
  const fallback = [];
  const trustContextLineKeys = collectTrustContextLineKeys(lines);

  for (const line of lines) {
    const key = toLineKey(line);
    if (!key || key.length < 10 || seen.has(key)) continue;
    seen.add(key);

    if (trustContextLineKeys.has(key) || isTrustSignalLine(line)) {
      trustSignal.push(line);
    } else if (HIGH_SIGNAL_LINE_PATTERNS.some((pattern) => pattern.test(line))) {
      highSignal.push(line);
    } else {
      fallback.push(line);
    }
  }

  const selected = [];
  let total = 0;
  const selectedKeys = new Set();
  const trustBudget = Math.min(
    maxChars,
    Math.max(TRUST_SIGNAL_MIN_CHARS, Math.round(maxChars * TRUST_SIGNAL_CHAR_SHARE)),
  );

  for (const line of trustSignal) {
    const key = toLineKey(line);
    if (!key || selectedKeys.has(key)) continue;
    const result = appendLineWithinBudget(selected, line, total, trustBudget);
    if (!result.added) break;
    total = result.totalChars;
    selectedKeys.add(key);
  }

  const ordered = [...highSignal, ...fallback, ...trustSignal];
  for (const line of ordered) {
    const key = toLineKey(line);
    if (!key || selectedKeys.has(key)) continue;
    const result = appendLineWithinBudget(selected, line, total, maxChars);
    if (!result.added) break;
    total = result.totalChars;
    selectedKeys.add(key);
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
  let trustLinesIncluded = 0;

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

    trustLinesIncluded += snippetLines.filter((line) => isTrustSignalLine(line)).length;

    if (snippetLines.length === 0) continue;

    const block = [`[PAGE ${index + 1}] ${page.url}`, ...snippetLines].join("\n");
    const additional = blocks.length === 0 ? block.length : block.length + 2;

    if (totalChars + additional > GLOBAL_SITE_CONTENT_MAX_CHARS) break;
    blocks.push(block);
    totalChars += additional;
  }

  const hasTrustSignalsInSiteContent = trustLinesIncluded > 0;
  let trustFallbackInjected = false;
  let siteContent = blocks.join("\n\n");

  if (!hasTrustSignalsInSiteContent) {
    const fallbackSource = successfulPages.find((page) =>
      extractTrustSnippetFromRawText(page.text),
    );

    if (fallbackSource) {
      const trustSnippet = extractTrustSnippetFromRawText(fallbackSource.text);
      if (trustSnippet) {
        const trustBlock = `[TRUST SIGNALS] ${fallbackSource.url}\n${trustSnippet}`;
        const separator = siteContent ? "\n\n" : "";
        const additional = separator.length + trustBlock.length;

        if (siteContent.length + additional <= GLOBAL_SITE_CONTENT_MAX_CHARS) {
          siteContent = `${siteContent}${separator}${trustBlock}`;
        } else {
          const maxBaseChars = Math.max(
            0,
            GLOBAL_SITE_CONTENT_MAX_CHARS - additional,
          );
          siteContent = `${siteContent.slice(0, maxBaseChars).trimEnd()}${separator}${trustBlock}`;
        }

        trustFallbackInjected = true;
      }
    }
  }

  return {
    siteContent,
    rawChars: stageOne.reduce((sum, item) => sum + item.rawChars, 0),
    stageOneChars: stageOne.reduce((sum, item) => sum + item.snippet.length, 0),
    successfulPages: successfulPages.length,
    failedPages: pageResults.length - successfulPages.length,
    trustSignalsPresent: hasTrustSignalsInSiteContent || trustFallbackInjected,
    trustFallbackInjected,
    failedDetails: pageResults
      .filter((item) => !item.ok)
      .map((item) => `${item.url} (${item.error || "unknown"})`),
  };
}

async function requestReviewAnthropic({ apiKey, model, prompt, maxTokens = 2200 }) {
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

async function requestReviewOpenRouter({ apiKey, model, prompt, maxTokens = 2200 }) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const referer = process.env.OPENROUTER_HTTP_REFERER?.trim();
  const appName = process.env.OPENROUTER_APP_NAME?.trim();

  if (referer) headers["HTTP-Referer"] = referer;
  if (appName) headers["X-Title"] = appName;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
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

async function requestReview({ provider, apiKey, model, prompt, maxTokens = 2200 }) {
  if (provider === "openrouter") {
    return requestReviewOpenRouter({ apiKey, model, prompt, maxTokens });
  }

  return requestReviewAnthropic({ apiKey, model, prompt, maxTokens });
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

function extractOpenRouterText(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) =>
        item?.type === "text" && typeof item.text === "string" ? item.text : "",
      )
      .join("\n")
      .trim();
  }

  return "";
}

function extractProviderText(payload, provider) {
  return provider === "openrouter"
    ? extractOpenRouterText(payload)
    : extractModelTextBlocks(payload);
}

function isTruncatedResponse(payload, provider) {
  if (provider === "openrouter") {
    return payload?.choices?.[0]?.finish_reason === "length";
  }

  return payload?.stop_reason === "max_tokens";
}

function isScore(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function shouldTranslateOpenRouterOutput({ aiApiMode, language }) {
  return aiApiMode === "openrouter" && language === "it";
}

async function translateToItalianSafe(value, cache) {
  if (!isNonEmptyString(value)) return value;
  const source = value.trim();
  const cached = cache.get(source);
  if (typeof cached === "string") return cached;

  try {
    const { text } = await translateText(source, { to: "it" });
    const translated = isNonEmptyString(text) ? text.trim() : source;
    cache.set(source, translated);
    return translated;
  } catch (error) {
    console.warn(
      "OpenRouter translation fallback: keeping original text.",
      error instanceof Error ? error.message : error,
    );
    cache.set(source, source);
    return source;
  }
}

async function maybeTranslateBaseReviewToItalian(review, options = {}) {
  if (!shouldTranslateOpenRouterOutput(options)) {
    return review;
  }

  const cache = new Map();
  const categories = await Promise.all(
    review.categories.map(async (category) => ({
      ...category,
      comment: await translateToItalianSafe(category.comment, cache),
    })),
  );
  const topStrengths = await Promise.all(
    review.top_strengths.map((item) => translateToItalianSafe(item, cache)),
  );
  const topIssues = await Promise.all(
    review.top_issues.map((item) => translateToItalianSafe(item, cache)),
  );
  const priorityActions = await Promise.all(
    review.priority_actions.map(async (item) => ({
      ...item,
      action: await translateToItalianSafe(item.action, cache),
    })),
  );
  const axisExplanations = Object.fromEntries(
    await Promise.all(
      COMPETITIVE_POSITION_AXES.map(async (axis) => [
        axis,
        await translateToItalianSafe(
          review.competitive_position.axis_explanations[axis],
          cache,
        ),
      ]),
    ),
  );

  return {
    ...review,
    summary: await translateToItalianSafe(review.summary, cache),
    categories,
    top_strengths: topStrengths,
    top_issues: topIssues,
    priority_actions: priorityActions,
    verdict: await translateToItalianSafe(review.verdict, cache),
    market_momentum: {
      ...review.market_momentum,
      insight: await translateToItalianSafe(review.market_momentum.insight, cache),
      method_note: await translateToItalianSafe(
        review.market_momentum.method_note,
        cache,
      ),
    },
    competitive_position: {
      ...review.competitive_position,
      axis_explanations: axisExplanations,
      insight: await translateToItalianSafe(review.competitive_position.insight, cache),
      method_note: await translateToItalianSafe(
        review.competitive_position.method_note,
        cache,
      ),
    },
  };
}

async function maybeTranslateRevenueOpportunityToItalian(
  revenueOpportunity,
  options = {},
) {
  if (!shouldTranslateOpenRouterOutput(options)) {
    return revenueOpportunity;
  }

  const cache = new Map();
  const strengths = await Promise.all(
    revenueOpportunity.strengths.map((item) => translateToItalianSafe(item, cache)),
  );
  const weaknesses = await Promise.all(
    revenueOpportunity.weaknesses.map((item) => translateToItalianSafe(item, cache)),
  );
  const stepInsights = Object.fromEntries(
    await Promise.all(
      REVENUE_UI_STEP_IDS.map(async (stepId) => {
        const stepInsight = revenueOpportunity.step_insights[stepId];
        const quickFixes = await Promise.all(
          stepInsight.quick_fixes.map((item) => translateToItalianSafe(item, cache)),
        );

        return [
          stepId,
          {
            explanation: await translateToItalianSafe(
              stepInsight.explanation,
              cache,
            ),
            quick_fixes: quickFixes,
          },
        ];
      }),
    ),
  );

  return {
    ...revenueOpportunity,
    strengths,
    weaknesses,
    biggest_leak: await translateToItalianSafe(
      revenueOpportunity.biggest_leak,
      cache,
    ),
    quickest_win: await translateToItalianSafe(
      revenueOpportunity.quickest_win,
      cache,
    ),
    step_insights: stepInsights,
  };
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

function toIntegerInRange(value, min, max, fallback) {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const rounded = Math.round(numeric);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function toNonEmptyString(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function truncateText(value, maxChars) {
  if (!isNonEmptyString(value)) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= maxChars
    ? normalized
    : normalized.slice(0, Math.max(1, maxChars - 1)).trimEnd();
}

function toStringList(values, expectedLength, fallback) {
  const source = Array.isArray(values) ? values : [];
  const normalized = [];

  for (let index = 0; index < expectedLength; index += 1) {
    normalized.push(toNonEmptyString(source[index], fallback[index]));
  }

  return normalized;
}

function normalizeCategories(categories) {
  const source = Array.isArray(categories) ? categories : [];
  const byName = new Map();

  source.forEach((item) => {
    if (item && typeof item === "object" && typeof item.name === "string") {
      byName.set(item.name, item);
    }
  });

  return CATEGORY_NAMES.map((name, index) => {
    const namedItem = byName.get(name);
    const fallbackItem = source[index];
    const item =
      namedItem && typeof namedItem === "object"
        ? namedItem
        : fallbackItem && typeof fallbackItem === "object"
          ? fallbackItem
          : {};

    return {
      name,
      score: toIntegerInRange(item.score, 1, 5, 3),
      comment: toNonEmptyString(
        item.comment,
        "Execution quality in this area is currently uneven and can be strengthened.",
      ),
    };
  });
}

function normalizePriorityActions(priorityActions) {
  const source = Array.isArray(priorityActions) ? priorityActions : [];
  const byPriority = new Map();

  source.forEach((item) => {
    if (item && typeof item === "object" && typeof item.priority === "string") {
      byPriority.set(item.priority, item);
    }
  });

  return PRIORITY_LEVELS.map((priority, index) => {
    const fallbackItem = source[index];
    const item =
      byPriority.get(priority) && typeof byPriority.get(priority) === "object"
        ? byPriority.get(priority)
        : fallbackItem && typeof fallbackItem === "object"
          ? fallbackItem
          : {};

    return {
      priority,
      action: toNonEmptyString(
        item.action,
        `Priority ${index + 1}: tighten clarity, trust signals, and conversion flow in visible page sections.`,
      ),
    };
  });
}

function normalizeNumericSeries(values, fallback, min, max) {
  const source = Array.isArray(values) ? values : [];

  return fallback.map((fallbackValue, index) =>
    toIntegerInRange(source[index], min, max, fallbackValue),
  );
}

function normalizeMarketMomentum(marketMomentum) {
  const source =
    marketMomentum &&
    typeof marketMomentum === "object" &&
    !Array.isArray(marketMomentum)
      ? marketMomentum
      : {};

  return {
    period_labels: [...MARKET_MOMENTUM_LABELS],
    industry_trend: normalizeNumericSeries(
      source.industry_trend,
      [44, 48, 53, 57, 61],
      25,
      100,
    ),
    brand_momentum: normalizeNumericSeries(
      source.brand_momentum,
      [52, 50, 47, 43, 40],
      25,
      100,
    ),
    badge: MARKET_MOMENTUM_BADGES.includes(source.badge)
      ? source.badge
      : "Diverging Trends",
    insight: toNonEmptyString(
      source.insight,
      "Visible positioning quality appears divergent versus category direction, with upside if offer clarity and trust communication are tightened.",
    ),
    method_note: toNonEmptyString(
      source.method_note,
      "Both lines are AI-estimated from visible website signals and broad market perception, not internal company data.",
    ),
  };
}

function normalizeCompetitivePosition(competitivePosition) {
  const source =
    competitivePosition &&
    typeof competitivePosition === "object" &&
    !Array.isArray(competitivePosition)
      ? competitivePosition
      : {};

  return {
    axes: [...COMPETITIVE_POSITION_AXES],
    your_site: normalizeNumericSeries(source.your_site, [76, 71, 84, 55, 42, 61], 0, 100),
    top_competitor: normalizeNumericSeries(
      source.top_competitor,
      [83, 80, 76, 79, 74, 77],
      0,
      100,
    ),
    category_average: normalizeNumericSeries(
      source.category_average,
      [62, 59, 64, 58, 56, 54],
      0,
      100,
    ),
    axis_explanations: Object.fromEntries(
      COMPETITIVE_POSITION_AXES.map((axis) => [
        axis,
        truncateText(
          toNonEmptyString(
            source.axis_explanations?.[axis],
            COMPETITIVE_AXIS_EXPLANATION_FALLBACKS[axis],
          ),
          COMPETITIVE_AXIS_EXPLANATION_CHAR_MAX,
        ),
      ]),
    ),
    insight: COMPETITIVE_POSITION_INSIGHT,
    method_note: toNonEmptyString(
      source.method_note,
      "AI-estimated comparative read based on visible execution quality and positioning signals.",
    ),
  };
}

function normalizeRevenueFunnelFromCurrentSteps(currentSteps) {
  const currentById = new Map(currentSteps.map((step) => [step.id, step]));
  const visits = currentById.get("visits");
  const understoodOffer = currentById.get("understood-offer");
  const trustedBrand = currentById.get("trusted-brand");
  const clickedCta = currentById.get("clicked-cta");
  const submittedLead = currentById.get("submitted-lead");

  const ctaReachMin = Math.max(
    clickedCta.range_min,
    Math.round((trustedBrand.range_min + clickedCta.range_min) / 2),
  );
  const ctaReachMax = Math.max(
    clickedCta.range_max,
    Math.round((trustedBrand.range_max + clickedCta.range_max) / 2),
  );

  return [
    { id: "landing-visits", range_min: visits.range_min, range_max: visits.range_max },
    {
      id: "hero-retention",
      range_min: understoodOffer.range_min,
      range_max: understoodOffer.range_max,
    },
    { id: "scroll-depth", range_min: trustedBrand.range_min, range_max: trustedBrand.range_max },
    { id: "cta-reach", range_min: ctaReachMin, range_max: ctaReachMax },
    { id: "cta-click", range_min: clickedCta.range_min, range_max: clickedCta.range_max },
    {
      id: "lead-submit",
      range_min: submittedLead.range_min,
      range_max: submittedLead.range_max,
    },
  ];
}

function normalizeRevenueFunnelSteps(funnelSteps) {
  const fallback = [
    { id: "landing-visits", range_min: 100, range_max: 100 },
    { id: "hero-retention", range_min: 72, range_max: 84 },
    { id: "scroll-depth", range_min: 54, range_max: 70 },
    { id: "cta-reach", range_min: 35, range_max: 50 },
    { id: "cta-click", range_min: 12, range_max: 20 },
    { id: "lead-submit", range_min: 3, range_max: 7 },
  ];

  const source = Array.isArray(funnelSteps) ? funnelSteps : [];
  const hasLegacyIds =
    source.length === REVENUE_FUNNEL_STEP_IDS.length &&
    source.every((step, index) => step?.id === REVENUE_FUNNEL_STEP_IDS[index]);
  const hasUiIds =
    source.length === REVENUE_UI_STEP_IDS.length &&
    source.every((step, index) => step?.id === REVENUE_UI_STEP_IDS[index]);

  const normalizeStepRanges = (sourceSteps, ids, fallbackSteps) =>
    ids.map((id, index) => {
      const sourceStep = sourceSteps[index];
      const fallbackStep = fallbackSteps[index];
      const rangeMin = toIntegerInRange(
        sourceStep?.range_min,
        0,
        100,
        fallbackStep.range_min,
      );
      const rangeMax = toIntegerInRange(
        sourceStep?.range_max,
        0,
        100,
        fallbackStep.range_max,
      );

      return {
        id,
        range_min: rangeMin,
        range_max: rangeMax,
      };
    });

  const forceMonotonicFunnel = (steps) =>
    steps.map((step, index, allSteps) => {
      if (index === 0) {
        return { ...step, range_min: 100, range_max: 100 };
      }

      const previous = allSteps[index - 1];
      let rangeMin = Math.min(step.range_min, previous.range_min);
      let rangeMax = Math.min(step.range_max, previous.range_max);

      if (rangeMin > rangeMax) {
        rangeMin = rangeMax;
      }

      return { ...step, range_min: rangeMin, range_max: rangeMax };
    });

  if (hasLegacyIds) {
    const normalizedLegacy = normalizeStepRanges(
      source,
      REVENUE_FUNNEL_STEP_IDS,
      fallback,
    );
    return forceMonotonicFunnel(normalizedLegacy);
  }

  if (hasUiIds) {
    const normalizedCurrent = normalizeStepRanges(
      source,
      REVENUE_UI_STEP_IDS,
      fallback,
    );
    const monotonicCurrent = forceMonotonicFunnel(normalizedCurrent);

    return forceMonotonicFunnel(
      normalizeRevenueFunnelFromCurrentSteps(monotonicCurrent),
    );
  }

  return fallback;
}

function normalizeRevenueStepInsight(stepInsight) {
  const source =
    stepInsight &&
    typeof stepInsight === "object" &&
    !Array.isArray(stepInsight)
      ? stepInsight
      : {};

  const quickFixes = toStringList(source.quick_fixes, 2, [
    "Clarify this step with a stronger value cue.",
    "Reduce friction and reinforce next action intent.",
  ]);

  return {
    explanation: truncateText(
      toNonEmptyString(
        source.explanation,
        "This step likely underperforms due to message clarity, trust strength, and interaction friction in the visible flow.",
      ),
      REVENUE_STEP_INSIGHT_EXPLANATION_CHAR_MAX,
    ),
    quick_fixes: quickFixes.map((item) =>
      truncateText(item, REVENUE_STEP_INSIGHT_QUICK_FIX_CHAR_MAX),
    ),
  };
}

function normalizeRevenueStepInsights(stepInsights) {
  const source =
    stepInsights &&
    typeof stepInsights === "object" &&
    !Array.isArray(stepInsights)
      ? stepInsights
      : {};

  return Object.fromEntries(
    REVENUE_UI_STEP_IDS.map((stepId) => [
      stepId,
      normalizeRevenueStepInsight(source[stepId]),
    ]),
  );
}

function normalizeRevenueOpportunity(revenueOpportunity) {
  const source =
    revenueOpportunity &&
    typeof revenueOpportunity === "object" &&
    !Array.isArray(revenueOpportunity)
      ? revenueOpportunity
      : {};

  return {
    opportunity_score: toIntegerInRange(source.opportunity_score, 0, 100, 89),
    funnel_steps: normalizeRevenueFunnelSteps(source.funnel_steps),
    strengths: toStringList(source.strengths, 2, [
      "Primary value proposition appears early in the page flow.",
      "Visual hierarchy helps direct attention to key information.",
    ]),
    weaknesses: toStringList(source.weaknesses, 2, [
      "Primary CTA visibility weakens after the first section.",
      "Mid-page structure may dilute decision momentum.",
    ]),
    biggest_leak: toNonEmptyString(
      source.biggest_leak,
      "Momentum likely declines between first-scroll engagement and CTA visibility.",
    ),
    quickest_win: toNonEmptyString(
      source.quickest_win,
      "Increase CTA prominence earlier and support it with clearer proof.",
    ),
    step_insights: normalizeRevenueStepInsights(source.step_insights),
  };
}

function normalizeReview(review) {
  const source = review && typeof review === "object" && !Array.isArray(review) ? review : {};

  return {
    summary: toNonEmptyString(
      source.summary,
      "The site has visible strengths, but clarity, trust sequencing, and conversion guidance need sharper execution.",
    ),
    overall_score: toIntegerInRange(source.overall_score, 1, 5, 3),
    categories: normalizeCategories(source.categories),
    top_strengths: toStringList(source.top_strengths, 3, [
      "Clear visual direction with a premium baseline.",
      "Offer elements are present and broadly understandable.",
      "Core UX appears stable across major sections.",
    ]),
    top_issues: toStringList(source.top_issues, 3, [
      "Value proposition lacks immediate precision.",
      "Trust signals are not sequenced early enough.",
      "CTA hierarchy and repetition can be improved.",
    ]),
    priority_actions: normalizePriorityActions(source.priority_actions),
    verdict: toNonEmptyString(
      source.verdict,
      "Promising base, but conversion impact depends on tighter messaging and stronger trust-to-action flow.",
    ),
    market_momentum: normalizeMarketMomentum(source.market_momentum),
    competitive_position: normalizeCompetitivePosition(source.competitive_position),
    revenue_opportunity: normalizeRevenueOpportunity(source.revenue_opportunity),
  };
}

function normalizeBaseReview(review) {
  const normalized = normalizeReview(review);
  const { revenue_opportunity, ...baseReview } = normalized;
  void revenue_opportunity;
  return baseReview;
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
    stepInsight.explanation.trim().length <= REVENUE_STEP_INSIGHT_EXPLANATION_CHAR_MAX &&
    Array.isArray(stepInsight.quick_fixes) &&
    stepInsight.quick_fixes.length === 2 &&
    stepInsight.quick_fixes.every((item) =>
      isNonEmptyString(item) && item.trim().length <= REVENUE_STEP_INSIGHT_QUICK_FIX_CHAR_MAX,
    )
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

function validateCompetitiveAxisExplanations(axisExplanations) {
  if (
    !axisExplanations ||
    typeof axisExplanations !== "object" ||
    Array.isArray(axisExplanations)
  ) {
    return false;
  }

  const keys = Object.keys(axisExplanations);

  return (
    keys.length === COMPETITIVE_POSITION_AXES.length &&
    COMPETITIVE_POSITION_AXES.every((axis) => {
      const explanation = axisExplanations[axis];
      return (
        isNonEmptyString(explanation) &&
        explanation.trim().length <= COMPETITIVE_AXIS_EXPLANATION_CHAR_MAX
      );
    })
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
    axis_explanations,
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
    validateCompetitiveAxisExplanations(axis_explanations) &&
    insight === COMPETITIVE_POSITION_INSIGHT &&
    isNonEmptyString(method_note)
  );
}

function validateBaseReviewShape(review) {
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
    validateCompetitivePosition(review.competitive_position)
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

function parseAndValidateBaseReview(text) {
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

  const review = normalizeBaseReview(parseReviewPayload(parsed));

  if (!validateBaseReviewShape(review)) {
    throw new Error(
      "AI response JSON does not match the required base review schema.",
    );
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

  const revenueOpportunity = normalizeRevenueOpportunity(
    payload?.revenue_opportunity || payload,
  );

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

function buildBasePrompt({ hostname, siteContent, languageConfig }) {
  const languageGuardrails = buildLanguageGuardrails(languageConfig);

  return `You are a senior web strategist and conversion consultant.

Analyze the following website content from "${hostname}" and produce a premium strategic review payload for direct UI rendering.

Return JSON only.
Do not use markdown.
Do not include any text before or after the JSON.
Do not include any key outside this schema.
Use this exact structure and key names:
{
  "summary": "Short executive summary in 1-2 sentences.",
  "overall_score": 1-5,
  "categories": [
    { "name": "Visual Design", "score": 1-5, "comment": "Short professional explanation." },
    { "name": "Trust & Credibility", "score": 1-5, "comment": "Short professional explanation." },
    { "name": "Clarity of Offer", "score": 1-5, "comment": "Short professional explanation." },
    { "name": "Conversion Potential", "score": 1-5, "comment": "Short professional explanation." },
    { "name": "Performance & UX", "score": 1-5, "comment": "Short professional explanation." }
  ],
  "top_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "top_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "priority_actions": [
    { "priority": "High", "action": "What should be fixed first" },
    { "priority": "Medium", "action": "What should be fixed second" },
    { "priority": "Low", "action": "What should be fixed third" }
  ],
  "verdict": "Sharp final verdict in one sentence.",
  "market_momentum": {
    "period_labels": [${MARKET_MOMENTUM_LABELS.map((label) => `"${label}"`).join(", ")}],
    "industry_trend": [42, 47, 51, 58, 63],
    "brand_momentum": [48, 46, 43, 40, 38],
    "badge": "Diverging Trends",
    "insight": "Short causal explanation of why the gap exists between market trend and brand momentum, tied to concrete visible page cues.",
    "method_note": "Short disclosure that both lines are AI-estimated."
  },
  "competitive_position": {
    "axes": ["${COMPETITIVE_POSITION_AXES[0]}", "${COMPETITIVE_POSITION_AXES[1]}", "${COMPETITIVE_POSITION_AXES[2]}", "${COMPETITIVE_POSITION_AXES[3]}", "${COMPETITIVE_POSITION_AXES[4]}", "${COMPETITIVE_POSITION_AXES[5]}"],
    "your_site": [76, 71, 84, 55, 42, 61],
    "top_competitor": [83, 80, 76, 79, 74, 77],
    "category_average": [62, 59, 64, 58, 56, 54],
    "axis_explanations": {
      "Trust": "State the concrete reason for this Trust score using visible cues like testimonials, case results, credentials, guarantees, or missing proof near the first CTA.",
      "UX": "State the concrete reason for this UX score using specific cues like menu clarity, CTA consistency, section order, visual hierarchy, and interaction friction.",
      "SEO": "State the concrete reason for this SEO score using visible cues like heading clarity, keyword relevance, page structure, content specificity, and crawlable text.",
      "Offer": "State the concrete reason for this Offer score using cues like scope clarity, audience fit, deliverables, pricing visibility, and placement of offer details.",
      "Branding": "State the concrete reason for this Branding score as communicative brand solidity: consistency between visual style and message (promise, voice, terminology) across headline, sections, and CTA microcopy.",
      "Conversion": "State the concrete reason for this Conversion score using cues like CTA placement, friction in lead capture, repeated action paths, and urgency/reassurance elements."
    },
    "insight": "${COMPETITIVE_POSITION_INSIGHT}",
    "method_note": "Short disclosure that the chart is AI-estimated."
  }
}

Hard requirements:
- Keep all JSON keys exactly as written above.
- Keep category names and order exactly as written above.
- Do NOT output revenue_opportunity in this response.
- All scores must be integers from 1 to 5.
- Keep summary to 2 sentences max.
- Keep each category comment to 1 sentence (max 28 words).
- Keep each strength, issue, and action concise.
- Keep verdict to 1 sentence (max 20 words).
- market_momentum.period_labels must be exactly: ${MARKET_MOMENTUM_LABELS.join(", ")}.
- market_momentum.badge must be one of: ${MARKET_MOMENTUM_BADGES.join(", ")}.
- market_momentum.insight must explicitly answer why the trend relationship exists (cause -> effect), not just describe what the lines do.
- market_momentum.insight must cite at least one concrete page cue (for example: unclear value proposition, weak differentiation claim, hidden pricing, sparse proof near CTA, unclear offer scope).
- competitive_position.axes must be exactly: ${COMPETITIVE_POSITION_AXES.join(", ")}.
- competitive_position.axis_explanations must include exactly these keys: ${COMPETITIVE_POSITION_AXES.join(", ")}.
- Each competitive_position.axis_explanations value must be one concrete sentence, max ${COMPETITIVE_AXIS_EXPLANATION_CHAR_MAX} characters.
- Each competitive_position.axis_explanations sentence must reference at least one visible page cue (for example: hero headline, CTA position, testimonial block, form length, pricing section, navigation labels).
- Avoid generic abstract wording like "branding is weak" without evidence; explain what is missing, misplaced, or unclear on page.
- Axis boundary rules (keep signals separated):
- Trust: credibility and risk-reduction evidence only (testimonials, logos, case results, guarantees, credentials, policies).
- UX: interaction and navigation quality only (layout clarity, hierarchy, readability, friction, consistency of controls).
- SEO: discoverability and information architecture signals only (headings, topical relevance, crawlable copy, structure).
- Offer: commercial proposition clarity only (what is sold, for whom, deliverables, scope, pricing transparency).
- Branding: communicative brand solidity only, meaning alignment between style and content (promise, tone of voice, wording, narrative consistency, differentiation language).
- Conversion: action momentum only (CTA prominence, repetition, form friction, reassurance near action points).
- For Branding specifically: do not use social proof, guarantees, credentials, or trust badges as the main reason; focus on consistency between content and style.
- For Trust specifically: do not justify score with tone-of-voice or visual style coherence alone; require credibility evidence.
- competitive_position.insight must be exactly: "${COMPETITIVE_POSITION_INSIGHT}".
- Tone: elegant, sharp, professional, honest, premium consultancy style.
- ${languageConfig.instruction}
- ${languageGuardrails.join("\n- ")}

WEBSITE CONTENT:
${siteContent || "No content available: the website may be empty or inaccessible."}`;
}

function buildRevenuePrompt({ hostname, siteContent, languageConfig }) {
  const languageGuardrails = buildLanguageGuardrails(languageConfig);

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
- Keep revenue_opportunity prose concise and within the word/character limits above.
- revenue_opportunity.step_insights must be an object with exactly these keys and order: ${REVENUE_UI_STEP_IDS.join(", ")}.
- Each revenue_opportunity.step_insights entry must include: explanation, quick_fixes.
- explanation must be a single short paragraph, about 12-24 words and max 190 characters.
- quick_fixes must contain exactly 2 concise items, about 5-10 words each and max 90 characters per item.
- step_insights text must reference concrete page elements (hero, CTA placement, proof blocks, form friction, structure) when visible.
- Avoid generic formulas; tie each step insight to observed site cues.
- Keep the output strategically honest and internally plausible.
- ${languageConfig.instruction}
- ${languageGuardrails.join("\n- ")}

WEBSITE CONTENT:
${siteContent || "No content available: the website may be empty or inaccessible."}`;
}

function buildSchemaRepairPrompt({ basePrompt, validationError }) {
  return `${basePrompt}

SCHEMA CORRECTION:
Your previous output failed schema validation.
Validation error: ${validationError || "Unknown schema error"}.

Return the full JSON again, valid and complete.
Do not omit any required key.
Do not add commentary.
Do not repeat mistakes from the previous attempt.`;
}

function createGenerationError(code, message, status = 502, details = {}) {
  const error = createHttpError(message, status);
  error.code = code;
  error.details = details;
  return error;
}

function isRecoverableProviderStatus(status) {
  return [408, 409, 425, 429, 500, 502, 503, 504, 529].includes(status);
}

function shouldFallbackModel(error) {
  return [
    "recoverable_provider_error",
    "truncated_after_retry",
    "parse_failed_after_retry",
  ].includes(error?.code);
}

function logUsage({ provider, model, response, payload, stage }) {
  const usage = payload?.usage || {};
  console.log(
    "Website roaster AI usage:",
    JSON.stringify({
      provider,
      model,
      stage,
      status: response?.status,
      stop_reason: payload?.stop_reason || null,
      input_tokens:
        typeof usage.input_tokens === "number"
          ? usage.input_tokens
          : typeof usage.prompt_tokens === "number"
            ? usage.prompt_tokens
            : null,
      output_tokens:
        typeof usage.output_tokens === "number"
          ? usage.output_tokens
          : typeof usage.completion_tokens === "number"
            ? usage.completion_tokens
            : null,
    }),
  );
}

async function runStructuredGenerationWithModel({
  provider,
  apiKey,
  requestedModel,
  prompt,
  primaryMaxTokens,
  retryMaxTokens,
  parseResponse,
}) {
  let modelInUse = requestedModel;
  let { response, payload } = await requestReview({
    provider,
    apiKey,
    model: modelInUse,
    prompt,
    maxTokens: primaryMaxTokens,
  });

  if (isMissingModelError(response.status, payload, provider)) {
    console.warn(
      `Anthropic model unavailable: ${modelInUse}. Looking up available models.`,
    );

    const {
      response: modelsResponse,
      payload: modelsPayload,
    } = await requestAvailableModels({
      apiKey,
    });

    if (modelsResponse.ok) {
      const fallbackModel = pickFallbackAnthropicModel(modelsPayload);

      if (fallbackModel && fallbackModel !== modelInUse) {
        console.warn(
          `Retrying Anthropic request with fallback model: ${fallbackModel}`,
        );

        modelInUse = fallbackModel;
        ({ response, payload } = await requestReview({
          provider,
          apiKey,
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

  logUsage({ provider, model: modelInUse, response, payload, stage: "initial" });

  if (!response.ok) {
    const message = mapProviderErrorMessage(response.status, payload, { provider });
    console.error(`${provider} status:`, response.status);
    console.error(`${provider} error:`, JSON.stringify(payload, null, 2));

    if (isRecoverableProviderStatus(response.status)) {
      throw createGenerationError(
        "recoverable_provider_error",
        message,
        502,
        { status: response.status, model: modelInUse, provider },
      );
    }

    throw createGenerationError("provider_error", message, 502, {
      status: response.status,
      model: modelInUse,
      provider,
    });
  }

  console.log(`${provider} model used:`, modelInUse);
  let reviewText = extractProviderText(payload, provider);

  if (isTruncatedResponse(payload, provider)) {
    console.warn("AI review was truncated on first attempt. Retrying once.");

    const truncationRepairPrompt = buildSchemaRepairPrompt({
      basePrompt: prompt,
      validationError:
        "Response was truncated because max output tokens were reached.",
    });

    const {
      response: truncationRetryResponse,
      payload: truncationRetryPayload,
    } = await requestReview({
      provider,
      apiKey,
      model: modelInUse,
      prompt: truncationRepairPrompt,
      maxTokens: retryMaxTokens,
    });

    logUsage({
      provider,
      model: modelInUse,
      response: truncationRetryResponse,
      payload: truncationRetryPayload,
      stage: "truncation_retry",
    });

    if (!truncationRetryResponse.ok) {
      const retryMessage = mapProviderErrorMessage(
        truncationRetryResponse.status,
        truncationRetryPayload,
        { provider },
      );
      if (isRecoverableProviderStatus(truncationRetryResponse.status)) {
        throw createGenerationError("recoverable_provider_error", retryMessage, 502, {
          status: truncationRetryResponse.status,
          model: modelInUse,
          provider,
        });
      }
      throw createGenerationError("provider_error", retryMessage, 502, {
        status: truncationRetryResponse.status,
        model: modelInUse,
        provider,
      });
    }

    if (isTruncatedResponse(truncationRetryPayload, provider)) {
      throw createGenerationError(
        "truncated_after_retry",
        "The AI response was truncated before the JSON completed. Please try again.",
        502,
        { model: modelInUse, provider },
      );
    }

    reviewText = extractProviderText(truncationRetryPayload, provider);
    payload = truncationRetryPayload;
  }

  try {
    return parseResponse(reviewText);
  } catch (firstParseError) {
    console.error("Invalid AI review payload (attempt 1):", firstParseError);

    const repairPrompt = buildSchemaRepairPrompt({
      basePrompt: prompt,
      validationError: firstParseError?.message || "Invalid AI response",
    });

    const { response: retryResponse, payload: retryPayload } = await requestReview({
      provider,
      apiKey,
      model: modelInUse,
      prompt: repairPrompt,
      maxTokens: retryMaxTokens,
    });

    logUsage({
      provider,
      model: modelInUse,
      response: retryResponse,
      payload: retryPayload,
      stage: "schema_retry",
    });

    if (!retryResponse.ok) {
      const retryMessage = mapProviderErrorMessage(retryResponse.status, retryPayload, {
        provider,
      });
      if (isRecoverableProviderStatus(retryResponse.status)) {
        throw createGenerationError("recoverable_provider_error", retryMessage, 502, {
          status: retryResponse.status,
          model: modelInUse,
          provider,
        });
      }
      throw createGenerationError("provider_error", retryMessage, 502, {
        status: retryResponse.status,
        model: modelInUse,
        provider,
      });
    }

    if (isTruncatedResponse(retryPayload, provider)) {
      throw createGenerationError(
        "truncated_after_retry",
        "The AI response was truncated before the JSON completed. Please try again.",
        502,
        { model: modelInUse, provider },
      );
    }

    const retryText = extractProviderText(retryPayload, provider);

    try {
      return parseResponse(retryText);
    } catch (secondParseError) {
      console.error("Invalid AI review payload (attempt 2):", secondParseError);
      console.error("Raw AI payload (attempt 1):", JSON.stringify(payload, null, 2));
      console.error("Raw AI payload (attempt 2):", JSON.stringify(retryPayload, null, 2));
      throw createGenerationError(
        "parse_failed_after_retry",
        secondParseError.message || "Invalid AI response",
        502,
        { model: modelInUse, provider },
      );
    }
  }
}

async function runStructuredGeneration({
  provider,
  apiKey,
  primaryModel,
  fallbackModel,
  enableModelFallback,
  prompt,
  primaryMaxTokens,
  retryMaxTokens,
  parseResponse,
}) {
  try {
    return await runStructuredGenerationWithModel({
      provider,
      apiKey,
      requestedModel: primaryModel,
      prompt,
      primaryMaxTokens,
      retryMaxTokens,
      parseResponse,
    });
  } catch (error) {
    const canFallback =
      enableModelFallback &&
      fallbackModel &&
      fallbackModel !== primaryModel &&
      shouldFallbackModel(error);

    if (!canFallback) {
      throw error;
    }

    console.warn(
      `Switching to fallback model ${fallbackModel}. Reason: ${error.code || "unknown"}.`,
    );

    return runStructuredGenerationWithModel({
      provider,
      apiKey,
      requestedModel: fallbackModel,
      prompt,
      primaryMaxTokens,
      retryMaxTokens,
      parseResponse,
    });
  }
}

function shouldFallbackProvider(error) {
  return [
    "recoverable_provider_error",
    "truncated_after_retry",
    "parse_failed_after_retry",
  ].includes(error?.code);
}

async function runStructuredGenerationByApiMode({
  aiApiMode,
  anthropicApiKey,
  openRouterApiKey,
  anthropicPrimaryModel,
  anthropicFallbackModel,
  enableAnthropicModelFallback,
  openRouterModel,
  openRouterFallbackModel,
  enableOpenRouterModelFallback,
  prompt,
  primaryMaxTokens,
  retryMaxTokens,
  parseResponse,
}) {
  const runAnthropic = () =>
    runStructuredGeneration({
      provider: "anthropic",
      apiKey: anthropicApiKey,
      primaryModel: anthropicPrimaryModel,
      fallbackModel: anthropicFallbackModel,
      enableModelFallback: enableAnthropicModelFallback,
      prompt,
      primaryMaxTokens,
      retryMaxTokens,
      parseResponse,
    });

  const runOpenRouter = () =>
    runStructuredGeneration({
      provider: "openrouter",
      apiKey: openRouterApiKey,
      primaryModel: openRouterModel,
      fallbackModel: openRouterFallbackModel,
      enableModelFallback: enableOpenRouterModelFallback,
      prompt,
      primaryMaxTokens,
      retryMaxTokens,
      parseResponse,
    });

  if (aiApiMode === "anthropic") {
    return { result: await runAnthropic(), notice: "" };
  }

  if (aiApiMode === "openrouter") {
    return { result: await runOpenRouter(), notice: "" };
  }

  if (aiApiMode === "anthropic-before") {
    try {
      return { result: await runAnthropic(), notice: "" };
    } catch (anthropicError) {
      if (!shouldFallbackProvider(anthropicError) || !openRouterApiKey) {
        throw anthropicError;
      }

      console.warn(
        "Anthropic primary attempt failed; switching provider fallback to OpenRouter.",
        {
          code: anthropicError?.code || "unknown",
          message: anthropicError?.message || "",
        },
      );

      return { result: await runOpenRouter(), notice: "" };
    }
  }

  try {
    return { result: await runOpenRouter(), notice: "" };
  } catch (openRouterError) {
    if (!shouldFallbackProvider(openRouterError) || !anthropicApiKey) {
      throw openRouterError;
    }

    console.warn(
      "OpenRouter primary attempt failed; switching provider fallback to Anthropic.",
      {
        code: openRouterError?.code || "unknown",
        message: openRouterError?.message || "",
      },
    );

    return {
      result: await runAnthropic(),
      notice: OPENROUTER_FALLBACK_NOTICE,
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const mode = resolveReviewMode(body?.mode);
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    const outputLanguage = normalizeLanguage(body?.language);
    const languageConfig = SUPPORTED_LANGUAGES[outputLanguage];
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY?.trim() || "";
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() || "";
    const aiApiMode = ROASTER_RUNTIME.aiApiMode;
    const anthropicPrimaryModel = ROASTER_RUNTIME.primaryModel;
    const anthropicFallbackModel = ROASTER_RUNTIME.fallbackModel;
    const enableAnthropicModelFallback = ROASTER_RUNTIME.enableModelFallback;
    const openRouterModel = ROASTER_RUNTIME.openRouterModel;
    const openRouterFallbackModel = ROASTER_RUNTIME.openRouterFallbackModel;
    const enableOpenRouterModelFallback =
      ROASTER_RUNTIME.enableOpenRouterModelFallback;
    const hasProviderFallbackMode =
      aiApiMode === "both" ||
      aiApiMode === "openrouter-before" ||
      aiApiMode === "anthropic-before";

    if (aiApiMode === "anthropic" && !ANTHROPIC_API_KEY) {
      return sendErrorResponse({
        rawUrl,
        error: "Anthropic API key is not configured",
      });
    }

    if (aiApiMode === "openrouter" && !OPENROUTER_API_KEY) {
      return sendErrorResponse({
        rawUrl,
        error: "OpenRouter API key is not configured",
      });
    }

    if (hasProviderFallbackMode && !OPENROUTER_API_KEY && !ANTHROPIC_API_KEY) {
      return sendErrorResponse({
        rawUrl,
        error:
          "No AI provider key configured. Add OPENROUTER_API_KEY and/or ANTHROPIC_API_KEY.",
      });
    }

    console.log(
      "Website roaster runtime config:",
      JSON.stringify({
        mode,
        cost_target_percent: ROASTER_RUNTIME.costTargetPercent,
        profile: ROASTER_RUNTIME.profileName,
        depth_one_max_links: DEPTH_ONE_MAX_LINKS,
        page_stage_one_max_chars: PAGE_STAGE_ONE_MAX_CHARS,
        global_site_content_max_chars: GLOBAL_SITE_CONTENT_MAX_CHARS,
        base_max_tokens: BASE_REVIEW_MAX_TOKENS,
        base_retry_max_tokens: BASE_REVIEW_RETRY_MAX_TOKENS,
        revenue_max_tokens: REVENUE_PROMPT_MAX_TOKENS,
        revenue_retry_max_tokens: REVENUE_PROMPT_RETRY_MAX_TOKENS,
        ai_api_mode: aiApiMode,
        anthropic_primary_model: anthropicPrimaryModel,
        anthropic_fallback_model: anthropicFallbackModel,
        anthropic_model_fallback_enabled: enableAnthropicModelFallback,
        openrouter_model: openRouterModel,
        openrouter_fallback_model: openRouterFallbackModel || null,
        openrouter_model_fallback_enabled: enableOpenRouterModelFallback,
        has_anthropic_key: Boolean(ANTHROPIC_API_KEY),
        has_openrouter_key: Boolean(OPENROUTER_API_KEY),
      }),
    );

    const artifactSecret = getFunnelArtifactSecret(ANTHROPIC_API_KEY);
    if (!artifactSecret) {
      return sendErrorResponse({
        rawUrl,
        error: "Funnel artifact secret is not configured.",
      });
    }

    if (mode === "funnel") {
      let artifactPayload;
      try {
        artifactPayload = parseAndVerifyFunnelArtifact(
          body?.funnel_artifact,
          artifactSecret,
        );
      } catch (artifactError) {
        return sendErrorResponse({
          rawUrl,
          error: artifactError?.message || "Invalid funnel artifact.",
          status: artifactError?.status || 400,
        });
      }

      let parsedArtifactUrl = null;
      try {
        parsedArtifactUrl = normalizeInputUrl(artifactPayload.url);
      } catch {
        return sendErrorResponse({
          rawUrl: artifactPayload.url,
          error: "Invalid URL stored in funnel artifact.",
          status: 400,
        });
      }

      const artifactLanguageConfig = SUPPORTED_LANGUAGES[artifactPayload.language];
      const canonicalArtifactUrl = toCanonicalUrl(parsedArtifactUrl).href;
      const cachedFunnel = getCachedRoasterPayload({
        canonicalUrl: canonicalArtifactUrl,
        language: artifactPayload.language,
        mode,
      });

      if (cachedFunnel?.revenue_opportunity) {
        console.log(
          "Website roaster cache:",
          JSON.stringify({
            mode,
            cache: "hit",
            final_chars: artifactPayload.site_content.length,
          }),
        );

        return Response.json({
          revenue_opportunity: cachedFunnel.revenue_opportunity,
        });
      }

      console.log(
        "Website roaster cache:",
        JSON.stringify({
          mode,
          cache: "miss",
          final_chars: artifactPayload.site_content.length,
        }),
      );

      const prompt = buildRevenuePrompt({
        hostname: parsedArtifactUrl.hostname,
        siteContent: artifactPayload.site_content,
        languageConfig: artifactLanguageConfig,
      });

      const { result: review, notice } = await runStructuredGenerationByApiMode({
        aiApiMode,
        anthropicApiKey: ANTHROPIC_API_KEY,
        openRouterApiKey: OPENROUTER_API_KEY,
        anthropicPrimaryModel,
        anthropicFallbackModel,
        enableAnthropicModelFallback,
        openRouterModel,
        openRouterFallbackModel,
        enableOpenRouterModelFallback,
        prompt,
        primaryMaxTokens: REVENUE_PROMPT_MAX_TOKENS,
        retryMaxTokens: REVENUE_PROMPT_RETRY_MAX_TOKENS,
        parseResponse: parseAndValidateRevenueOpportunity,
      });
      const revenueOpportunity = await maybeTranslateRevenueOpportunityToItalian(
        review.revenue_opportunity,
        {
          aiApiMode,
          language: artifactPayload.language,
        },
      );

      setCachedRoasterPayload({
        canonicalUrl: canonicalArtifactUrl,
        language: artifactPayload.language,
        mode,
        payload: {
          revenue_opportunity: revenueOpportunity,
        },
      });

      await sendRoasterNotification({
        rawUrl: artifactPayload.url,
        normalizedUrl: parsedArtifactUrl.href,
        hostname: parsedArtifactUrl.hostname,
        status: "success",
        review,
      });

      return Response.json({
        revenue_opportunity: revenueOpportunity,
        notice: notice || undefined,
      });
    }

    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const clientIp = forwardedFor.split(",")[0]?.trim() || "";
    const turnstileResult = await verifyTurnstileToken({
      token: body?.turnstileToken,
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
      parsedUrl = normalizeInputUrl(body?.url);
    } catch (error) {
      return sendErrorResponse({
        rawUrl,
        error: error.message || "Invalid URL",
        status: 400,
      });
    }

    const homepageCanonical = toCanonicalUrl(parsedUrl).href;
    const cachedBase = getCachedRoasterPayload({
      canonicalUrl: homepageCanonical,
      language: outputLanguage,
      mode,
    });

    if (cachedBase?.review && cachedBase?.site_content) {
      console.log(
        "Website roaster cache:",
        JSON.stringify({
          mode,
          cache: "hit",
          final_chars: cachedBase.site_content.length,
        }),
      );

      const artifactExpiresAtMs = Date.now() + FUNNEL_ARTIFACT_TTL_MS;
      const funnelArtifact = createFunnelArtifact({
        siteContent: cachedBase.site_content,
        url: homepageCanonical,
        language: outputLanguage,
        expiresAtMs: artifactExpiresAtMs,
        secret: artifactSecret,
      });

      await sendRoasterNotification({
        rawUrl,
        normalizedUrl: parsedUrl.href,
        hostname: parsedUrl.hostname,
        status: "success",
        review: cachedBase.review,
      });

      return Response.json({
        review: cachedBase.review,
        funnel_artifact: funnelArtifact,
        funnel_expires_at: new Date(artifactExpiresAtMs).toISOString(),
      });
    }

    console.log(
      "Website roaster cache:",
      JSON.stringify({
        mode,
        cache: "miss",
      }),
    );

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
        trust_signals_present: compression.trustSignalsPresent,
        trust_fallback_injected: compression.trustFallbackInjected,
      }),
    );

    if (compression.failedDetails.length > 0) {
      console.warn(
        "Website roaster page fetch failures:",
        compression.failedDetails.join(" | "),
      );
    }

    const prompt = buildBasePrompt({
      hostname: parsedUrl.hostname,
      siteContent,
      languageConfig,
    });

    const { result: review, notice } = await runStructuredGenerationByApiMode({
      aiApiMode,
      anthropicApiKey: ANTHROPIC_API_KEY,
      openRouterApiKey: OPENROUTER_API_KEY,
      anthropicPrimaryModel,
      anthropicFallbackModel,
      enableAnthropicModelFallback,
      openRouterModel,
      openRouterFallbackModel,
      enableOpenRouterModelFallback,
      prompt,
      primaryMaxTokens: BASE_REVIEW_MAX_TOKENS,
      retryMaxTokens: BASE_REVIEW_RETRY_MAX_TOKENS,
      parseResponse: parseAndValidateBaseReview,
    });
    const translatedReview = await maybeTranslateBaseReviewToItalian(review, {
      aiApiMode,
      language: outputLanguage,
    });

    setCachedRoasterPayload({
      canonicalUrl: homepageCanonical,
      language: outputLanguage,
      mode,
      payload: {
        review: translatedReview,
        site_content: siteContent,
      },
    });

    const artifactExpiresAtMs = Date.now() + FUNNEL_ARTIFACT_TTL_MS;
    const funnelArtifact = createFunnelArtifact({
      siteContent,
      url: homepageCanonical,
      language: outputLanguage,
      expiresAtMs: artifactExpiresAtMs,
      secret: artifactSecret,
    });

    await sendRoasterNotification({
      rawUrl,
      normalizedUrl: parsedUrl.href,
      hostname: parsedUrl.hostname,
      status: "success",
      review: translatedReview,
    });

    return Response.json({
      review: translatedReview,
      funnel_artifact: funnelArtifact,
      funnel_expires_at: new Date(artifactExpiresAtMs).toISOString(),
      notice: notice || undefined,
    });
  } catch (err) {
    console.error("Roast API error:", err);
    return sendErrorResponse({
      error: err?.message || "Server error",
      status: err?.status || 500,
    });
  }
}
