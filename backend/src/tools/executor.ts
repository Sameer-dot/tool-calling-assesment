import type { ChatMessage, ToolTrace } from '../domain/types.js';
import type { IntentDomain } from '../router/intentRouter.js';
import { CLARIFICATION_MESSAGE, FALLBACK_MESSAGE } from '../domain/constants.js';
import * as calendarTools from './calendar.js';
import * as catalogTools from './catalog.js';
import * as knowledgeTools from './knowledge.js';

export async function executeTools(
  domain: IntentDomain,
  message: string,
  history: ChatMessage[],
  secondaryDomain?: IntentDomain
): Promise<{ response: string; traces: ToolTrace[] }> {
  const traces: ToolTrace[] = [];

  if (domain === 'clarification') {
    return { response: CLARIFICATION_MESSAGE, traces: [] };
  }

  if (domain === 'calendar') {
    const result = await calendarTools.handleCalendarRequest(message, history, secondaryDomain === 'knowledge');
    traces.push(...result.traces);
    return { response: result.response, traces };
  }

  if (domain === 'catalog') {
    const result = await catalogTools.handleCatalogRequest(message, history, secondaryDomain === 'knowledge');
    traces.push(...result.traces);
    return { response: result.response, traces };
  }

  if (domain === 'knowledge') {
    const result = await knowledgeTools.handleKnowledgeRequest(message, history);
    traces.push(...result.traces);
    return { response: result.response, traces };
  }

  return { response: FALLBACK_MESSAGE, traces: [] };
}
