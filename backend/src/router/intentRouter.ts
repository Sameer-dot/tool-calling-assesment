export type IntentDomain = 'calendar' | 'catalog' | 'knowledge' | 'clarification';

const CALENDAR_KEYWORDS = [
  'book', 'booking', 'availability', 'reschedule', 'rescheduling', 'cancel', 'appointment',
  'schedule', 'calendar', 'slot', 'time slot', 'next wednesday', 'next monday',
  'botox', 'treatment', 'move', 'change',
];

const CATALOG_KEYWORDS = [
  'product', 'search', 'compare', 'catalog', 'price', 'pricing', 'sunscreen',
  'skincare', 'sar', 'filter', 'recommend', 'oily skin', 'dry skin',
];

const KNOWLEDGE_KEYWORDS = [
  'company', 'policy', 'policies', 'refund', 'location', 'hours', 'working hours',
  'service', 'services', 'clinic', 'what do you offer', 'about us', 'recommend',
];

export interface RoutingResult {
  domain: IntentDomain;
  /** For multi-intent: e.g. catalog+knowledge for product + guidance */
  secondaryDomain?: IntentDomain;
}

export function routeIntent(_message: string, _history: { role: string; content: string }[]): RoutingResult {
  const message = _message.toLowerCase().trim();
  const domains: IntentDomain[] = [];

  for (const kw of CALENDAR_KEYWORDS) {
    if (message.includes(kw)) {
      domains.push('calendar');
      break;
    }
  }
  for (const kw of CATALOG_KEYWORDS) {
    if (message.includes(kw)) {
      domains.push('catalog');
      break;
    }
  }
  for (const kw of KNOWLEDGE_KEYWORDS) {
    if (message.includes(kw)) {
      domains.push('knowledge');
      break;
    }
  }

  if (domains.length === 0) return { domain: 'clarification' };
  if (domains.length >= 2) {
    return { domain: domains[0], secondaryDomain: domains[1] };
  }
  return { domain: domains[0] };
}
