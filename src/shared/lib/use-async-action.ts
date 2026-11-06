'use client';

import { useCallback, useState } from 'react';
import { t } from '@i18n';
import { messageOf } from './error-message';

/**
 * Runs one request at a time and tracks whether it is running and why it failed.
 * `run` resolves to true on success, so callers can close a dialog or clear a form.
 */
export function useAsyncAction(fallbackMessage = t('common.errors.generic')) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (task: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await task();
        return true;
      } catch (caught) {
        setError(messageOf(caught, fallbackMessage));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [fallbackMessage],
  );

  const clearError = useCallback(() => setError(null), []);

  return { busy, error, run, clearError };
}
