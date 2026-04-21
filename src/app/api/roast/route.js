const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const MAIL_ENDPOINT =
  process.env.KREMISI_MAIL_ENDPOINT?.trim() ||
  "https://api.kremisi.com/send-mail.php";
const ROASTER_MAIL_KIND = "website-roaster";
const SUPPORTED_LANGUAGES = {
  it: {
    label: "Italian",
    instruction:
      "Write the full response in Italian. Keep the tone sharp, natural, and idiomatic for an Italian-speaking audience.",
  },
  en: {
    label: "English",
    instruction:
      "Write the full response in English. Keep the tone sharp, natural, and idiomatic for an English-speaking audience.",
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

async function requestRoast({ apiKey, model, prompt }) {
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
      max_tokens: 800,
    }),
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
}

function buildRoastPreview(roast) {
  if (!roast) return "";

  return roast.slice(0, 280);
}

async function sendRoasterNotification({
  rawUrl = "",
  normalizedUrl = "",
  hostname = "",
  status,
  error = "",
  roast = "",
}) {
  const payload = new URLSearchParams({
    kind: ROASTER_MAIL_KIND,
    url: rawUrl,
    normalizedUrl,
    hostname,
    status,
    error,
    roastPreview: buildRoastPreview(roast),
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

    const prompt = `You are an expert in web design, UX, and digital marketing with a sharp but constructive sense of humor.

Analyze the following content extracted from the website "${parsedUrl.hostname}" and produce a professional roast: ironic, direct, but genuinely useful.

STRUCTURE THE RESPONSE LIKE THIS (without markdown or headings, plain flowing text):
1. An opening line with impact that instantly captures the essence of the site (max 1 line)
2. What works well, be specific (2 points)
3. What needs improvement, be direct and honest but always respectful (2 points)
4. The 3 highest-priority improvements to make RIGHT NOW (no more)
5. A final motivational but ironic line that makes the site owner feel a little better

Use emojis sparingly (1-2 at most). Write in ${languageConfig.label}.
${languageConfig.instruction}
Be specific to the real website content, never generic.
Keep the response under 600 tokens.
Whenever you criticize something, always explain why it is a missed opportunity and what concrete benefit is being lost. Do not just say something is missing, explain the cost of that absence.
WEBSITE CONTENT:
${siteContent || "No content available: the website may be empty or inaccessible."}`;

    const { response, payload } = await requestRoast({
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

    // Anthropic returns content[0].text instead of choices[0].message.content
    const roast = payload?.content?.[0]?.text
      ?.trim()
      .replaceAll("È", "E'")
      .replaceAll("è", "e'");

    if (!roast) {
      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: `Empty AI response. Raw: ${JSON.stringify(payload)}`,
      });
    }

    const level = Math.min(5, Math.max(1, Math.floor(roast.length / 150)));

    await sendRoasterNotification({
      rawUrl,
      normalizedUrl: parsedUrl.href,
      hostname: parsedUrl.hostname,
      status: "success",
      roast,
    });

    return Response.json({ roast, level });
  } catch (err) {
    console.error("Roast API error:", err);
    return sendErrorResponse({
      error: "Server error",
    });
  }
}
