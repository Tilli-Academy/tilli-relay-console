/**
 * Type-safe localStorage helpers with JSON serialization and error handling.
 */

const PREFIX = 'rundocs:';
const OLD_PREFIX = 'swaggerx:';

// One-time migration: copy swaggerx:* keys to rundocs:* keys
try {
  const keys = ['history', 'environments', 'active-env', 'ui-state'];
  for (const key of keys) {
    const oldVal = localStorage.getItem(`${OLD_PREFIX}${key}`);
    if (oldVal !== null && localStorage.getItem(`${PREFIX}${key}`) === null) {
      localStorage.setItem(`${PREFIX}${key}`, oldVal);
      localStorage.removeItem(`${OLD_PREFIX}${key}`);
    }
  }
} catch {
  // localStorage might be disabled — silently ignore
}

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
