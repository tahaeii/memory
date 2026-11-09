'use client';

import { useMemo, useState } from 'react';
import { plural, t } from '@i18n';
import {
  LoadState,
  SelectableGrid,
  useInfiniteMedia,
  type MediaDto,
  type MediaPageDto,
} from '@/entities/media';
import type { UserDto } from '@/entities/user';
import {
  DeletedItemActions,
  DeletedSelectionBar,
  deleteWording,
  useMediaMutations,
} from '@/features/manage-media';
import { MediaViewer } from '@/features/media-viewer';
import { formatShortDate } from '@/shared/lib/format';
import { useSelection } from '@/shared/lib/use-selection';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Select } from '@/shared/ui/select';

interface DeletedLibraryProps {
  initial: MediaPageDto;
  /** Every staff account, to filter by who deleted. */
  users: UserDto[];
  /** Increase to make the list reload. */
  version: number;
  onChanged: () => void;
}

const caption = (item: MediaDto) =>
  item.deletion ? item.deletion.by + ', ' + formatShortDate(item.deletion.at) : null;

/**
 * Super admin only: what admins deleted, newest deletion first, with who deleted it and when.
 * Nobody else sees these items. Restore puts them back; deleting here removes them for good.
 */
export function DeletedLibrary({ initial, users, version, onChanged }: DeletedLibraryProps) {
  const [deletedBy, setDeletedBy] = useState('');
  const filters = useMemo(() => ({ deleted: true, deletedBy: deletedBy || undefined }), [deletedBy]);
  const { items, total, hasMore, loading, error, loadMore, sentinelRef } = useInfiniteMedia(
    initial,
    filters,
    version,
  );
  const selection = useSelection(items.map((item) => item.id));
  const [active, setActive] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutations = useMediaMutations(onChanged);
  const ids = selection.ids;
  const wording = deleteWording('superadmin', ids.length);
  const admins = users.filter((user) => user.role === 'admin');

  return (
    <div className='pb-24'>
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <Select
          label={t('admin.deleted.filterAdmin')}
          size='sm'
          className='w-full sm:w-56'
          value={deletedBy}
          onChange={setDeletedBy}
          options={[
            { value: '', label: t('admin.deleted.byAnyone') },
            ...admins.map((user) => ({
              value: user.id,
              label: t('admin.deleted.byUser', { username: user.username }),
            })),
          ]}
        />
        <span className='text-muted text-sm tabular-nums'>{plural('admin.library.items', total)}</span>
        <div className='ml-auto flex gap-2'>
          <Button variant='secondary' size='sm' onClick={selection.selectAll}>
            {t('admin.library.selectLoaded')}
          </Button>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState title={t('admin.deleted.emptyTitle')}>{t('admin.deleted.emptyText')}</EmptyState>
      ) : (
        <SelectableGrid
          items={items}
          selected={selection.selected}
          onToggle={selection.toggle}
          onOpen={setActive}
          caption={caption}
        />
      )}

      <LoadState
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        loading={loading}
        error={error ?? mutations.error}
      />

      <DeletedSelectionBar
        count={ids.length}
        busy={mutations.busy}
        onRestore={async () => {
          if (await mutations.restore(ids)) selection.clear();
        }}
        onDelete={() => setConfirmDelete(true)}
        onClear={selection.clear}
      />

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
            <DeletedItemActions
              item={item}
              onDone={() => {
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
