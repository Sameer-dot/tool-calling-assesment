import type { IntentDomain } from '../router/intentRouter.js';

export const TOOL_DEFINITIONS: Record<IntentDomain, Record<string, { description: string; parameters: object }>> = {
  calendar: {
    calendar_find_availability: {
      description: 'Find available time slots for booking within a date range',
      parameters: {
        type: 'object',
        properties: {
          start: { type: 'string', description: 'ISO 8601 start datetime' },
          end: { type: 'string', description: 'ISO 8601 end datetime' },
          timezone: { type: 'string', description: 'Timezone e.g. Asia/Riyadh', default: 'Asia/Riyadh' },
          duration_minutes: { type: 'number', description: 'Duration in minutes' },
        },
        required: ['start', 'end', 'duration_minutes'],
      },
    },
    calendar_create_event: {
      description: 'Create a calendar event/appointment',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title' },
          start: { type: 'string', description: 'ISO 8601 start' },
          end: { type: 'string', description: 'ISO 8601 end' },
          timezone: { type: 'string', default: 'Asia/Riyadh' },
          attendees: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['title', 'start', 'end'],
      },
    },
    calendar_update_event: {
      description: 'Update an existing event',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string' },
          changes: { type: 'object' },
        },
        required: ['event_id', 'changes'],
      },
    },
    calendar_cancel_event: {
      description: 'Cancel an event',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['event_id'],
      },
    },
  },
  catalog: {
    catalog_search: {
      description: 'Search products by query and optional filters (maxPrice in SAR, skinType)',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          filters: {
            type: 'object',
            properties: {
              maxPrice: { type: 'number' },
              skinType: { type: 'string', enum: ['oily', 'dry', 'sensitive', 'all'] },
            },
          },
        },
        required: ['query'],
      },
    },
    catalog_get_product: {
      description: 'Get product details by ID',
      parameters: {
        type: 'object',
        properties: { product_id: { type: 'string' } },
        required: ['product_id'],
      },
    },
    catalog_compare: {
      description: 'Compare multiple products by IDs',
      parameters: {
        type: 'object',
        properties: { product_ids: { type: 'array', items: { type: 'string' } } },
        required: ['product_ids'],
      },
    },
  },
  knowledge: {
    kb_search: {
      description: 'Search company knowledge base for services, policies, location, hours, refund rules',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
    kb_get_chunks: {
      description: 'Get specific knowledge chunks by ID',
      parameters: {
        type: 'object',
        properties: { chunk_ids: { type: 'array', items: { type: 'string' } } },
        required: ['chunk_ids'],
      },
    },
  },
  clarification: {},
};

export function getToolsForDomain(domain: IntentDomain): Record<string, { description: string; parameters: object }> {
  return TOOL_DEFINITIONS[domain] ?? {};
}
