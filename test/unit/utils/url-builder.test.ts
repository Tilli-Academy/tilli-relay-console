import { describe, it, expect } from 'vitest';
import { buildUrl } from '../../../src/utils/url-builder.js';

describe('buildUrl', () => {
  it('combines base URL and path', () => {
    expect(buildUrl('https://api.example.com', '/pets')).toBe('https://api.example.com/pets');
  });

  it('strips trailing slash from base URL', () => {
    expect(buildUrl('https://api.example.com/', '/pets')).toBe('https://api.example.com/pets');
  });

  it('adds leading slash to path if missing', () => {
    expect(buildUrl('https://api.example.com', 'pets')).toBe('https://api.example.com/pets');
  });

  it('replaces path parameters', () => {
    expect(buildUrl('https://api.example.com', '/pets/{petId}', { petId: '42' })).toBe(
      'https://api.example.com/pets/42',
    );
  });

  it('encodes path parameter values', () => {
    expect(buildUrl('https://api.example.com', '/search/{query}', { query: 'hello world' })).toBe(
      'https://api.example.com/search/hello%20world',
    );
  });

  it('skips empty path parameter values', () => {
    expect(buildUrl('https://api.example.com', '/pets/{petId}', { petId: '' })).toBe(
      'https://api.example.com/pets/{petId}',
    );
  });

  it('adds query parameters', () => {
    const result = buildUrl('https://api.example.com', '/pets', {}, { limit: '10' });
    expect(result).toBe('https://api.example.com/pets?limit=10');
  });

  it('filters out empty query parameter values', () => {
    const result = buildUrl('https://api.example.com', '/pets', {}, { limit: '10', offset: '' });
    expect(result).toBe('https://api.example.com/pets?limit=10');
  });

  it('handles both path and query parameters together', () => {
    const result = buildUrl(
      'https://api.example.com',
      '/owners/{ownerId}/pets',
      { ownerId: '5' },
      { limit: '20' },
    );
    expect(result).toBe('https://api.example.com/owners/5/pets?limit=20');
  });

  it('returns URL with no query string when query params are empty', () => {
    const result = buildUrl('https://api.example.com', '/pets', {}, {});
    expect(result).toBe('https://api.example.com/pets');
  });

  it('handles multiple path parameters', () => {
    const result = buildUrl(
      'https://api.example.com',
      '/owners/{ownerId}/pets/{petId}',
      { ownerId: '5', petId: '42' },
    );
    expect(result).toBe('https://api.example.com/owners/5/pets/42');
  });
});
