import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage before importing the store
const storage: Record<string, string> = {};
vi.mock('../../../src/utils/local-storage.js', () => ({
  getItem: (key: string, fallback: unknown) => {
    const val = storage[`swaggerx:${key}`];
    return val ? JSON.parse(val) : fallback;
  },
  setItem: (key: string, value: unknown) => {
    storage[`swaggerx:${key}`] = JSON.stringify(value);
  },
  removeItem: (key: string) => {
    delete storage[`swaggerx:${key}`];
  },
}));

import { UIStore } from '../../../src/state/ui-store.js';

describe('UIStore', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  it('initializes with default state', () => {
    const store = new UIStore();

    expect(store.state.theme).toBe('light');
    expect(store.state.sidebarCollapsed).toBe(false);
    expect(store.state.activeSidebarPanel).toBe('endpoints');
    expect(store.state.selectedEndpointId).toBeNull();
    expect(store.state.splitRatio).toBe(0.25);
  });

  it('loads persisted state from localStorage', () => {
    storage['swaggerx:ui-state'] = JSON.stringify({
      theme: 'dark',
      sidebarCollapsed: true,
      splitRatio: 0.35,
    });

    const store = new UIStore();

    expect(store.state.theme).toBe('dark');
    expect(store.state.sidebarCollapsed).toBe(true);
    expect(store.state.splitRatio).toBe(0.35);
    // Non-persisted fields keep defaults
    expect(store.state.activeSidebarPanel).toBe('endpoints');
    expect(store.state.selectedEndpointId).toBeNull();
  });

  it('sets theme', () => {
    const store = new UIStore();
    store.setTheme('dark');

    expect(store.state.theme).toBe('dark');
  });

  it('sets system theme', () => {
    const store = new UIStore();
    store.setTheme('system');

    expect(store.state.theme).toBe('system');
  });

  it('persists theme to localStorage', () => {
    const store = new UIStore();
    store.setTheme('dark');

    const persisted = JSON.parse(storage['swaggerx:ui-state']);
    expect(persisted.theme).toBe('dark');
  });

  it('toggles sidebar', () => {
    const store = new UIStore();
    expect(store.state.sidebarCollapsed).toBe(false);

    store.toggleSidebar();
    expect(store.state.sidebarCollapsed).toBe(true);

    store.toggleSidebar();
    expect(store.state.sidebarCollapsed).toBe(false);
  });

  it('persists sidebar state to localStorage', () => {
    const store = new UIStore();
    store.toggleSidebar();

    const persisted = JSON.parse(storage['swaggerx:ui-state']);
    expect(persisted.sidebarCollapsed).toBe(true);
  });

  it('sets sidebar panel', () => {
    const store = new UIStore();
    store.setSidebarPanel('history');

    expect(store.state.activeSidebarPanel).toBe('history');
  });

  it('does not persist sidebar panel (transient state)', () => {
    const store = new UIStore();
    store.setSidebarPanel('history');

    // setSidebarPanel doesn't call _persist, so the persisted value
    // won't include activeSidebarPanel from this call
    // We check by creating a new store - it should default to 'endpoints'
    const store2 = new UIStore();
    expect(store2.state.activeSidebarPanel).toBe('endpoints');
  });

  it('selects an endpoint', () => {
    const store = new UIStore();
    store.selectEndpoint('GET:/pets');

    expect(store.state.selectedEndpointId).toBe('GET:/pets');
  });

  it('deselects an endpoint', () => {
    const store = new UIStore();
    store.selectEndpoint('GET:/pets');
    store.selectEndpoint(null);

    expect(store.state.selectedEndpointId).toBeNull();
  });

  it('sets split ratio', () => {
    const store = new UIStore();
    store.setSplitRatio(0.35);

    expect(store.state.splitRatio).toBe(0.35);
  });

  it('clamps split ratio minimum to 0.1', () => {
    const store = new UIStore();
    store.setSplitRatio(0.01);

    expect(store.state.splitRatio).toBe(0.1);
  });

  it('clamps split ratio maximum to 0.5', () => {
    const store = new UIStore();
    store.setSplitRatio(0.9);

    expect(store.state.splitRatio).toBe(0.5);
  });

  it('persists split ratio to localStorage', () => {
    const store = new UIStore();
    store.setSplitRatio(0.4);

    const persisted = JSON.parse(storage['swaggerx:ui-state']);
    expect(persisted.splitRatio).toBe(0.4);
  });

  it('notifies listeners on theme change', () => {
    const store = new UIStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.setTheme('dark');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on sidebar toggle', () => {
    const store = new UIStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.toggleSidebar();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on panel change', () => {
    const store = new UIStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.setSidebarPanel('history');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on endpoint selection', () => {
    const store = new UIStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.selectEndpoint('GET:/pets');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on split ratio change', () => {
    const store = new UIStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.setSplitRatio(0.4);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listener', () => {
    const store = new UIStore();
    const listener = vi.fn();

    const unsub = store.subscribe(listener);
    unsub();
    store.setTheme('dark');

    expect(listener).not.toHaveBeenCalled();
  });

  it('preserves immutability (state is a new object on change)', () => {
    const store = new UIStore();
    const stateBefore = store.state;

    store.setTheme('dark');
    const stateAfter = store.state;

    expect(stateBefore).not.toBe(stateAfter);
    expect(stateBefore.theme).toBe('light');
    expect(stateAfter.theme).toBe('dark');
  });
});
