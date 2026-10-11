import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface RequestBody {
  prompt: string;
  systemPrompt?: string;
  responseMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Clé API Gemini non configurée. Ajoute GEMINI_API_KEY dans les secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Authenticate the user via the Supabase JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    const requestBody: RequestBody = await req.json();
    const { prompt, systemPrompt, responseMimeType, temperature, maxOutputTokens } = requestBody;

    if (!prompt || typeof prompt !== "string" || prompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt manquant ou vide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (prompt.length > 8000) {
      return new Response(
        JSON.stringify({ error: "Prompt trop long (max 8000 caractères)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contents = [
      { role: "user", parts: [{ text: prompt }] },
    ];

    const generationConfig: Record<string, unknown> = {
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxOutputTokens ?? 2048,
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }

    const payload: Record<string, unknown> = { contents, generationConfig };
    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: `Erreur de l'API Gemini (${geminiResponse.status}): ${errText.slice(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text).join("") ?? "";

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Réponse vide de Gemini." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
