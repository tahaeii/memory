'use client';

import { useState, type DragEvent } from 'react';
import { ArrowUpFromLine } from 'lucide-react';
import { t } from '@i18n';
import { rich } from '@i18n/rich';
import { cn } from '@/shared/lib/cn';
import { ACCEPTED_FILES, PHOTO_FORMATS, VIDEO_FORMATS } from '../config/formats';

/** Where files are dropped or chosen. Framed like a viewfinder; the marks close in while dragging. */
export function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'group bg-canvas relative block cursor-pointer rounded-xl p-2 transition-colors',
        'focus-within:outline-primary focus-within:outline-2 focus-within:outline-offset-2',
        dragOver ? 'bg-primary-soft' : 'hover:bg-subtle/70',
      )}>
      <input
        type='file'
        multiple
        accept={ACCEPTED_FILES}
        className='sr-only'
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <span
        className={cn(
          'frame-marks flex flex-col items-center px-5 py-12 text-center transition-[margin,color] duration-300 ease-out sm:py-14',
          dragOver ? 'text-primary m-3' : 'text-line-strong group-hover:text-muted m-0 group-hover:m-1.5',
        )}>
        <ArrowUpFromLine
          aria-hidden
          strokeWidth={1.5}
          className={cn(
            'size-8 transition-[translate,color] duration-300 ease-out',
            dragOver ? 'text-primary -translate-y-1' : 'text-muted group-hover:-translate-y-0.5',
          )}
        />
        <span className='type-heading text-fg mt-4'>
          {dragOver ? t('upload.drop.over') : t('upload.drop.idle')}
        </span>
        <span className='text-muted mt-1 text-sm'>
          {rich('upload.drop.browse', {
            a: (text) => <span className='text-link font-semibold'>{text}</span>,
          })}
        </span>
        <span className='text-muted mt-6 max-w-md text-xs leading-relaxed text-pretty'>
          <span className='block'>{PHOTO_FORMATS.join(', ')}</span>
          <span className='block'>{VIDEO_FORMATS.join(', ')}</span>
        </span>
      </span>
    </label>
  );
}
