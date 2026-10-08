'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EventDto } from '@/entities/event';
import {
  fetchMediaStatus,
  SelectableGrid,
  useInfiniteMedia,
  type MediaKind,
  type MediaPageDto,
  type Visibility,
} from '@/entities/media';
import { useSession } from '@/entities/session';
import { deleteWording, MediaAdminActions, SelectionBar, useMediaMutations } from '@/features/manage-media';
import { MediaViewer } from '@/features/media-viewer';
import { formatCount } from '@/shared/lib/format';
import { useSelection } from '@/shared/lib/use-selection';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Select } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';

interface AdminLibraryProps {
  initial: MediaPageDto;
  events: EventDto[];
  /** Increase to make the library reload (after uploads or edits elsewhere). */
  version: number;
  onChanged: () => void;
}

const STATUS_POLL_MS = 3000;

/** Every item in a square grid with multi-select, bulk actions and the viewer. */
export function AdminLibrary({ initial, events, version, onChanged }: AdminLibraryProps) {
  const { role, privateAccess } = useSession();
  const [eventSlug, setEventSlug] = useState('');
  const [visibility, setVisibility] = useState<'' | Visibility>('');
  const [kind, setKind] = useState<'' | MediaKind>('');
  const filters = useMemo(
    () => ({ event: eventSlug || undefined, visibility: visibility || undefined, kind: kind || undefined }),
    [eventSlug, visibility, kind],
  );
  const { items, total, hasMore, loading, error, loadMore, sentinelRef, replace } = useInfiniteMedia(
    initial,
    filters,
    version,
  );
  const selection = useSelection(items.map((item) => item.id));
  const [active, setActive] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutations = useMediaMutations(onChanged);
  const ids = selection.ids;
  const wording = deleteWording(role, ids.length);

  // Follow videos while the server converts them.
  const converting = items
    .filter((item) => item.video?.status === 'processing')
    .map((item) => item.id)
    .join(',');
  useEffect(() => {
    if (!converting) return;
    const pending = converting.split(',');
    let inFlight = false;
    const timer = setInterval(async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        replace((await fetchMediaStatus(pending)).items);
      } catch {
        // Try again on the next tick.
      } finally {
        inFlight = false;
      }
    }, STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [converting, replace]);

  return (
    <div className='pb-24'>
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <Select
          aria-label='Filter by event'
          containerClassName='w-full sm:w-52'
          className='h-10'
          value={eventSlug}
          onChange={(e) => setEventSlug(e.target.value)}>
          <option value=''>All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.slug}>
              {event.title}
            </option>
          ))}
        </Select>
        <Select
          aria-label='Filter by type'
          containerClassName='w-full sm:w-44'
          className='h-10'
          value={kind}
          onChange={(e) => setKind(e.target.value as '' | MediaKind)}>
          <option value=''>Photos + videos</option>
          <option value='photo'>Photos only</option>
          <option value='video'>Videos only</option>
        </Select>
        {privateAccess && (
          <Select
            aria-label='Filter by access'
            containerClassName='w-full sm:w-44'
            className='h-10'
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as '' | Visibility)}>
            <option value=''>Public + private</option>
            <option value='public'>Public only</option>
            <option value='private'>Private only</option>
          </Select>
        )}
        <span className='text-muted text-sm'>{formatCount(total)} items</span>
        <div className='ml-auto flex gap-2'>
          <Button variant='secondary' size='sm' onClick={selection.selectAll}>
            Select loaded
          </Button>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState title='Nothing here'>Upload photos or videos, or change the filters.</EmptyState>
      ) : (
        <SelectableGrid
          items={items}
          selected={selection.selected}
          onToggle={selection.toggle}
          onOpen={setActive}
        />
      )}

      {hasMore && <div ref={sentinelRef} className='h-px' />}
      {loading && (
        <div className='text-primary flex justify-center py-6'>
          <Spinner className='size-6' />
        </div>
      )}
      {(error || mutations.error) && (
        <p role='alert' className='text-danger py-4 text-center text-sm'>
          {error ?? mutations.error}
        </p>
      )}

      {ids.length > 0 && (
        <SelectionBar
          count={ids.length}
          events={events}
          busy={mutations.busy}
          canChangeVisibility={privateAccess}
          onVisibility={(value) => void mutations.update(ids, { visibility: value })}
          onMove={(eventId) => void mutations.update(ids, { eventId })}
          onDelete={() => setConfirmDelete(true)}
          onClear={selection.clear}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={wording.title}
        confirmLabel={wording.confirm}
        loading={mutations.busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (await mutations.remove(ids)) {
            setConfirmDelete(false);
            selection.clear();
          }
        }}>
        {wording.body}
      </ConfirmDialog>

      {active !== null && (
        <MediaViewer
          items={items}
          index={active}
          hasMore={hasMore}
          onIndexChange={setActive}
          onNeedMore={() => void loadMore()}
          onClose={() => setActive(null)}
          actions={(item) => (
            <MediaAdminActions
              item={item}
              onUpdated={onChanged}
              onDeleted={() => {
                setActive(null);
                onChanged();
              }}
            />
          )}
        />
      )}
    </div>
  );
}
