import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { SessionDto } from '@contracts/session';
import { resolveViewer, SESSION_COOKIE } from '@server/auth/session';
import { toSessionDto, type Viewer } from '@server/auth/viewer';

/** The current visitor, resolved once per request from the session cookie. */
export const getServerViewer = cache(async (): Promise<Viewer> => {
  const store = await cookies();
  return resolveViewer(store.get(SESSION_COOKIE)?.value);
});

/** What the browser may know about the current visitor. */
export async function getServerSession(): Promise<SessionDto> {
  return toSessionDto(await getServerViewer());
}
