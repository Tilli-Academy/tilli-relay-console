import { describe, it, expect } from 'vitest';
import { generateCodeSamples } from '../../../src/core/code-gen.js';
import type { Endpoint } from '../../../src/core/types.js';

const baseUrl = 'https://api.example.com';

function makeEndpoint(overrides: Partial<Endpoint> = {}): Endpoint {
  return {
    id: 'GET:/pets',
    method: 'get',
    path: '/pets',
    summary: 'List pets',
    description: '',
    tags: ['pets'],
    deprecated: false,
    parameters: [],
    responses: {},
    security: [],
    ...overrides,
  };
}

describe('code-gen', () => {
  describe('generateCodeSamples()', () => {
    it('generates all four language samples', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples).toHaveProperty('curl');
      expect(samples).toHaveProperty('javascript');
      expect(samples).toHaveProperty('python');
      expect(samples).toHaveProperty('nodejs');
    });

    it('generates correct curl for GET request', () => {
      const endpoint = makeEndpoint({ method: 'get', path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.curl).toContain('curl -X GET');
      expect(samples.curl).toContain('https://api.example.com/pets');
      expect(samples.curl).toContain("'Accept: application/json'");
    });

    it('generates correct curl for POST with JSON body', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Buddy' },
                },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.curl).toContain('curl -X POST');
      expect(samples.curl).toContain("'Content-Type: application/json'");
      expect(samples.curl).toContain('Buddy');
    });

    it('generates correct JavaScript fetch snippet', () => {
      const endpoint = makeEndpoint({ method: 'get', path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.javascript).toContain('await fetch(');
      expect(samples.javascript).toContain("method: 'GET'");
      expect(samples.javascript).toContain('https://api.example.com/pets');
      expect(samples.javascript).toContain('response.json()');
    });

    it('generates correct Python requests snippet', () => {
      const endpoint = makeEndpoint({ method: 'get', path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.python).toContain('import requests');
      expect(samples.python).toContain('requests.get(');
      expect(samples.python).toContain('https://api.example.com/pets');
      expect(samples.python).toContain('response.json()');
    });

    it('generates correct Node.js axios snippet', () => {
      const endpoint = makeEndpoint({ method: 'get', path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.nodejs).toContain("require('axios')");
      expect(samples.nodejs).toContain("method: 'GET'");
      expect(samples.nodejs).toContain('https://api.example.com/pets');
    });

    it('includes body in POST snippets for all languages', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Rex' },
                },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.curl).toContain('Rex');
      expect(samples.javascript).toContain('Rex');
      expect(samples.javascript).toContain('JSON.stringify');
      expect(samples.python).toContain('Rex');
      expect(samples.python).toContain('json=payload');
      expect(samples.nodejs).toContain('Rex');
    });

    it('handles endpoints without request body', () => {
      const endpoint = makeEndpoint({ method: 'delete', path: '/pets/{petId}' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.curl).toContain('curl -X DELETE');
      expect(samples.curl).not.toContain('Content-Type');
      expect(samples.javascript).not.toContain('body:');
      expect(samples.python).not.toContain('json=');
    });
  });
});
