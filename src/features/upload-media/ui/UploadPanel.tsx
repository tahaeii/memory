'use client';

import { useState, type DragEvent } from 'react';
import { Check, Globe, Image as ImageIcon, Lock, Upload, Video, X } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { Visibility } from '@/entities/media';
import { useSite } from '@/shared/config/site-context';
import { cn } from '@/shared/lib/cn';
import { formatBytes } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Select } from '@/shared/ui/select';
import { useUploadQueue } from '../model/use-upload-queue';

interface UploadPanelProps {
  events: EventDto[];
  /** Staff without private access can only add public items. */
  privateAccess: boolean;
  onFinished: () => void;
}

const ACCEPT = 'image/*,video/*,.heic,.heif,.mkv,.avi,.wmv,.flv,.3gp,.mts,.m2ts';
const FORMATS = [
  'JPEG',
  'PNG',
  'HEIC',
  'WebP',
  'AVIF',
  'GIF',
  'TIFF',
  'MP4',
  'MOV',
  'WebM',
  'MKV',
  'AVI',
  'WMV',
  '3GP',
  'MPEG',
];

function audiences(
  friends: boolean,
): Array<{ value: Visibility; title: string; hint: string; icon: typeof Globe }> {
  return [
    { value: 'public', title: 'Everyone', hint: 'Every visitor', icon: Globe },
    friends
      ? { value: 'private', title: 'Friends only', hint: 'With the passcode', icon: Lock }
      : { value: 'private', title: 'Admins only', hint: 'With private access', icon: Lock },
  ];
}

/** Drag & drop (or click) uploader with per-file progress. */
export function UploadPanel({ events, privateAccess, onFinished }: UploadPanelProps) {
  const site = useSite();
  const [chosen, setChosen] = useState<Visibility>('public');
  const [eventId, setEventId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const visibility: Visibility = privateAccess ? chosen : 'public';
  const queue = useUploadQueue({ visibility, eventId: eventId || null }, onFinished);
  const done = queue.items.filter((item) => item.status === 'done').length;

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    queue.addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div className='grid gap-5 xl:grid-cols-[300px_1fr]'>
      <div className='border-line-soft bg-canvas space-y-5 self-start rounded-2xl border p-5'>
        <fieldset>
          <legend className='text-sm font-semibold'>Who can see these?</legend>
          {privateAccess ? (
            <div className='mt-2.5 grid grid-cols-2 gap-2'>
              {audiences(site.friendsEnabled).map((audience) => {
                const selected = visibility === audience.value;
                return (
                  <button
                    key={audience.value}
                    type='button'
                    onClick={() => setChosen(audience.value)}
                    aria-pressed={selected}
                    className={cn(
                      'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition',
                      selected
                        ? 'border-primary bg-primary-soft'
                        : 'border-line bg-surface hover:border-line-strong',
                    )}>
                    <audience.icon className={cn('size-[18px]', selected ? 'text-link' : 'text-muted')} />
                    <span className='text-sm font-semibold'>{audience.title}</span>
                    <span className='text-muted text-xs'>{audience.hint}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className='text-muted mt-1.5 text-sm'>Everyone. Your account adds public items only.</p>
          )}
        </fieldset>
        <Field label='Add to event' as='group'>
          <Select
            label='Add to event'
            value={eventId}
            onChange={setEventId}
            options={[
              { value: '', label: 'No event' },
              ...events.map((event) => ({ value: event.id, label: event.title })),
            ]}
          />
        </Field>
        <p className='border-line text-muted border-t pt-4 text-xs leading-relaxed'>
          Originals are kept untouched. Location data is removed from the web copies.
        </p>
      </div>

      <div className='min-w-0 space-y-5'>
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'focus-within:border-primary flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition',
            dragOver
              ? 'border-primary bg-primary-soft'
              : 'border-line-strong hover:border-primary hover:bg-primary-soft/60',
          )}>
          <input
            type='file'
            multiple
            accept={ACCEPT}
            className='sr-only'
            onChange={(event) => {
              queue.addFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <span className='bg-primary text-on-primary shadow-primary/30 grid size-14 place-items-center rounded-2xl shadow-lg'>
            <Upload className='size-6' />
          </span>
          <span className='font-display mt-5 text-lg font-semibold'>Drop photos and videos here</span>
          <span className='text-muted mt-1 text-sm'>
            or <span className='text-link font-semibold'>browse your files</span>
          </span>
          <span className='mt-5 flex max-w-lg flex-wrap justify-center gap-1.5'>
            {FORMATS.map((format) => (
              <span
                key={format}
                className='border-line-soft bg-surface text-muted rounded-md border px-2 py-0.5 text-[11px] font-medium'>
                {format}
              </span>
            ))}
          </span>
        </label>

        {queue.items.length > 0 && (
          <div className='border-line-soft overflow-hidden rounded-2xl border'>
            <div className='flex items-center justify-between px-4 py-3'>
              <h3 className='text-sm font-semibold'>
                Uploads{' '}
                <span className='text-muted font-normal'>
                  · {done} of {queue.items.length} done
                </span>
              </h3>
              <Button variant='ghost' size='sm' onClick={queue.clearFinished}>
                Clear finished
              </Button>
            </div>
            <ul className='divide-line-soft border-line-soft divide-y border-t'>
              {queue.items.map((item) => {
                const isVideo = item.kind === 'video' || item.file.type.startsWith('video/');
                return (
                  <li key={item.id} className='px-4 py-3'>
                    <div className='flex items-center justify-between gap-3 text-sm'>
                      <span className='flex min-w-0 items-center gap-2.5'>
                        <span className='bg-subtle text-muted grid size-8 shrink-0 place-items-center rounded-lg'>
                          {isVideo ? <Video className='size-4' /> : <ImageIcon className='size-4' />}
                        </span>
                        <span className='truncate font-medium'>{item.file.name}</span>
                      </span>
                      <span className='text-muted flex shrink-0 items-center gap-2 text-xs'>
                        {formatBytes(item.file.size)}
                        {item.status === 'uploading' && (
                          <span className='text-link font-semibold'>{Math.round(item.progress * 100)}%</span>
                        )}
                        {item.status === 'done' && <Check className='text-success size-4' />}
                        {item.status === 'error' && <X className='text-danger size-4' />}
                      </span>
                    </div>
                    {item.status === 'error' ? (
                      <p className='text-danger mt-1.5 text-xs'>{item.error}</p>
                    ) : (
                      <div className='bg-subtle mt-2.5 h-1.5 overflow-hidden rounded-full'>
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.status === 'done' ? 'bg-success' : 'bg-primary',
                          )}
                          style={{ width: Math.round(item.progress * 100) + '%' }}
                        />
                      </div>
                    )}
                    {item.status === 'done' && item.kind === 'video' && (
                      <p className='text-muted mt-1.5 text-xs'>
                        Uploaded. The server is converting it for the web; it shows up in the gallery when
                        ready.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
