import type { Request, Response } from 'express';
import { processMessage } from '../services/chatService.js';

interface ChatRequestBody {
  message: string;
  conversationId?: string | null;
  history?: Array<{ role: string; content: string }>;
}

export async function handleChat(req: Request, res: Response): Promise<void> {
  const body = req.body as ChatRequestBody;
  const { message, conversationId = null, history = [] } = body;

  const result = await processMessage({
    message,
    conversationId,
    history: history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });

  res.json(result);
}
