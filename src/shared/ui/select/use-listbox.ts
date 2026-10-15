'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

interface ListboxOptions {
  /** Labels in display order, for type-ahead. */
  labels: readonly string[];
  /** Index of the chosen option, or -1. */
  selectedIndex: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (index: number) => void;
}

const TYPEAHEAD_RESET_MS = 600;

/**
 * Keyboard behaviour of a select whose focus stays on its button: arrows, Home and End move the
 * highlighted option, Enter and Space choose it, and typing jumps to the first label that matches.
 */
export function useListbox({ labels, selectedIndex, open, onOpen, onClose, onSelect }: ListboxOptions) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const typed = useRef({ text: '', at: 0 });
  const last = labels.length - 1;

  const openList = useCallback(() => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    onOpen();
  }, [selectedIndex, onOpen]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { key } = event;
      if (!open) {
        if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
          event.preventDefault();
          openList();
        }
        return;
      }
      if (key === 'Tab') return onClose();
      if (key === 'ArrowDown') setActiveIndex((index) => Math.min(last, index + 1));
      else if (key === 'ArrowUp') setActiveIndex((index) => Math.max(0, index - 1));
      else if (key === 'Home') setActiveIndex(0);
      else if (key === 'End') setActiveIndex(last);
      else if (key === 'Enter' || key === ' ') {
        if (activeIndex >= 0) onSelect(activeIndex);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const now = Date.now();
        const text =
          (now - typed.current.at > TYPEAHEAD_RESET_MS ? '' : typed.current.text) + key.toLowerCase();
        typed.current = { text, at: now };
        const match = labels.findIndex((label) => label.toLowerCase().startsWith(text));
        if (match >= 0) setActiveIndex(match);
      } else return;
      event.preventDefault();
    },
    [open, openList, onClose, onSelect, activeIndex, labels, last],
  );

  return { activeIndex, setActiveIndex, openList, onKeyDown };
}
