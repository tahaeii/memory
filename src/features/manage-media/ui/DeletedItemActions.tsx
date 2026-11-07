'use client';

import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { IconButton } from '@/shared/ui/IconButton';
import { deleteWording } from '../lib/delete-wording';
import { useMediaMutations } from '../model/use-media-mutations';

interface DeletedItemActionsProps {
  item: MediaDto;
  /** Runs after the item was restored or removed. */
  onDone: () => void;
}

/** Restore or delete for good, shown in the viewer of the super admin's "Deleted" list. */
export function DeletedItemActions({ item, onDone }: DeletedItemActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const actions = useMediaMutations(onDone);
  const wording = deleteWording('superadmin', 1, item.kind);

  return (
    <>
      <IconButton
        label={t('media.actions.restore')}
        disabled={actions.busy}
        onClick={() => void actions.restore([item.id])}>
        <RotateCcw className='size-5' />
      </IconButton>
      <IconButton
        label={t('media.actions.deleteForGood')}
        disabled={actions.busy}
        onClick={() => setConfirming(true)}>
        <Trash2 className='size-5' />
      </IconButton>
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
