import { Check, Image as ImageIcon, Video, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatBytes } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import type { UploadItem } from '../model/use-upload-queue';

function UploadRow({ item }: { item: UploadItem }) {
  const isVideo = item.kind === 'video' || item.file.type.startsWith('video/');
  const percent = Math.round(item.progress * 100);
  return (
    <li className='animate-rise-in px-4 py-3'>
      <div className='flex items-center justify-between gap-3 text-sm'>
        <span className='flex min-w-0 items-center gap-2.5'>
          <span className='bg-subtle text-muted grid size-8 shrink-0 place-items-center rounded-md'>
            {isVideo ? <Video className='size-4' /> : <ImageIcon className='size-4' />}
          </span>
          <span className='truncate font-medium'>{item.file.name}</span>
        </span>
        <span className='text-muted flex shrink-0 items-center gap-2 text-xs tabular-nums'>
          {formatBytes(item.file.size)}
          {item.status === 'uploading' && <span className='text-link font-semibold'>{percent}%</span>}
          {item.status === 'done' && <Check className='text-success animate-check size-4' />}
          {item.status === 'error' && <X className='text-danger size-4' />}
        </span>
      </div>
      {item.status === 'error' ? (
        <p className='text-danger mt-1.5 text-xs'>{item.error}</p>
      ) : (
        <div
          role='progressbar'
          aria-label={'Upload of ' + item.file.name}
          aria-valuenow={percent}
          className='bg-subtle mt-2.5 h-1 overflow-hidden rounded-full'>
          <div
            className={cn(
              'h-full origin-left rounded-full transition-[scale,background-color] duration-300',
              item.status === 'done' ? 'bg-success' : 'bg-primary',
            )}
            style={{ scale: item.progress + ' 1' }}
          />
        </div>
      )}
      {item.status === 'done' && item.kind === 'video' && (
        <p className='text-muted mt-1.5 text-xs text-pretty'>
          Uploaded. The server is converting it for the web; it shows up in the gallery when ready.
        </p>
      )}
    </li>
  );
}

interface UploadListProps {
  items: UploadItem[];
  onClearFinished: () => void;
}

/** Every file of this visit with its progress. */
export function UploadList({ items, onClearFinished }: UploadListProps) {
  const done = items.filter((item) => item.status === 'done').length;
  return (
    <div className='border-line-soft overflow-hidden rounded-xl border'>
      <div className='flex items-center justify-between py-2 pr-2 pl-4'>
        <h3 className='text-sm font-semibold'>
          Uploads{' '}
          <span className='text-muted font-normal tabular-nums'>
            · {done} of {items.length} done
          </span>
        </h3>
        <Button variant='ghost' size='sm' onClick={onClearFinished}>
          Clear finished
        </Button>
      </div>
      <ul className='divide-line-soft border-line-soft divide-y border-t'>
        {items.map((item) => (
          <UploadRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
