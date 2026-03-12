const GEMINI_EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';
const EMBED_MODEL = 'models/gemini-embedding-001';

function getApiKey(): string | null {
  const key = process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  return key?.trim() || null;
}

async function callEmbedApi(text: string): Promise<number[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY is not set');

  const url = `${GEMINI_EMBED_URL}?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBED_MODEL,
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embeddings failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!Array.isArray(values)) throw new Error('Invalid embedding response');
  return values;
}

export async function embedText(text: string): Promise<number[]> {
  return callEmbedApi(text);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(texts.map((t) => callEmbedApi(t)));
  return results;
}

export function hasEmbeddings(): boolean {
  return !!getApiKey();
}
