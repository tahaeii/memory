import { cn } from '@/shared/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** On/off toggle. `label` is read by screen readers. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-visible:outline-primary relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-line-strong',
      )}>
      <span
        aria-hidden
        className={cn(
          'bg-surface size-5 rounded-full shadow-sm transition-transform',
          checked ? 'translate-x-5.5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
