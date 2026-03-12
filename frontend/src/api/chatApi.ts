import { CHAT_ENDPOINT } from '../constants/api';
import type { ChatResponse } from '../types';

export interface SendMessagePayload {
  message: string;
  conversationId: string | null;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function sendChatMessage(payload: SendMessagePayload): Promise<ChatResponse> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error ?? data?.details ?? 'Request failed';
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }

  return data as ChatResponse;
}
