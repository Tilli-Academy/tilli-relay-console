import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getItem, setItem, removeItem } from '../../../src/utils/local-storage.js';

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
});
