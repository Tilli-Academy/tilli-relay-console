/**
 * Type-safe localStorage helpers with JSON serialization and error handling.
 */

const PREFIX = 'swaggerx:';

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // localStorage might be full or disabled — silently ignore
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Silently ignore
  }
}
