import { describe, it, expect, beforeEach } from 'vitest';
import { getItem, setItem, removeItem } from '../../../src/utils/local-storage.js';

describe('local-storage', () => {
  beforeEach(() => {
    localStorage.clear();
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

    it('prefixes keys with swaggerx:', () => {
      setItem('mykey', 'val');
      expect(localStorage.getItem('swaggerx:mykey')).toBe('"val"');
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
      localStorage.setItem('swaggerx:bad', 'not-json{');
      expect(getItem('bad', 'fallback')).toBe('fallback');
    });
  });
});
