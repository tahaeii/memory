'use client';

import { useState } from 'react';
import { Collapse } from './Collapse';

/** A field's validation message. It folds in and out, so the form below it never jumps. */
export function FieldError({ message }: { message?: string }) {
  // Keep the last message on screen while it folds away.
  const [last, setLast] = useState(message);
  if (message && message !== last) setLast(message);
  return (
    <Collapse open={Boolean(message)}>
      <span role='alert' className='text-danger block pt-1.5 text-[13px] leading-snug font-medium'>
        {last}
      </span>
    </Collapse>
  );
}
