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
        'group focus-visible:outline-primary relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-faint',
      )}>
      <span
        aria-hidden
        className={cn(
          'ease-spring size-5 rounded-full shadow-sm transition-[translate,width,background-color] duration-300 group-active:w-6',
          // On a light fill (a pale or white brand colour) a white knob would disappear.
          checked ? 'bg-on-primary translate-x-5.5 group-active:translate-x-4.5' : 'translate-x-0.5 bg-white',
        )}
      />
    </button>
  );
}
