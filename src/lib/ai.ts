import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;
const TIMEOUT_MS = 30000;

interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  responseMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

interface AIResponse {
  text: string;
  ok: boolean;
  error?: string;
}

async function callEdgeFunction(req: AIRequest): Promise<AIResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      return { text: '', ok: false, error: errData.error || `Erreur ${response.status}` };
    }

    const data = await response.json();
    if (!data.text) {
      return { text: '', ok: false, error: 'Réponse vide' };
    }

    return { text: data.text, ok: true };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { text: '', ok: false, error: 'Délai dépassé' };
    }
    return { text: '', ok: false, error: 'Connexion impossible' };
  }
}

export async function generateAIText(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<AIResponse> {
  return callEdgeFunction({
    prompt,
    systemPrompt,
    temperature: options?.temperature,
    maxOutputTokens: options?.maxOutputTokens,
  });
}

export async function generateAIJSON<T>(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<{ data: T | null; ok: boolean; error?: string }> {
  const result = await callEdgeFunction({
    prompt,
    systemPrompt,
    responseMimeType: 'application/json',
    temperature: options?.temperature ?? 0.7,
    maxOutputTokens: options?.maxOutputTokens ?? 2048,
  });

  if (!result.ok) {
    return { data: null, ok: false, error: result.error };
  }

  try {
    const parsed = JSON.parse(result.text) as T;
    return { data: parsed, ok: true };
  } catch {
    const start = result.text.indexOf('{');
    const end = result.text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(result.text.slice(start, end + 1)) as T;
        return { data: parsed, ok: true };
      } catch {
        // fall through
      }
    }
    return { data: null, ok: false, error: 'Format JSON invalide' };
  }
}
