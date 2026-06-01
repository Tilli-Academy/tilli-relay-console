import type { UIState } from '../core/types.js';
import { getItem, setItem } from '../utils/local-storage.js';

const STORAGE_KEY = 'ui-state';

const DEFAULT_STATE: UIState = {
  theme: 'light',
  sidebarCollapsed: false,
  activeSidebarPanel: 'endpoints',
  selectedEndpointId: null,
  selectedHistoryId: null,
  splitRatio: 0.25,
};

/**
 * Manages global UI state (theme, sidebar, selected endpoint).
 * Persists theme preference to localStorage.
 */
export class UIStore {
  private _state: UIState;
  private _listeners = new Set<() => void>();

  constructor() {
    const persisted = getItem<Partial<UIState>>(STORAGE_KEY, {});
    this._state = { ...DEFAULT_STATE, ...persisted };
  }

  get state(): UIState {
    return this._state;
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
    setItem(STORAGE_KEY, {
      theme: this._state.theme,
      sidebarCollapsed: this._state.sidebarCollapsed,
      splitRatio: this._state.splitRatio,
    });
  }

  setTheme(theme: UIState['theme']): void {
    this._state = { ...this._state, theme };
    this._persist();
    this._notify();
  }

  toggleSidebar(): void {
    this._state = { ...this._state, sidebarCollapsed: !this._state.sidebarCollapsed };
    this._persist();
    this._notify();
  }

  setSidebarPanel(panel: UIState['activeSidebarPanel']): void {
    this._state = { ...this._state, activeSidebarPanel: panel };
    this._notify();
  }

  selectEndpoint(endpointId: string | null): void {
    this._state = { ...this._state, selectedEndpointId: endpointId, selectedHistoryId: null };
    this._notify();
  }

  selectHistoryEntry(historyId: string | null): void {
    this._state = { ...this._state, selectedHistoryId: historyId };
    this._notify();
  }

  setSplitRatio(ratio: number): void {
    this._state = { ...this._state, splitRatio: Math.max(0.1, Math.min(0.5, ratio)) };
    this._persist();
    this._notify();
  }
}
