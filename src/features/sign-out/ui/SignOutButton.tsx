'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { apiFetch } from '@/shared/api/http';
import { Button } from '@/shared/ui/Button';

/** Ends the current session (friend or admin). */
export function SignOutButton({ label = 'Sign out' }: { label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
      setPending(false);
    }
  }

  return (
    <Button variant='ghost' size='sm' onClick={signOut} loading={pending} aria-label={label}>
      <LogOut className='size-4' />
      <span className='hidden sm:inline'>{label}</span>
    </Button>
  );
}
