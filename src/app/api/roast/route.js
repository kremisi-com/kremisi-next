const DEFAULT_OPENROUTER_MODEL = "openrouter/auto";

function extractErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;

  if (typeof payload === "string") return payload;
  if (typeof payload.error === "string") return payload.error;
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (payload.raw) return payload.raw;

  return fallbackMessage;
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
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://kremisi.com",
      "X-Title": "Kremisi Website Roaster",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.85,
    }),
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    let parsedUrl;
    try {
      parsedUrl = normalizeInputUrl(url);
    } catch (error) {
      return Response.json(
        { error: error.message || "URL non valido" },
        { status: 400 },
      );
    }

    const jinaUrl = `https://r.jina.ai/${parsedUrl.href}`;
    let siteContent = "";

    try {
      const jinaRes = await fetch(jinaUrl, {
        headers: { Accept: "text/plain" },
        signal: AbortSignal.timeout(15000),
      });

      if (jinaRes.ok) {
        const fullText = await jinaRes.text();
        siteContent = fullText.slice(0, 3000);
      }
    } catch {
      siteContent = "Impossibile leggere il contenuto del sito.";
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return Response.json(
        { error: "API key OpenRouter non configurata" },
        { status: 500 },
      );
    }

    const configuredModel =
      process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

    const prompt = `Sei un esperto di web design, UX e marketing digitale con un senso dell'umorismo tagliente ma costruttivo.

Analizza il seguente contenuto estratto dal sito web "${parsedUrl.hostname}" e produci un "roast" professionale: ironico, diretto, ma genuinamente utile.

STRUTTURA LA RISPOSTA COSI' (senza usare markdown o titoli, testo scorrevole):
1. Una frase d'apertura ad effetto che cattura subito l'essenza del sito (max 1 riga)
2. Cosa funziona bene, sii specifico (2 punti)
3. Cosa ha margine di miglioramento, sii diretto e onesto ma sempre rispettoso (2 punti)
4. I 3 miglioramenti prioritari da fare SUBITO (non di piu)
5. Una frase finale motivazionale ma ironica, che faccia sentir meglio il proprietario del sito

Usa emoji con parsimonia (1-2 massimo). Scrivi in italiano. Sii specifico rispetto al contenuto reale del sito, non generico.
Non usare mai il carattere "è": scrivi sempre "e'".
CONTENUTO DEL SITO:
${siteContent || "Nessun contenuto disponibile: il sito potrebbe essere vuoto o inaccessibile."}`;

    const attempts = [configuredModel];
    if (configuredModel !== DEFAULT_OPENROUTER_MODEL) {
      attempts.push(DEFAULT_OPENROUTER_MODEL);
    }

    let aiData = null;
    let resolvedModel = configuredModel;
    let lastError = null;

    for (const model of attempts) {
      const { response, payload } = await requestRoast({
        apiKey: OPENROUTER_API_KEY,
        model,
        prompt,
      });

      if (response.ok) {
        aiData = payload;
        resolvedModel = model;
        break;
      }

      lastError = {
        status: response.status,
        model,
        message: extractErrorMessage(
          payload,
          `OpenRouter error ${response.status}`,
        ),
      };

      console.error("OpenRouter status:", response.status);
      console.error("OpenRouter model:", model);
      console.error("OpenRouter error:", JSON.stringify(payload, null, 2));

      const canRetryWithFallback =
        model !== DEFAULT_OPENROUTER_MODEL &&
        (response.status === 400 || response.status === 404);

      if (!canRetryWithFallback) {
        break;
      }
    }

    if (!aiData) {
      const status =
        lastError?.status === 400 || lastError?.status === 404 ? 502 : 500;

      const message =
        lastError?.status === 400 || lastError?.status === 404
          ? `Il provider AI ha rifiutato la richiesta (${lastError.message}). Verifica OPENROUTER_MODEL o riprova tra poco.`
          : `Errore provider AI: ${lastError?.message || "risposta non valida"}`;

      return Response.json({ error: message }, { status });
    }

    console.log("OpenRouter model used:", resolvedModel);

    const roast = aiData.choices?.[0]?.message?.content
      ?.trim()
      .replaceAll("È", "E'")
      .replaceAll("è", "e'");

    if (!roast) {
      return Response.json(
        { error: `Risposta AI vuota. Raw: ${JSON.stringify(aiData)}` },
        { status: 500 },
      );
    }

    const level = Math.min(5, Math.max(1, Math.floor(roast.length / 150)));

    return Response.json({ roast, level });
  } catch (err) {
    console.error("Roast API error:", err);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}
