import { apiFetch } from '@/shared/api/http';
import type { SessionDto } from '@contracts/session';

export function unlockPrivate(passcode: string): Promise<SessionDto> {
  return apiFetch<SessionDto>('/auth/unlock', { method: 'POST', json: { passcode } });
}
