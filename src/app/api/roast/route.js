// app/api/roast/route.js  (Next.js App Router)
// oppure: pages/api/roast.js  (Next.js Pages Router — vedi in fondo)

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: "URL mancante" }, { status: 400 });
    }

    // Valida l'URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return Response.json({ error: "URL non valido" }, { status: 400 });
    }

    // 1. Estrai il contenuto del sito tramite Jina.ai Reader (gratuito, nessuna API key)
    const jinaUrl = `https://r.jina.ai/${parsedUrl.href}`;
    let siteContent = "";

    try {
      const jinaRes = await fetch(jinaUrl, {
        headers: { Accept: "text/plain" },
        signal: AbortSignal.timeout(15000), // timeout 15s
      });

      if (jinaRes.ok) {
        const fullText = await jinaRes.text();
        // Tronca a ~3000 caratteri per non sprecare token
        siteContent = fullText.slice(0, 3000);
      }
    } catch {
      siteContent = "Impossibile leggere il contenuto del sito.";
    }

    // 2. Chiama OpenRouter con il modello gratuito
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return Response.json(
        { error: "API key OpenRouter non configurata" },
        { status: 500 },
      );
    }

    const prompt = `Sei un esperto di web design, UX e marketing digitale con un senso dell'umorismo tagliente ma costruttivo.
    
Analizza il seguente contenuto estratto dal sito web "${parsedUrl.hostname}" e produci un "roast" professionale: ironico, diretto, ma genuinamente utile.

STRUTTURA LA RISPOSTA COSÌ (senza usare markdown o titoli, testo scorrevole):
1. Una frase d'apertura ad effetto che cattura subito l'essenza del sito (max 2 righe)
2. Cosa funziona bene — sii specifico (2-3 punti)
3. Cosa fa schifo o potrebbe essere molto meglio — sii brutalmente onesto ma costruttivo (2-3 punti)
4. I 3 miglioramenti più urgenti da fare SUBITO
5. Una frase finale motivazionale ma ironica

Usa emoji con parsimonia (1-2 massimo). Scrivi in italiano. Sii specifico rispetto al contenuto reale del sito, non generico.

CONTENUTO DEL SITO:
${siteContent || "Nessun contenuto disponibile — il sito potrebbe essere vuoto o inaccessibile."}`;

    const openRouterRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kremisi.com",
          "X-Title": "Kremisi Website Roaster",
        },
        body: JSON.stringify({
          // Modello gratuito su OpenRouter — cambia con quello che preferisci
          model: "openrouter/elephant-alpha",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 600,
          temperature: 0.85,
        }),
      },
    );

    if (!openRouterRes.ok) {
      const errData = await openRouterRes.json();
      console.error("OpenRouter status:", openRouterRes.status);
      console.error("OpenRouter error:", JSON.stringify(errData, null, 2));
      // Restituisce l'errore dettagliato al browser per debug
      return Response.json(
        {
          error: `OpenRouter error ${openRouterRes.status}: ${JSON.stringify(errData)}`,
        },
        { status: 500 },
      );
    }

    const aiData = await openRouterRes.json();
    console.log("OpenRouter response:", JSON.stringify(aiData, null, 2));
    const roast = aiData.choices?.[0]?.message?.content?.trim();

    if (!roast) {
      return Response.json(
        { error: `Risposta AI vuota. Raw: ${JSON.stringify(aiData)}` },
        { status: 500 },
      );
    }

    // Calcola un "fire level" basato sulla lunghezza e tono del roast (1-5)
    const level = Math.min(5, Math.max(1, Math.floor(roast.length / 150)));

    return Response.json({ roast, level });
  } catch (err) {
    console.error("Roast API error:", err);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}

/* -------------------------------------------------------
   SE USI PAGES ROUTER (pages/api/roast.js), sostituisci
   l'intera export con questa:

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  // ... stessa logica, ma usa res.status(x).json(y) invece di Response.json()
}
------------------------------------------------------- */
