/** The message of a thrown error, or `fallback` when something that is not an Error was thrown. */
export function messageOf(caught: unknown, fallback = 'Something went wrong.'): string {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
