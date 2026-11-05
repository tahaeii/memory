'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { z } from 'zod';
import { messageOf } from '../error-message';

export type FieldErrors<V> = Partial<Record<keyof V, string>>;

/** The first message per field for values that do not pass `schema`; empty when they do. */
export function fieldErrors<V extends Record<string, unknown>>(
  schema: z.ZodType<unknown, V>,
  values: V,
): FieldErrors<V> {
  const result = schema.safeParse(values);
  const errors: FieldErrors<V> = {};
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof V | undefined;
    if (field !== undefined && errors[field] === undefined) errors[field] = issue.message;
  }
  return errors;
}

interface FormOptions<V extends Record<string, unknown>, O> {
  /** Says what valid input is and words the messages. The same schemas guard the API. */
  schema: z.ZodType<O, V>;
  initial: V;
  /**
   * Called with the parsed values once they are valid. Throw to show a message above the button.
   * Return `'leaving'` when the page is about to change, so the button keeps its spinner until then.
   */
  onSubmit: (data: O) => Promise<void | 'leaving'>;
}

/**
 * State of a form that validates with zod. The submit button stays enabled: pressing it with
 * something missing shows what is wrong under each field and moves the cursor to the first one.
 * After that a field is checked again as it is typed in, so its message leaves as soon as it can.
 */
export function useForm<V extends Record<string, unknown>, O>({
  schema,
  initial,
  onSubmit,
}: FormOptions<V, O>) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<V>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof V>(name: K, value: V[K]) => {
    const next = { ...values, [name]: value };
    setValues(next);
    const shown = Object.keys(errors) as Array<keyof V>;
    if (shown.length === 0) return;
    // Only fields that already show a message are re-checked: typing never makes a new one appear.
    const fresh = fieldErrors(schema, next);
    setErrors(
      Object.fromEntries(shown.filter((key) => fresh[key]).map((key) => [key, fresh[key]])) as FieldErrors<V>,
    );
  };

  /** Leaving a field that was filled in checks it. An empty one is not an error until submit. */
  const blur = (name: keyof V) => {
    if (values[name] === '') return;
    const message = fieldErrors(schema, values)[name];
    if (message === errors[name]) return;
    const next = { ...errors };
    if (message) next[name] = message;
    else delete next[name];
    setErrors(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const result = schema.safeParse(values);
    if (!result.success) {
      const found = fieldErrors(schema, values);
      setErrors(found);
      const first = Object.keys(values).find((name) => found[name]);
      const control = first ? form.elements.namedItem(first) : null;
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    setErrors({});
    setError(null);
    setPending(true);
    let leaving = false;
    try {
      leaving = (await onSubmit(result.data)) === 'leaving';
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      if (!leaving) setPending(false);
    }
  };

  /** Props for a text input or textarea bound to `name`. */
  const field = (name: keyof V & string) => ({
    name,
    value: values[name] as string,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(name, event.target.value as V[typeof name]),
    onBlur: () => blur(name),
    'aria-invalid': errors[name] !== undefined || undefined,
  });

  return {
    values,
    errors,
    /** What the server answered when the request failed. */
    error,
    pending,
    set,
    field,
    submit,
    reset: (next: V = initial) => {
      setValues(next);
      setErrors({});
      setError(null);
    },
  };
}
