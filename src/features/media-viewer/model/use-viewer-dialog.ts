'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the viewer takes to fade out (animate-fade-out). */
const CLOSE_MS = 180;

/**
 * Opens the viewer's <dialog> in the top layer when it mounts, keeps the page behind it from
 * scrolling, and fades it out before telling the parent to unmount it.
 */
export function useViewerDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  // The dialog itself takes focus, so Space reaches the video player instead of a toolbar button.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      if (dialog?.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  const close = useCallback(() => setClosing(true), []);

  return { dialogRef, closing, close };
}
