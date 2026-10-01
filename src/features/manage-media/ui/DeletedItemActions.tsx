'use client';

import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { MediaDto } from '@/entities/media';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { deleteWording } from '../lib/delete-wording';
import { useMediaMutations } from '../model/use-media-mutations';

interface DeletedItemActionsProps {
  item: MediaDto;
  /** Runs after the item was restored or removed. */
  onDone: () => void;
}

const button =
  'inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white disabled:opacity-40';

/** Restore or delete for good, shown in the viewer of the super admin's "Deleted" list. */
export function DeletedItemActions({ item, onDone }: DeletedItemActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const actions = useMediaMutations(onDone);
  const wording = deleteWording('superadmin', 1, item.kind);

  return (
    <>
      <button
        type='button'
        className={button}
        disabled={actions.busy}
        onClick={() => void actions.restore([item.id])}>
        <RotateCcw className='size-4' />
        <span className='hidden sm:inline'>Restore</span>
      </button>
      <button
        type='button'
        className={button}
        disabled={actions.busy}
        onClick={() => setConfirming(true)}
        aria-label='Delete for good'>
        <Trash2 className='size-4' />
      </button>
      <ConfirmDialog
        open={confirming}
        title={wording.title}
        confirmLabel={wording.confirm}
        loading={actions.busy}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          if (await actions.remove([item.id])) setConfirming(false);
        }}>
        {wording.body}
      </ConfirmDialog>
    </>
  );
}
