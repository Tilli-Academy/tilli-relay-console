import type { RunDocsSpec } from '../core/types.js';
import { parseSpec } from '../core/parser.js';
import { normalize } from '../core/normalizer.js';

/**
 * Manages the parsed OpenAPI spec state.
 * Loads, parses, and normalizes the spec, then notifies listeners.
 */
export class SpecStore {
  private _spec: RunDocsSpec | null = null;
  private _loading = false;
  private _error: string | null = null;
  private _listeners = new Set<() => void>();

  get spec(): RunDocsSpec | null {
    return this._spec;
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): string | null {
    return this._error;
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

  async loadSpec(specUrlOrContent: string): Promise<void> {
    this._loading = true;
    this._error = null;
    this._notify();

    try {
      const doc = await parseSpec(specUrlOrContent);
      this._spec = normalize(doc);
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Failed to load spec';
      this._spec = null;
    } finally {
      this._loading = false;
      this._notify();
    }
  }

  reset(): void {
    this._spec = null;
    this._loading = false;
    this._error = null;
    this._notify();
  }
}
