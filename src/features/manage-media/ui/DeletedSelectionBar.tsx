'use client';

import { RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface DeletedSelectionBarProps {
  count: number;
  busy: boolean;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floating toolbar for items selected in the super admin's "Deleted" list. */
export function DeletedSelectionBar({ count, busy, onRestore, onDelete, onClear }: DeletedSelectionBarProps) {
  return (
    <div className='animate-pop border-line bg-glass fixed inset-x-3 bottom-4 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border p-2 pl-4 shadow-2xl shadow-black/20 backdrop-blur-xl'>
      <span className='text-fg text-sm font-medium'>{count} selected</span>
      <Button size='sm' variant='secondary' disabled={busy} onClick={onRestore}>
        <RotateCcw className='size-4' /> Restore
      </Button>
      <Button size='sm' variant='danger' disabled={busy} onClick={onDelete}>
        <Trash2 className='size-4' /> Delete for good
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
