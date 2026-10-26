'use client';

import type { ReactNode } from 'react';
import { useSite } from '@/shared/config/site-context';
import { Backdrop } from './Backdrop';
import { LogoMark } from './Logo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Centred card under the organisation's logo, shared by the unlock, setup and sign-in pages. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const site = useSite();
  return (
    <section className='relative isolate'>
      <Backdrop className='h-[32rem]' />
      <div className='mx-auto w-full max-w-md px-4 py-12 sm:py-20'>
        <LogoMark src={site.logoUrl} className='size-11 rounded-xl' />
        <h1 className='type-title mt-6'>{title}</h1>
        <p className='text-muted mt-2 text-pretty'>{subtitle}</p>
        <div className='border-line bg-surface shadow-raised mt-8 rounded-2xl border p-5 sm:p-7'>
          {children}
        </div>
      </div>
    </section>
  );
}
