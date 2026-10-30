export const dynamic = 'force-dynamic';

/** For load balancers and container health checks: answers as soon as the server accepts requests. */
export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
