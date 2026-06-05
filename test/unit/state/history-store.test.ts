import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage before importing the store
const storage: Record<string, string> = {};
vi.mock('../../../src/utils/local-storage.js', () => ({
  getItem: (key: string, fallback: unknown) => {
    const val = storage[`rundocs:${key}`];
    return val ? JSON.parse(val) : fallback;
  },
  setItem: (key: string, value: unknown) => {
    storage[`rundocs:${key}`] = JSON.stringify(value);
  },
  removeItem: (key: string) => {
    delete storage[`rundocs:${key}`];
  },
}));

import { HistoryStore } from '../../../src/state/history-store.js';

function makeEntry(overrides: Partial<{ endpointId: string; method: string; url: string }> = {}) {
  return {
    endpointId: overrides.endpointId ?? 'GET:/pets',
    method: (overrides.method ?? 'get') as 'get',
    url: overrides.url ?? 'https://api.example.com/pets',
    headers: { 'Content-Type': 'application/json' },
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: '[]',
      contentType: 'application/json',
      time: 100,
      size: 2,
    },
  };
}

describe('HistoryStore', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  it('initializes with empty entries', () => {
    const store = new HistoryStore();
    expect(store.entries).toEqual([]);
  });

  it('adds an entry', () => {
    const store = new HistoryStore();
    store.add(makeEntry());

    expect(store.entries).toHaveLength(1);
    expect(store.entries[0].endpointId).toBe('GET:/pets');
    expect(store.entries[0].method).toBe('get');
    expect(store.entries[0].url).toBe('https://api.example.com/pets');
    expect(store.entries[0].id).toBeDefined();
    expect(store.entries[0].timestamp).toBeDefined();
  });

  it('prepends new entries (most recent first)', () => {
    const store = new HistoryStore();
    store.add(makeEntry({ url: 'https://api.example.com/first' }));
    store.add(makeEntry({ url: 'https://api.example.com/second' }));

    expect(store.entries[0].url).toBe('https://api.example.com/second');
    expect(store.entries[1].url).toBe('https://api.example.com/first');
  });

  it('removes an entry by id', () => {
    const store = new HistoryStore();
    store.add(makeEntry());
    const id = store.entries[0].id;

    store.remove(id);
    expect(store.entries).toHaveLength(0);
  });

  it('clears all entries', () => {
    const store = new HistoryStore();
    store.add(makeEntry());
    store.add(makeEntry());

    store.clear();
    expect(store.entries).toHaveLength(0);
  });

  it('filters entries by endpoint id', () => {
    const store = new HistoryStore();
    store.add(makeEntry({ endpointId: 'GET:/pets' }));
    store.add(makeEntry({ endpointId: 'POST:/pets' }));
    store.add(makeEntry({ endpointId: 'GET:/pets' }));

    const petGets = store.getByEndpoint('GET:/pets');
    expect(petGets).toHaveLength(2);

    const petPosts = store.getByEndpoint('POST:/pets');
    expect(petPosts).toHaveLength(1);
  });

  it('evicts oldest entries when exceeding max (100)', () => {
    const store = new HistoryStore();

    for (let i = 0; i < 105; i++) {
      store.add(makeEntry({ url: `https://api.example.com/${i}` }));
    }

    expect(store.entries).toHaveLength(100);
    // Most recent should be the last added
    expect(store.entries[0].url).toBe('https://api.example.com/104');
  });

  it('persists entries to localStorage', () => {
    const store = new HistoryStore();
    store.add(makeEntry());

    expect(storage['rundocs:history']).toBeDefined();
    const persisted = JSON.parse(storage['rundocs:history']);
    expect(persisted).toHaveLength(1);
  });

  it('loads entries from localStorage on construction', () => {
    // Pre-populate storage
    storage['rundocs:history'] = JSON.stringify([
      {
        id: 'test-1',
        timestamp: Date.now(),
        endpointId: 'GET:/pets',
        method: 'get',
        url: 'https://api.example.com/pets',
        request: { headers: {}, body: '' },
        response: {
          status: 200,
          statusText: 'OK',
          headers: {},
          body: '[]',
          contentType: 'application/json',
          time: 50,
          size: 2,
        },
      },
    ]);

    const store = new HistoryStore();
    expect(store.entries).toHaveLength(1);
    expect(store.entries[0].id).toBe('test-1');
  });

  it('notifies listeners on add', () => {
    const store = new HistoryStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.add(makeEntry());

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on remove', () => {
    const store = new HistoryStore();
    store.add(makeEntry());
    const id = store.entries[0].id;

    const listener = vi.fn();
    store.subscribe(listener);
    store.remove(id);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on clear', () => {
    const store = new HistoryStore();
    store.add(makeEntry());

    const listener = vi.fn();
    store.subscribe(listener);
    store.clear();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listener', () => {
    const store = new HistoryStore();
    const listener = vi.fn();

    const unsub = store.subscribe(listener);
    unsub();
    store.add(makeEntry());

    expect(listener).not.toHaveBeenCalled();
  });

  it('stores request and response data in the entry', () => {
    const store = new HistoryStore();
    store.add(makeEntry());

    const entry = store.entries[0];
    expect(entry.request.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(entry.request.body).toBe('');
    expect(entry.response.status).toBe(200);
    expect(entry.response.statusText).toBe('OK');
    expect(entry.response.time).toBe(100);
    expect(entry.response.size).toBe(2);
  });
});
