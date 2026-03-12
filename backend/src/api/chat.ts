import { Router, type Request } from 'express';
import { validateChatRequest } from '../middleware/validateChatRequest.js';
import { handleChat } from '../controllers/chatController.js';

export const chatRouter = Router();

chatRouter.post('/chat', validateChatRequest, (req: Request, res, next) => {
  void handleChat(req, res).catch(next);
});
