import { Pencil, Trash2 } from 'lucide-react';
import { t } from '@i18n';
import type { EventDto } from '@/entities/event';
import { cn } from '@/shared/lib/cn';
import { formatMediaCount, formatShortDate } from '@/shared/lib/format';
import { IconButton } from '@/shared/ui/IconButton';

interface EventRowProps {
  event: EventDto;
  /** True while this event is open in the form. */
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventRow({ event, editing, onEdit, onDelete }: EventRowProps) {
  return (
    <li
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-300 sm:px-5',
        editing && 'bg-primary-soft',
      )}>
      <div className='min-w-0'>
        <p className='text-fg truncate font-medium'>{event.title}</p>
        <p className='text-muted text-sm'>
          {t('events.manage.summary', {
            date: formatShortDate(event.date),
            count: formatMediaCount(event.photoCount, event.videoCount),
          })}
        </p>
      </div>
      <div className='flex shrink-0 gap-0.5'>
        <IconButton size='sm' label={t('events.manage.edit', { title: event.title })} onClick={onEdit}>
          <Pencil className='size-4' />
        </IconButton>
        <IconButton size='sm' label={t('events.manage.delete', { title: event.title })} onClick={onDelete}>
          <Trash2 className='size-4' />
        </IconButton>
      </div>
    </li>
  );
}
