import { describe, it, expect } from 'vitest';
import { interpolate } from '../../../src/utils/env-interpolator.js';

describe('interpolate', () => {
  it('returns empty string for empty template', () => {
    expect(interpolate('', { host: 'example.com' })).toBe('');
  });

  it('returns template unchanged when no variables match', () => {
    expect(interpolate('hello world', { host: 'example.com' })).toBe('hello world');
  });

  it('replaces single variable', () => {
    expect(interpolate('https://{{host}}/api', { host: 'api.example.com' })).toBe(
      'https://api.example.com/api',
    );
  });

  it('replaces multiple different variables', () => {
    const result = interpolate('{{scheme}}://{{host}}:{{port}}', {
      scheme: 'https',
      host: 'api.example.com',
      port: '8443',
    });
    expect(result).toBe('https://api.example.com:8443');
  });

  it('replaces same variable multiple times', () => {
    const result = interpolate('{{name}} meets {{name}}', { name: 'Alice' });
    expect(result).toBe('Alice meets Alice');
  });

  it('leaves unmatched placeholders as-is', () => {
    expect(interpolate('{{unknown}}', {})).toBe('{{unknown}}');
  });

  it('handles mixed matched and unmatched variables', () => {
    const result = interpolate('{{host}}/{{version}}', { host: 'api.example.com' });
    expect(result).toBe('api.example.com/{{version}}');
  });

  it('handles empty variables object', () => {
    expect(interpolate('{{host}}/api', {})).toBe('{{host}}/api');
  });

  it('handles special characters in variable values', () => {
    const result = interpolate('{{baseUrl}}/pets', {
      baseUrl: 'https://api.example.com:8080/v1',
    });
    expect(result).toBe('https://api.example.com:8080/v1/pets');
  });

  it('does not match non-word characters in placeholder names', () => {
    // \w matches [a-zA-Z0-9_], so {{foo-bar}} should NOT be replaced
    const result = interpolate('{{foo-bar}}', { 'foo-bar': 'value' });
    expect(result).toBe('{{foo-bar}}');
  });
});
