import { apiFetch } from '@/shared/api/http';
import type { EventInput } from '@/entities/event';

export const createEvent = (input: EventInput) => apiFetch('/events', { method: 'POST', json: input });
export const updateEvent = (id: string, patch: Partial<EventInput>) =>
  apiFetch('/events/' + id, { method: 'PATCH', json: patch });
export const deleteEvent = (id: string) => apiFetch('/events/' + id, { method: 'DELETE' });
