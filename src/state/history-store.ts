import type { AuthConfig, HistoryEntry, HttpMethod, ResponseState } from '../core/types.js';
import { getItem, setItem } from '../utils/local-storage.js';

const STORAGE_KEY = 'history';
const MAX_ENTRIES = 100;

/**
 * Manages request history, backed by localStorage.
 * Append-only with FIFO eviction at MAX_ENTRIES.
 */
export class HistoryStore {
  private _entries: HistoryEntry[];
  private _listeners = new Set<() => void>();

  constructor() {
    this._entries = getItem<HistoryEntry[]>(STORAGE_KEY, []);
  }

  get entries(): HistoryEntry[] {
    return this._entries;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }

  private _persist(): void {
    setItem(STORAGE_KEY, this._entries.map(redactEntry));
  }

  add(entry: {
    endpointId: string;
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body: string;
    auth?: AuthConfig;
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
    response: ResponseState;
  }): void {
    const historyEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      endpointId: entry.endpointId,
      method: entry.method,
      url: entry.url,
      request: {
        headers: entry.headers,
        body: entry.body,
        auth: entry.auth,
        pathParams: entry.pathParams,
        queryParams: entry.queryParams,
      },
      response: entry.response,
    };

    this._entries = [historyEntry, ...this._entries].slice(0, MAX_ENTRIES);
    this._persist();
    this._notify();
  }

  remove(id: string): void {
    this._entries = this._entries.filter((e) => e.id !== id);
    this._persist();
    this._notify();
  }

  clear(): void {
    this._entries = [];
    this._persist();
    this._notify();
  }

  getByEndpoint(endpointId: string): HistoryEntry[] {
    return this._entries.filter((e) => e.endpointId === endpointId);
  }
}

/** Sensitive header names that should not be persisted to localStorage. */
const SENSITIVE_HEADERS = ['authorization', 'proxy-authorization', 'cookie', 'set-cookie'];

/** Strip auth secrets and sensitive headers before writing to localStorage. */
function redactEntry(entry: HistoryEntry): HistoryEntry {
  // Redact auth — keep the type so history shows what kind of auth was used
  let redactedAuth: AuthConfig | undefined;
  if (entry.request.auth) {
    redactedAuth = { type: entry.request.auth.type };
    if (entry.request.auth.apiKeyName) {
      redactedAuth.apiKeyName = entry.request.auth.apiKeyName;
    }
    if (entry.request.auth.apiKeyIn) {
      redactedAuth.apiKeyIn = entry.request.auth.apiKeyIn;
    }
  }

  // Strip sensitive headers (Authorization, Cookie, etc.)
  const redactedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(entry.request.headers)) {
    if (!SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      redactedHeaders[key] = value;
    }
  }

  return {
    ...entry,
    request: {
      ...entry.request,
      headers: redactedHeaders,
      auth: redactedAuth,
    },
  };
}
