/**
 * Type-safe localStorage helpers with JSON serialization and error handling.
 */

const PREFIX = 'rundocs:';
const OLD_PREFIX = 'swaggerx:';

/**
 * One-time migration: copy all swaggerx:* keys to rundocs:* keys.
 * Iterates by prefix so new keys are automatically picked up.
 * Call once at app bootstrap.
 */
export function migrateFromSwaggerX(): void {
  try {
    // Collect keys first to avoid index shifting during removal
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(OLD_PREFIX)) {
        keysToMigrate.push(key);
      }
    }
    for (const key of keysToMigrate) {
      const newKey = PREFIX + key.slice(OLD_PREFIX.length);
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, localStorage.getItem(key)!);
      }
      localStorage.removeItem(key);
    }
  } catch {
    // localStorage might be disabled — silently ignore
  }
}

// Run migration on module load for backwards compatibility
migrateFromSwaggerX();

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
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn(
        `[RunDocs] localStorage quota exceeded while writing "${key}". Old history entries may need to be cleared.`,
      );
    }
    // Other errors (localStorage disabled, etc.) are silently ignored
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Silently ignore
  }
}

/**
 * Generate a unique ID. Uses `crypto.randomUUID()` in secure contexts (HTTPS
 * or localhost). Falls back to a timestamp + random string for plain HTTP on
 * non-localhost origins where `crypto.randomUUID` is unavailable.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}-${Math.random().toString(36).slice(2, 10)}`;
}
