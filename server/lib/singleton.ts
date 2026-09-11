const registry = globalThis as unknown as { __app?: Map<string, unknown> };

/** Keeps one shared instance per key, even when the dev server reloads modules. */
export function singleton<T>(key: string, create: () => T): T {
  registry.__app ??= new Map();
  if (!registry.__app.has(key)) registry.__app.set(key, create());
  return registry.__app.get(key) as T;
}
