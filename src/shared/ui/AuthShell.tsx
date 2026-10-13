import type { ReactNode } from 'react';

interface AuthShellProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Centered card layout shared by the unlock, setup and admin sign-in pages. */
export function AuthShell({ icon, title, subtitle, children }: AuthShellProps) {
  return (
    <section className='relative isolate overflow-hidden'>
      <div aria-hidden className='pattern-grid absolute inset-x-0 top-0 -z-10 h-120' />
      <div
        aria-hidden
        className='bg-primary/20 absolute top-10 left-1/2 -z-10 size-105 -translate-x-1/2 rounded-full blur-[120px]'
      />
      <div className='mx-auto max-w-md px-4 py-16 sm:py-24'>
        <div className='animate-enter border-line bg-surface shadow-card rounded-3xl border p-8'>
          <span className='bg-primary-soft text-link grid size-12 place-items-center rounded-2xl'>
            {icon}
          </span>
          <h1 className='font-display mt-5 text-2xl font-semibold tracking-tight'>{title}</h1>
          <p className='text-muted mt-1.5 text-sm'>{subtitle}</p>
          <div className='mt-6'>{children}</div>
        </div>
      </div>
    </section>
  );
}
