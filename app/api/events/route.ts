import type { NextRequest } from 'next/server';
import { eventInputSchema } from '@contracts/schemas/event';
import { createEvent } from '@server/events/event.service';
import { handle, json, readBody, requireStaff } from '@server/http/api';

export const dynamic = 'force-dynamic';

/** Create an event (staff). */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    return json(await createEvent(await readBody(req, eventInputSchema), viewer), 201);
  });
}
