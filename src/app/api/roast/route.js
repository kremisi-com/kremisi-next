const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
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
const MARKET_MOMENTUM_PERIODS = 5;

function getMarketMomentumLabels() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: MARKET_MOMENTUM_PERIODS }, (_, index) =>
    String(currentYear - (MARKET_MOMENTUM_PERIODS - 1) + index),
  );
}

const MARKET_MOMENTUM_LABELS = getMarketMomentumLabels();
const PRIORITY_LEVELS = ["High", "Medium", "Low"];
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

async function requestReview({ apiKey, model, prompt }) {
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
      max_tokens: 1800,
    }),
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
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

function validateMarketMomentum(marketMomentum) {
  if (
    !marketMomentum ||
    typeof marketMomentum !== "object" ||
    Array.isArray(marketMomentum)
  ) {
    return false;
  }

  const { label, delta_percent, period_labels, series, insight, method_note } =
    marketMomentum;

  if (
    !isNonEmptyString(label) ||
    !isFiniteNumber(delta_percent) ||
    Math.abs(delta_percent) > 100 ||
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
    !Array.isArray(series) ||
    series.length !== MARKET_MOMENTUM_LABELS.length ||
    series.some((value) => !isFiniteNumber(value) || value < 25 || value > 100)
  ) {
    return false;
  }

  return true;
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
    validateMarketMomentum(review.market_momentum)
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

function buildReviewPreview(review) {
  if (!review) return "";

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
  "summary": "Short executive summary in 2-3 sentences.",
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
    "label": "Short descriptor for the chart.",
    "delta_percent": 18,
    "period_labels": ["${MARKET_MOMENTUM_LABELS[0]}", "${MARKET_MOMENTUM_LABELS[1]}", "${MARKET_MOMENTUM_LABELS[2]}", "${MARKET_MOMENTUM_LABELS[3]}", "${MARKET_MOMENTUM_LABELS[4]}"],
    "series": [42, 47, 51, 58, 63],
    "insight": "Short sentence explaining the market signal.",
    "method_note": "Short disclosure that the chart is AI-estimated."
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
- market_momentum.series must contain exactly 5 numbers in the 25-100 range.
- market_momentum must represent estimated category demand over the last 5 years inferred from the site's category, offer clarity, market maturity, and positioning.
- Keep the series plausible and low-variance: no chaotic spikes, no dramatic collapses unless clearly justified by the site context.
- Make the series shape and the insight logically consistent with each other.
- delta_percent must be derived from the general change across the five-year window, rounded to a whole number.
- label and method_note must clearly frame the chart as an estimate, not factual analytics.
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

export async function POST(request) {
  try {
    const { url, language } = await request.json();
    const rawUrl = typeof url === "string" ? url.trim() : "";
    const outputLanguage = normalizeLanguage(language);
    const languageConfig = SUPPORTED_LANGUAGES[outputLanguage];

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

    const jinaUrl = `https://r.jina.ai/${parsedUrl.href}`;
    let siteContent = "";

    try {
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          Accept: "text/plain",
          "X-Return-Format": "text",
          "X-Remove-Selector": "header,footer,nav,script,style",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (jinaRes.ok) {
        const fullText = await jinaRes.text();
        siteContent = fullText.slice(0, 3000);
      }
    } catch {
      siteContent = "Unable to read the website content.";
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

    const prompt = buildPrompt({
      hostname: parsedUrl.hostname,
      siteContent,
      languageConfig,
    });

    const { response, payload } = await requestReview({
      apiKey: ANTHROPIC_API_KEY,
      model: configuredModel,
      prompt,
    });

    if (!response.ok) {
      const message = mapProviderErrorMessage(response.status, payload);

      console.error("Anthropic status:", response.status);
      console.error("Anthropic error:", JSON.stringify(payload, null, 2));

      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: message,
      });
    }

    console.log("Anthropic model used:", configuredModel);

    const reviewText = extractModelTextBlocks(payload);

    if (isTruncatedResponse(payload)) {
      console.error("AI review was truncated:", JSON.stringify(payload, null, 2));

      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error:
          "The AI response was truncated before the JSON completed. Please try again.",
        status: 502,
      });
    }

    let review;

    try {
      review = parseAndValidateReview(reviewText);
    } catch (error) {
      console.error("Invalid AI review payload:", error);
      console.error("Raw AI payload:", JSON.stringify(payload, null, 2));

      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: error.message || "Invalid AI response",
        status: 502,
      });
    }

    await sendRoasterNotification({
      rawUrl,
      normalizedUrl: parsedUrl.href,
      hostname: parsedUrl.hostname,
      status: "success",
      review,
    });

    return Response.json({ review });
  } catch (err) {
    console.error("Roast API error:", err);
    return sendErrorResponse({
      error: "Server error",
    });
  }
}
