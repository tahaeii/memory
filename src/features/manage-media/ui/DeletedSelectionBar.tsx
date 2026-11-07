'use client';

import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { plural, t } from '@i18n';
import { Button } from '@/shared/ui/Button';
import { FloatingBar } from '@/shared/ui/FloatingBar';

interface DeletedSelectionBarProps {
  count: number;
  busy: boolean;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floating toolbar for items selected in the super admin's "Deleted" list. */
export function DeletedSelectionBar({ count, busy, onRestore, onDelete, onClear }: DeletedSelectionBarProps) {
  // Keep the last number on screen while the bar sinks out.
  const [shown, setShown] = useState(count);
  if (count > 0 && count !== shown) setShown(count);
  return (
    <FloatingBar open={count > 0}>
      <span className='text-fg text-sm font-medium tabular-nums'>
        {plural('media.selection.count', shown)}
      </span>
      <Button size='sm' variant='secondary' disabled={busy} onClick={onRestore}>
        <RotateCcw className='size-4' /> {t('media.selection.restore')}
      </Button>
      <Button size='sm' variant='danger' disabled={busy} onClick={onDelete}>
        <Trash2 className='size-4' /> {t('media.delete.confirmForGood')}
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear}>
        {t('common.actions.clear')}
      </Button>
    </FloatingBar>
  );
}
