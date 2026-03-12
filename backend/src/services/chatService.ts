import { routeIntent } from '../router/intentRouter.js';
import { executeTools } from '../tools/executor.js';
import type { ProcessMessageInput, ProcessMessageResult } from '../domain/types.js';

export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageResult> {
  const { message, history } = input;
  const conversationId = input.conversationId ?? `conv_${Date.now()}`;

  const { domain, secondaryDomain } = routeIntent(message, history);
  const { response, traces } = await executeTools(domain, message, history, secondaryDomain);

  return {
    response,
    conversationId,
    domain: secondaryDomain ? `${domain}+${secondaryDomain}` : domain,
    traces,
  };
}
