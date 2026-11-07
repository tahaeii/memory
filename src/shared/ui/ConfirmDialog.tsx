'use client';

import type { ReactNode } from 'react';
import { t } from '@i18n';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before a destructive action. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = t('common.actions.delete'),
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      {children && <div className='text-muted mt-2 text-sm leading-relaxed'>{children}</div>}
      <div className='mt-6 flex justify-end gap-2'>
        <Button variant='ghost' onClick={onCancel} disabled={loading}>
          {t('common.actions.cancel')}
        </Button>
        <Button variant='danger' loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
