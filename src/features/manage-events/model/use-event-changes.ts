'use client';

import { useState } from 'react';
import type { EventDto } from '@/entities/event';
import { messageOf } from '@/shared/lib/error-message';
import { deleteEvent } from '../api/event-api';

/** Which event is being edited or is about to be deleted, and the delete request itself. */
export function useEventChanges(onChanged: () => void) {
  const [editing, setEditing] = useState<EventDto | null>(null);
  const [deleting, setDeleting] = useState<EventDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    setError(null);
    try {
      await deleteEvent(deleting.id);
      if (editing?.id === deleting.id) setEditing(null);
      setDeleting(null);
      onChanged();
    } catch (caught) {
      setError(messageOf(caught));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return {
    editing,
    startEdit: setEditing,
    stopEdit: () => setEditing(null),
    deleting,
    askDelete: setDeleting,
    cancelDelete: () => setDeleting(null),
    confirmDelete,
    busy,
    error,
    dismissError: () => setError(null),
  };
}
