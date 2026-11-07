'use client';

import { useState, type ReactNode } from 'react';
import { Collapse } from './Collapse';
import { Notice } from './Notice';

interface NoticeSlotProps {
  tone: 'warning' | 'success' | 'error' | 'info';
  /** What to say; nothing (null, undefined, an empty string) folds the notice away. */
  message: ReactNode;
  onDismiss?: () => void;
}

/**
 * The place in a form where a message may appear. It folds in and out, so the fields and buttons
 * around it slide instead of jumping. Add space with a margin on a parent: while empty it takes none.
 */
export function NoticeSlot({ tone, message, onDismiss }: NoticeSlotProps) {
  const visible = message !== null && message !== undefined && message !== '' && message !== false;
  // Keep the last message on screen while it folds away.
  const [last, setLast] = useState(message);
  if (visible && message !== last) setLast(message);
  return (
    <Collapse open={visible}>
      <Notice tone={tone} onDismiss={onDismiss}>
        {last}
      </Notice>
    </Collapse>
  );
}
