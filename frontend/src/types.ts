export interface ToolTrace {
  domain: string;
  toolName: string;
  args: Record<string, unknown>;
  response: unknown;
  ragDetails?: {
    query: string;
    chunkIds: string[];
    snippets: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  domain: string;
  traces: ToolTrace[];
}
