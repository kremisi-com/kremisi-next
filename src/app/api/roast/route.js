const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const MAIL_ENDPOINT =
  process.env.KREMISI_MAIL_ENDPOINT?.trim() ||
  "https://api.kremisi.com/send-mail.php";
const ROASTER_MAIL_KIND = "website-roaster";

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
    return `Richiesta non valida verso Anthropic: ${providerMessage}. Controlla il model ID configurato in ANTHROPIC_MODEL.`;
  }

  if (status === 401 || status === 403) {
    return `Autenticazione Anthropic fallita: ${providerMessage}. Controlla ANTHROPIC_API_KEY.`;
  }

  return `Errore provider AI: ${providerMessage}`;
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
    throw new Error("URL mancante");
  }

  return new URL(
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
  );
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
  const message = error || "Errore del server";

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
    const { url } = await request.json();
    const rawUrl = typeof url === "string" ? url.trim() : "";

    let parsedUrl;
    try {
      parsedUrl = normalizeInputUrl(url);
    } catch (error) {
      return sendErrorResponse({
        rawUrl,
        error: error.message || "URL non valido",
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
      siteContent = "Impossibile leggere il contenuto del sito.";
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: "API key Anthropic non configurata",
      });
    }

    const configuredModel =
      process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;

    const prompt = `Sei un esperto di web design, UX e marketing digitale con un senso dell'umorismo tagliente ma costruttivo.

Analizza il seguente contenuto estratto dal sito web "${parsedUrl.hostname}" e produci un "roast" professionale: ironico, diretto, ma genuinamente utile.

STRUTTURA LA RISPOSTA COSI' (senza usare markdown o titoli, testo scorrevole):
1. Una frase d'apertura ad effetto che cattura subito l'essenza del sito (max 1 riga)
2. Cosa funziona bene, sii specifico (2 punti)
3. Cosa ha margine di miglioramento, sii diretto e onesto ma sempre rispettoso (2 punti)
4. I 3 miglioramenti prioritari da fare SUBITO (non di piu)
5. Una frase finale motivazionale ma ironica, che faccia sentir meglio il proprietario del sito

Usa emoji con parsimonia (1-2 massimo). Scrivi in italiano. Sii specifico rispetto al contenuto reale del sito, non generico.
Non usare mai il carattere "e' con accento": scrivi sempre "e'".
La risposta non deve superare i 600 token.
Quando critichi qualcosa, indica sempre perche' e' un'opportunita' mancata e quale vantaggio concreto si perderebbe — non limitarti a dire che manca, spiega il costo di quella mancanza.
CONTENUTO DEL SITO:
${siteContent || "Nessun contenuto disponibile: il sito potrebbe essere vuoto o inaccessibile."}`;

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

    // Anthropic restituisce content[0].text invece di choices[0].message.content
    const roast = payload?.content?.[0]?.text
      ?.trim()
      .replaceAll("È", "E'")
      .replaceAll("è", "e'");

    if (!roast) {
      return sendErrorResponse({
        rawUrl,
        parsedUrl,
        error: `Risposta AI vuota. Raw: ${JSON.stringify(payload)}`,
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
      error: "Errore del server",
    });
  }
}
