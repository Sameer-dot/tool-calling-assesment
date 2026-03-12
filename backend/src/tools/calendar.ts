import type { ToolTrace, ChatMessage } from '../domain/types.js';
import * as knowledgeTools from './knowledge.js';

const DEFAULT_TIMEZONE = 'Asia/Riyadh';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  timezone: string;
  attendees?: string[];
  location?: string;
  notes?: string;
}

const events: Map<string, CalendarEvent> = new Map();

export function calendarFindAvailability(
  start: string,
  end: string,
  timezone: string,
  durationMinutes: number
): { slots: string[] } {
  const slots: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = new Date(startDate); d < endDate; d.setMinutes(d.getMinutes() + 30)) {
    const slotEnd = new Date(d.getTime() + durationMinutes * 60 * 1000);
    if (slotEnd <= endDate) {
      slots.push(d.toISOString());
    }
  }

  return { slots: slots.slice(0, 10) };
}

export function calendarCreateEvent(
  title: string,
  start: string,
  end: string,
  timezone: string,
  attendees?: string[],
  location?: string,
  notes?: string
): { eventId: string; success: boolean } {
  const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  events.set(id, {
    id,
    title,
    start,
    end,
    timezone: timezone || DEFAULT_TIMEZONE,
    attendees,
    location,
    notes,
  });
  return { eventId: id, success: true };
}

export function calendarUpdateEvent(eventId: string, changes: Partial<CalendarEvent>): { success: boolean } {
  const event = events.get(eventId);
  if (!event) return { success: false };
  Object.assign(event, changes);
  return { success: true };
}

export function calendarCancelEvent(eventId: string, reason?: string): { success: boolean } {
  return { success: events.delete(eventId) };
}

export async function handleCalendarRequest(
  message: string,
  _history: ChatMessage[],
  useKnowledge = false
): Promise<{ response: string; traces: ToolTrace[] }> {
  const traces: ToolTrace[] = [];
  const lower = message.toLowerCase();

  if (useKnowledge && (lower.includes('botox') || lower.includes('treatment') || lower.includes('service'))) {
    const kbResult = await knowledgeTools.handleKnowledgeRequest(message, _history);
    traces.push(...kbResult.traces);
  }

  if (lower.includes('availability') || lower.includes('available') || lower.includes('slots')) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(17, 0, 0, 0);
    const result = calendarFindAvailability(
      start.toISOString(),
      end.toISOString(),
      DEFAULT_TIMEZONE,
      60
    );
    traces.push({
      domain: 'calendar',
      toolName: 'calendar_find_availability',
      args: {
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: DEFAULT_TIMEZONE,
        duration_minutes: 60,
      },
      response: result,
    });
    return {
      response: `Here are available slots: ${result.slots.slice(0, 5).map((s) => new Date(s).toLocaleString()).join(', ')}. Would you like to book one?`,
      traces,
    };
  }

  if (lower.includes('book') || lower.includes('create') || lower.includes('schedule')) {
    const hasDate = /\b(next|on|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2})\b/i.test(message);
    if (!hasDate) {
      return {
        response: 'What date would you like to book? For example, "next Wednesday" or a specific date.',
        traces,
      };
    }
    const title = extractTitle(message) || 'Appointment';
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const result = calendarCreateEvent(title, start.toISOString(), end.toISOString(), DEFAULT_TIMEZONE);
    traces.push({
      domain: 'calendar',
      toolName: 'calendar_create_event',
      args: {
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: DEFAULT_TIMEZONE,
      },
      response: result,
    });
    return {
      response: `Your appointment "${title}" has been booked for ${start.toLocaleString()}. Confirmation ID: ${result.eventId}.`,
      traces,
    };
  }

  if (lower.includes('reschedule') || lower.includes('rescheduling') || (lower.includes('move') && lower.includes('appointment')) || (lower.includes('change') && lower.includes('appointment'))) {
    const eventId = extractEventId(message);
    if (eventId) {
      const newStart = new Date();
      newStart.setDate(newStart.getDate() + 2);
      newStart.setHours(14, 0, 0, 0);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
      const result = calendarUpdateEvent(eventId, {
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      });
      traces.push({
        domain: 'calendar',
        toolName: 'calendar_update_event',
        args: { event_id: eventId, changes: { start: newStart.toISOString(), end: newEnd.toISOString() } },
        response: { success: result.success },
      });
      return {
        response: result.success ? `Your appointment has been rescheduled to ${newStart.toLocaleString()}.` : 'Could not find that appointment.',
        traces,
      };
    }
    return {
      response: 'Please provide the appointment ID to reschedule, or book a new appointment.',
      traces: [],
    };
  }

  if (lower.includes('cancel')) {
    const eventId = extractEventId(message);
    if (eventId) {
      const result = calendarCancelEvent(eventId);
      traces.push({
        domain: 'calendar',
        toolName: 'calendar_cancel_event',
        args: { event_id: eventId },
        response: { success: result.success },
      });
      return {
        response: result.success ? 'Your appointment has been cancelled.' : 'Could not find that appointment.',
        traces,
      };
    }
    return {
      response: 'Please provide the appointment ID to cancel.',
      traces: [],
    };
  }

  return {
    response: 'I can help with booking, checking availability, or cancelling appointments. What would you like to do?',
    traces: [],
  };
}

function extractTitle(msg: string): string | null {
  const m = msg.match(/book\s+(?:me\s+)?(.+?)(?:\s+next|\s+on|$)/i);
  return m ? m[1].trim() : null;
}

function extractEventId(_msg: string): string | null {
  const ids = Array.from(events.keys());
  return ids[ids.length - 1] ?? null;
}
