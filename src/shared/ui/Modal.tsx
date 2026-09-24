'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider dialogs for forms. */
  size?: 'sm' | 'md';
}

/** Accessible modal built on the native <dialog> element (Escape and backdrop clicks close it). */
export function Modal({ open, title, onClose, children, size = 'sm' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        'border-line bg-surface text-fg open:animate-pop m-auto rounded-2xl border p-6 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm',
        size === 'md' ? 'w-[min(94vw,32rem)]' : 'w-[min(92vw,26rem)]',
      )}>
      <h2 className='font-display text-lg font-semibold'>{title}</h2>
      {open && children}
    </dialog>
  );
}
