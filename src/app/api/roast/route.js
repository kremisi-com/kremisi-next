const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

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
      return Response.json(
        { error: "API key Anthropic non configurata" },
        { status: 500 },
      );
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

      return Response.json({ error: message }, { status: 500 });
    }

    console.log("Anthropic model used:", configuredModel);

    // Anthropic restituisce content[0].text invece di choices[0].message.content
    const roast = payload?.content?.[0]?.text
      ?.trim()
      .replaceAll("È", "E'")
      .replaceAll("è", "e'");

    if (!roast) {
      return Response.json(
        { error: `Risposta AI vuota. Raw: ${JSON.stringify(payload)}` },
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
