import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateId, getItem, setItem, removeItem, migrateFromSwaggerX } from '../../../src/utils/local-storage.js';

function createMockStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('local-storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMockStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setItem / getItem', () => {
    it('stores and retrieves a string value', () => {
      setItem('test-key', 'hello');
      expect(getItem('test-key', '')).toBe('hello');
    });

    it('stores and retrieves an object', () => {
      const obj = { name: 'test', count: 42 };
      setItem('obj-key', obj);
      expect(getItem('obj-key', {})).toEqual(obj);
    });

    it('stores and retrieves an array', () => {
      const arr = [1, 2, 3];
      setItem('arr-key', arr);
      expect(getItem('arr-key', [])).toEqual(arr);
    });

    it('returns fallback for missing key', () => {
      expect(getItem('missing', 'default')).toBe('default');
    });

    it('prefixes keys with rundocs:', () => {
      setItem('mykey', 'val');
      expect(localStorage.getItem('rundocs:mykey')).toBe('"val"');
    });
  });

  describe('removeItem', () => {
    it('removes a stored item', () => {
      setItem('remove-me', 'value');
      expect(getItem('remove-me', null)).toBe('value');
      removeItem('remove-me');
      expect(getItem('remove-me', null)).toBeNull();
    });
  });

  describe('error handling', () => {
    it('returns fallback if stored value is invalid JSON', () => {
      localStorage.setItem('rundocs:bad', 'not-json{');
      expect(getItem('bad', 'fallback')).toBe('fallback');
    });
  });

  describe('migrateFromSwaggerX', () => {
    it('migrates swaggerx: keys to rundocs: prefix', () => {
      localStorage.setItem('swaggerx:history', '["entry1"]');
      localStorage.setItem('swaggerx:environments', '["env1"]');
      migrateFromSwaggerX();
      expect(localStorage.getItem('rundocs:history')).toBe('["entry1"]');
      expect(localStorage.getItem('rundocs:environments')).toBe('["env1"]');
      expect(localStorage.getItem('swaggerx:history')).toBeNull();
      expect(localStorage.getItem('swaggerx:environments')).toBeNull();
    });

    it('does not overwrite existing rundocs: keys', () => {
      localStorage.setItem('swaggerx:history', '["old"]');
      localStorage.setItem('rundocs:history', '["new"]');
      migrateFromSwaggerX();
      expect(localStorage.getItem('rundocs:history')).toBe('["new"]');
      expect(localStorage.getItem('swaggerx:history')).toBeNull();
    });

    it('migrates keys not in any hardcoded list', () => {
      localStorage.setItem('swaggerx:custom-setting', '"value"');
      migrateFromSwaggerX();
      expect(localStorage.getItem('rundocs:custom-setting')).toBe('"value"');
      expect(localStorage.getItem('swaggerx:custom-setting')).toBeNull();
    });

    it('ignores non-swaggerx keys', () => {
      localStorage.setItem('other:key', 'data');
      migrateFromSwaggerX();
      expect(localStorage.getItem('other:key')).toBe('data');
    });
  });

  describe('generateId', () => {
    it('uses crypto.randomUUID when available', () => {
      vi.stubGlobal('crypto', { randomUUID: () => '550e8400-e29b-41d4-a716-446655440000' });
      expect(generateId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('falls back when crypto.randomUUID is unavailable', () => {
      vi.stubGlobal('crypto', {});
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(id).toContain('-');
    });

    it('generates unique IDs in fallback mode', () => {
      vi.stubGlobal('crypto', {});
      const ids = new Set(Array.from({ length: 50 }, () => generateId()));
      expect(ids.size).toBe(50);
    });
  });
});
