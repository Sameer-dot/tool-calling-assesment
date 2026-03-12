import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ToolTrace, ChatMessage } from '../domain/types.js';
import { hasEmbeddings, embedText, embedTexts } from '../rag/embeddings.js';
import { searchBySimilarity, type VectorChunk } from '../rag/vectorSearch.js';

interface Chunk {
  id: string;
  content: string;
  metadata?: Record<string, string>;
}

let KNOWLEDGE_CHUNKS: Chunk[] = [];
let VECTOR_CHUNKS: VectorChunk[] | null = null;

function loadKnowledgeChunks(): Chunk[] {
  const fallback: Chunk[] = [
    { id: 'chunk_1', content: 'Our clinic offers aesthetic and skincare services including Botox, fillers, facials, and laser treatments.' },
    { id: 'chunk_2', content: 'Working hours: Sunday to Thursday 9:00 AM - 8:00 PM. Friday and Saturday: 10:00 AM - 6:00 PM.' },
    { id: 'chunk_3', content: 'Location: Riyadh, King Fahd Road. Free parking available.' },
    { id: 'chunk_4', content: 'Refund policy: Full refund within 24 hours of booking cancellation. No refund for completed treatments.' },
    { id: 'chunk_5', content: 'For oily skin, we recommend oil-free sunscreens and matte formulations. For dry skin, hydrating formulas work best.' },
    { id: 'chunk_6', content: 'Botox appointments typically last 30-45 minutes. Please arrive 10 minutes early.' },
  ];

  const candidates = [
    join(process.cwd(), 'docs', 'company-knowledge.txt'),
    join(process.cwd(), '..', 'docs', 'company-knowledge.txt'),
  ];
  const docPath = candidates.find((p) => existsSync(p));
  if (!docPath) return fallback;

  try {
    const text = readFileSync(docPath, 'utf-8');
    const sections = text.split(/\n\n+/).filter((s) => s.trim().length > 0);
    return sections.map((content, i) => ({
      id: `chunk_${i + 1}`,
      content: content.trim(),
    }));
  } catch {
    return fallback;
  }
}

async function ensureVectorChunks(): Promise<VectorChunk[] | null> {
  if (VECTOR_CHUNKS) return VECTOR_CHUNKS;
  if (!hasEmbeddings()) return null;

  KNOWLEDGE_CHUNKS = loadKnowledgeChunks();
  if (KNOWLEDGE_CHUNKS.length === 0) return null;

  try {
    const texts = KNOWLEDGE_CHUNKS.map((c) => c.content);
    const vectors = await embedTexts(texts);
    VECTOR_CHUNKS = KNOWLEDGE_CHUNKS.map((c, i) => ({
      id: c.id,
      content: c.content,
      vector: vectors[i]!,
    }));
    return VECTOR_CHUNKS;
  } catch (err) {
    console.error('Failed to create embeddings, falling back to keyword search:', err);
    return null;
  }
}

function simpleSearch(query: string): Chunk[] {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return KNOWLEDGE_CHUNKS.filter((c) => {
    const content = c.content.toLowerCase();
    return words.some((w) => content.includes(w));
  });
}

export function kbSearch(query: string): { chunkIds: string[]; snippets: string[] } {
  const matches = simpleSearch(query);
  return {
    chunkIds: matches.map((c) => c.id),
    snippets: matches.map((c) => c.content),
  };
}

export async function kbSearchSemantic(query: string): Promise<{ chunkIds: string[]; snippets: string[] }> {
  const vectorChunks = await ensureVectorChunks();
  if (!vectorChunks) {
    return kbSearch(query);
  }

  try {
    const queryVector = await embedText(query);
    const matches = searchBySimilarity(queryVector, vectorChunks, 5);
    return {
      chunkIds: matches.map((c) => c.id),
      snippets: matches.map((c) => c.content),
    };
  } catch (err) {
    console.error('Semantic search failed, falling back to keyword:', err);
    return kbSearch(query);
  }
}

export function kbGetChunks(chunkIds: string[]): Chunk[] {
  return chunkIds
    .map((id) => KNOWLEDGE_CHUNKS.find((c) => c.id === id))
    .filter((c): c is Chunk => c !== undefined);
}

export async function handleKnowledgeRequest(
  message: string,
  _history: ChatMessage[]
): Promise<{ response: string; traces: ToolTrace[] }> {
  const traces: ToolTrace[] = [];
  KNOWLEDGE_CHUNKS = loadKnowledgeChunks();

  const useSemantic = hasEmbeddings();
  const { chunkIds, snippets } = useSemantic
    ? await kbSearchSemantic(message)
    : kbSearch(message);

  traces.push({
    domain: 'knowledge',
    toolName: 'kb_search',
    args: { query: message, useSemantic: useSemantic },
    response: { chunkIds, snippets },
    ragDetails: {
      query: message,
      chunkIds,
      snippets,
    },
  });

  if (chunkIds.length === 0) {
    return {
      response: "I couldn't find specific information about that in our knowledge base. Please try rephrasing or ask about our services, location, hours, or policies.",
      traces,
    };
  }

  const chunks = kbGetChunks(chunkIds);
  const combined = chunks.map((c) => c.content).join(' ');
  return {
    response: `Based on our records: ${combined}`,
    traces,
  };
}
