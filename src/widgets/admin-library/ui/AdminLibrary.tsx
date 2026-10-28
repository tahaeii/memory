'use client';

import { useMemo, useState } from 'react';
import type { EventDto } from '@/entities/event';
import {
  LoadState,
  SelectableGrid,
  useInfiniteMedia,
  useVideoStatus,
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
import { Select, type SelectOption } from '@/shared/ui/select';

interface AdminLibraryProps {
  initial: MediaPageDto;
  events: EventDto[];
  /** Increase to make the library reload (after uploads or edits elsewhere). */
  version: number;
  onChanged: () => void;
}

const KIND_OPTIONS: Array<SelectOption<'' | MediaKind>> = [
  { value: '', label: 'Photos and videos' },
  { value: 'photo', label: 'Photos only' },
  { value: 'video', label: 'Videos only' },
];

const VISIBILITY_OPTIONS: Array<SelectOption<'' | Visibility>> = [
  { value: '', label: 'Public and private' },
  { value: 'public', label: 'Public only' },
  { value: 'private', label: 'Private only' },
];

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

  useVideoStatus(items, replace);

  return (
    <div className='pb-24'>
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <Select
          label='Filter by event'
          size='sm'
          className='w-full sm:w-52'
          value={eventSlug}
          onChange={setEventSlug}
          options={[
            { value: '', label: 'All events' },
            ...events.map((event) => ({ value: event.slug, label: event.title })),
          ]}
        />
        <Select
          label='Filter by type'
          size='sm'
          className='w-full sm:w-44'
          value={kind}
          onChange={setKind}
          options={KIND_OPTIONS}
        />
        {privateAccess && (
          <Select
            label='Filter by access'
            size='sm'
            className='w-full sm:w-44'
            value={visibility}
            onChange={setVisibility}
            options={VISIBILITY_OPTIONS}
          />
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

      <LoadState
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        loading={loading}
        error={error ?? mutations.error}
      />

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
