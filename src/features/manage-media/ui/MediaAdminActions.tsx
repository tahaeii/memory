'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { MediaDto } from '@/entities/media';
import { useSession } from '@/entities/session';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { deleteWording } from '../lib/delete-wording';
import { useMediaMutations } from '../model/use-media-mutations';

interface MediaAdminActionsProps {
  item: MediaDto;
  onUpdated: () => void;
  onDeleted: () => void;
}

const button =
  'grid size-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40';

/** Visibility toggle and delete for one item, shown inside the viewer for staff. */
export function MediaAdminActions({ item, onUpdated, onDeleted }: MediaAdminActionsProps) {
  const { role, privateAccess } = useSession();
  const [confirming, setConfirming] = useState(false);
  const updates = useMediaMutations(onUpdated);
  const deletion = useMediaMutations(onDeleted);
  const isPrivate = item.visibility === 'private';
  const wording = deleteWording(role, 1, item.kind);

  return (
    <>
      {privateAccess && (
        <button
          type='button'
          className={button}
          disabled={updates.busy}
          onClick={() => void updates.update([item.id], { visibility: isPrivate ? 'public' : 'private' })}
          aria-label={isPrivate ? 'Make public' : 'Make private'}
          title={isPrivate ? 'Private - click to make public' : 'Public - click to make private'}>
          {isPrivate ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
        </button>
      )}
      <button
        type='button'
        className={button}
        onClick={() => setConfirming(true)}
        aria-label={'Delete ' + item.kind}>
        <Trash2 className='size-5' />
      </button>
      <ConfirmDialog
        open={confirming}
        title={wording.title}
        confirmLabel={wording.confirm}
        loading={deletion.busy}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          if (await deletion.remove([item.id])) setConfirming(false);
        }}>
        {wording.body}
        {deletion.error && <span className='text-danger mt-2 block'>{deletion.error}</span>}
      </ConfirmDialog>
    </>
  );
}
