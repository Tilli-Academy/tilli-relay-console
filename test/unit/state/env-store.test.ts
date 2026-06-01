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

import { EnvStore } from '../../../src/state/env-store.js';

describe('EnvStore', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  it('initializes with empty environments', () => {
    const store = new EnvStore();
    expect(store.environments).toEqual([]);
    expect(store.activeId).toBeNull();
    expect(store.activeEnvironment).toBeNull();
    expect(store.activeVariables).toEqual({});
  });

  it('adds an environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');

    expect(store.environments).toHaveLength(1);
    expect(env.name).toBe('Production');
    expect(env.id).toBeDefined();
    expect(env.variables).toEqual({});
  });

  it('adds an environment with initial variables', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Staging', { baseUrl: 'https://staging.example.com' });

    expect(env.variables).toEqual({ baseUrl: 'https://staging.example.com' });
  });

  it('sets an active environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production', { apiKey: 'abc123' });

    store.setActive(env.id);

    expect(store.activeId).toBe(env.id);
    expect(store.activeEnvironment).toEqual(env);
    expect(store.activeVariables).toEqual({ apiKey: 'abc123' });
  });

  it('returns null active environment when none is set', () => {
    const store = new EnvStore();
    store.addEnvironment('Production');

    expect(store.activeEnvironment).toBeNull();
    expect(store.activeVariables).toEqual({});
  });

  it('clears active environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    store.setActive(env.id);
    store.setActive(null);

    expect(store.activeId).toBeNull();
    expect(store.activeEnvironment).toBeNull();
  });

  it('updates environment name', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');

    store.updateEnvironment(env.id, { name: 'Prod' });

    expect(store.environments[0].name).toBe('Prod');
  });

  it('updates environment variables', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production', { apiKey: 'old' });

    store.updateEnvironment(env.id, { variables: { apiKey: 'new', baseUrl: 'https://prod.com' } });

    expect(store.environments[0].variables).toEqual({ apiKey: 'new', baseUrl: 'https://prod.com' });
  });

  it('removes an environment', () => {
    const store = new EnvStore();
    const env1 = store.addEnvironment('Production');
    store.addEnvironment('Staging');

    store.removeEnvironment(env1.id);

    expect(store.environments).toHaveLength(1);
    expect(store.environments[0].name).toBe('Staging');
  });

  it('clears active id when removing active environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    store.setActive(env.id);

    store.removeEnvironment(env.id);

    expect(store.activeId).toBeNull();
  });

  it('does not clear active id when removing a different environment', () => {
    const store = new EnvStore();
    const env1 = store.addEnvironment('Production');
    const env2 = store.addEnvironment('Staging');
    store.setActive(env1.id);

    store.removeEnvironment(env2.id);

    expect(store.activeId).toBe(env1.id);
  });

  it('sets a variable on an environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');

    store.setVariable(env.id, 'apiKey', 'abc123');

    expect(store.environments[0].variables).toEqual({ apiKey: 'abc123' });
  });

  it('overwrites an existing variable', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production', { apiKey: 'old' });

    store.setVariable(env.id, 'apiKey', 'new');

    expect(store.environments[0].variables.apiKey).toBe('new');
  });

  it('removes a variable from an environment', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production', { apiKey: 'abc', baseUrl: 'https://prod.com' });

    store.removeVariable(env.id, 'apiKey');

    expect(store.environments[0].variables).toEqual({ baseUrl: 'https://prod.com' });
  });

  it('persists environments to localStorage', () => {
    const store = new EnvStore();
    store.addEnvironment('Production', { apiKey: 'abc' });

    expect(storage['swaggerx:environments']).toBeDefined();
    const persisted = JSON.parse(storage['swaggerx:environments']);
    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe('Production');
  });

  it('persists active id to localStorage', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    store.setActive(env.id);

    expect(storage['swaggerx:active-env']).toBeDefined();
    const activeId = JSON.parse(storage['swaggerx:active-env']);
    expect(activeId).toBe(env.id);
  });

  it('loads from localStorage on construction', () => {
    const envData = [
      { id: 'env-1', name: 'Production', variables: { apiKey: 'abc' } },
      { id: 'env-2', name: 'Staging', variables: { apiKey: 'def' } },
    ];
    storage['swaggerx:environments'] = JSON.stringify(envData);
    storage['swaggerx:active-env'] = JSON.stringify('env-1');

    const store = new EnvStore();

    expect(store.environments).toHaveLength(2);
    expect(store.activeId).toBe('env-1');
    expect(store.activeEnvironment?.name).toBe('Production');
    expect(store.activeVariables).toEqual({ apiKey: 'abc' });
  });

  it('notifies listeners on add', () => {
    const store = new EnvStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.addEnvironment('Production');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on update', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    const listener = vi.fn();

    store.subscribe(listener);
    store.updateEnvironment(env.id, { name: 'Prod' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on remove', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    const listener = vi.fn();

    store.subscribe(listener);
    store.removeEnvironment(env.id);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on setActive', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    const listener = vi.fn();

    store.subscribe(listener);
    store.setActive(env.id);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on setVariable', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production');
    const listener = vi.fn();

    store.subscribe(listener);
    store.setVariable(env.id, 'key', 'value');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies listeners on removeVariable', () => {
    const store = new EnvStore();
    const env = store.addEnvironment('Production', { key: 'value' });
    const listener = vi.fn();

    store.subscribe(listener);
    store.removeVariable(env.id, 'key');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listener', () => {
    const store = new EnvStore();
    const listener = vi.fn();

    const unsub = store.subscribe(listener);
    unsub();
    store.addEnvironment('Production');

    expect(listener).not.toHaveBeenCalled();
  });
});
