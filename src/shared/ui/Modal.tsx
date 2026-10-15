'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { usePresence } from '@/shared/lib/use-presence';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider dialogs for forms. */
  size?: 'sm' | 'md';
}

/**
 * Accessible modal built on the native <dialog> element (Escape and backdrop clicks close it).
 * It stays in the top layer until its closing animation has finished.
 */
export function Modal({ open, title, onClose, children, size = 'sm' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { mounted, state } = usePresence(open);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (mounted && !dialog.open) dialog.showModal();
    if (!mounted && dialog.open) dialog.close();
  }, [mounted]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      data-state={state}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        'border-line bg-surface text-fg shadow-overlay backdrop:bg-scrim m-auto rounded-2xl border p-5 sm:p-6',
        'data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in',
        'data-[state=closed]:backdrop:animate-fade-out data-[state=open]:backdrop:animate-fade-in',
        size === 'md' ? 'w-[min(calc(100vw-2rem),32rem)]' : 'w-[min(calc(100vw-2rem),26rem)]',
      )}>
      <h2 className='type-heading text-lg'>{title}</h2>
      {mounted && children}
    </dialog>
  );
}
