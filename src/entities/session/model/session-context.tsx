'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SessionDto } from '@contracts/session';

const SessionContext = createContext<SessionDto>({ role: 'guest', username: null, privateAccess: false });

/** Makes the visitor's session available to client components. */
export function SessionProvider({ session, children }: { session: SessionDto; children: ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionDto {
  return useContext(SessionContext);
}
