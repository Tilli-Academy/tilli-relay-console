import { describe, it, expect } from 'vitest';
import { parseSpec } from '../../../src/core/parser.js';

const VALID_JSON = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0' },
  paths: {
    '/test': {
      get: {
        summary: 'Test endpoint',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
});

const VALID_YAML = `openapi: "3.0.0"
info:
  title: Test
  version: "1.0"
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        "200":
          description: OK`;

describe('parseSpec', () => {
  it('parses inline JSON string', async () => {
    const result = await parseSpec(VALID_JSON);
    expect(result).toBeTruthy();
    expect(result.openapi).toBe('3.0.0');
    expect(result.paths).toBeTruthy();
  });

  it('parses inline YAML string', async () => {
    const result = await parseSpec(VALID_YAML);
    expect(result).toBeTruthy();
    expect(result.openapi).toBe('3.0.0');
  });

  it('throws on invalid spec content', async () => {
    await expect(parseSpec('{ "invalid": true }')).rejects.toThrow(
      'Failed to parse OpenAPI spec',
    );
  });

  it('throws on empty string', async () => {
    await expect(parseSpec('')).rejects.toThrow('Failed to parse OpenAPI spec');
  });
});
