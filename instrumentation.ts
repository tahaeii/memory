/** Next.js calls this once when a server instance starts. */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { startServer } = await import('@server/startup');
    await startServer();
  }
}
