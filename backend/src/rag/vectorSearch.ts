function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface VectorChunk {
  id: string;
  content: string;
  vector: number[];
}

/** Minimum similarity score to include a chunk (0.4 = moderate relevance) */
const MIN_SIMILARITY_THRESHOLD = 0.4;

export function searchBySimilarity(
  queryVector: number[],
  chunks: VectorChunk[],
  topK = 3
): VectorChunk[] {
  return chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryVector, chunk.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(({ score }) => score > MIN_SIMILARITY_THRESHOLD)
    .map(({ chunk }) => chunk);
}
