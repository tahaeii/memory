import type { Ref } from 'react';
import { Spinner } from '@/shared/ui/Spinner';

interface LoadStateProps {
  /** Attach to load the next page when the end of the list scrolls into view. */
  sentinelRef?: Ref<HTMLDivElement>;
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
}

/** The end of a paged list: the scroll sentinel, a spinner while loading and the error, if any. */
export function LoadState({ sentinelRef, hasMore, loading, error }: LoadStateProps) {
  return (
    <>
      {hasMore && <div ref={sentinelRef} className='h-px' />}
      {loading && (
        <div className='text-primary animate-fade-in flex justify-center py-6'>
          <Spinner className='size-6' />
        </div>
      )}
      {error && (
        <p role='alert' className='text-danger py-4 text-center text-sm'>
          {error}
        </p>
      )}
    </>
  );
}
