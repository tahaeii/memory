import { Globe, Lock } from 'lucide-react';
import { t } from '@i18n';
import type { Visibility } from '@/entities/media';
import { cn } from '@/shared/lib/cn';

interface AudiencePickerProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  /** Whether private items are shared with friends (by passcode) or kept for admins. */
  friendsEnabled: boolean;
}

/** Two cards for choosing who sees what is about to be uploaded. */
export function AudiencePicker({ value, onChange, friendsEnabled }: AudiencePickerProps) {
  const audiences = [
    {
      value: 'public' as const,
      title: t('upload.audience.everyone'),
      hint: t('upload.audience.everyoneHint'),
      icon: Globe,
    },
    friendsEnabled
      ? {
          value: 'private' as const,
          title: t('upload.audience.friends'),
          hint: t('upload.audience.friendsHint'),
          icon: Lock,
        }
      : {
          value: 'private' as const,
          title: t('upload.audience.admins'),
          hint: t('upload.audience.adminsHint'),
          icon: Lock,
        },
  ];
  return (
    <div className='grid grid-cols-2 gap-2'>
      {audiences.map((audience) => {
        const selected = value === audience.value;
        return (
          <button
            key={audience.value}
            type='button'
            onClick={() => onChange(audience.value)}
            aria-pressed={selected}
            className={cn(
              'focus-visible:outline-primary flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-[border-color,background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2',
              selected
                ? 'border-primary bg-primary-soft'
                : 'border-line bg-surface hover:border-line-strong hover:shadow-card',
            )}>
            <audience.icon
              aria-hidden
              className={cn('size-[18px] transition-colors', selected ? 'text-link' : 'text-muted')}
            />
            <span className='text-sm font-semibold'>{audience.title}</span>
            <span className='text-muted text-xs'>{audience.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
