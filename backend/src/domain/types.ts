export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

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

export interface ProcessMessageInput {
  message: string;
  conversationId: string | null;
  history: ChatMessage[];
}

export interface ProcessMessageResult {
  response: string;
  conversationId: string;
  domain: string;
  traces: ToolTrace[];
}
