import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

interface ChatRequestBody {
  message?: unknown;
  conversationId?: unknown;
  history?: unknown;
}

function isValidHistory(history: unknown): history is Array<{ role: string; content: string }> {
  if (!Array.isArray(history)) return false;
  return history.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof (item as { role?: unknown }).role === 'string' &&
      typeof (item as { content?: unknown }).content === 'string'
  );
}

export function validateChatRequest(
  req: Request<object, object, ChatRequestBody>,
  _res: Response,
  next: NextFunction
): void {
  const { message, history } = req.body ?? {};

  if (message === undefined || message === null) {
    next(new AppError('message is required', 400));
    return;
  }

  if (typeof message !== 'string') {
    next(new AppError('message must be a string', 400));
    return;
  }

  if (message.trim().length === 0) {
    next(new AppError('message cannot be empty', 400));
    return;
  }

  if (history !== undefined && history !== null && !isValidHistory(history)) {
    next(new AppError('history must be an array of { role, content } objects', 400));
    return;
  }

  next();
}
