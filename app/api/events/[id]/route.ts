import type { NextRequest } from 'next/server';
import { t } from '@i18n';
import { eventPatchSchema } from '@contracts/schemas/event';
import { deleteEvent, updateEvent } from '@server/events/event.service';
import { handle, json, readBody, requireStaff } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { ID_PATTERN } from '@server/lib/ids';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

async function eventId(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!ID_PATTERN.test(id)) throw new HttpError(404, t('errors.events.notFound'));
  return id;
}

export async function PATCH(req: NextRequest, context: Context) {
  return handle(async () => {
    await requireStaff(req);
    await updateEvent(await eventId(context), await readBody(req, eventPatchSchema));
    return json({ ok: true });
  });
}

export async function DELETE(req: NextRequest, context: Context) {
  return handle(async () => {
    await requireStaff(req);
    await deleteEvent(await eventId(context));
    return json({ ok: true });
  });
}
