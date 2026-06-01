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

  describe('dynamic code samples (auth, headers, body)', () => {
    it('includes Bearer token in all languages', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'bearer', token: 'my-secret-token' },
      });

      expect(samples.curl).toContain("Authorization: Bearer my-secret-token");
      expect(samples.javascript).toContain("'Authorization': 'Bearer my-secret-token'");
      expect(samples.python).toContain("'Authorization': 'Bearer my-secret-token'");
      expect(samples.nodejs).toContain("'Authorization': 'Bearer my-secret-token'");
    });

    it('includes Basic auth with base64 encoding', () => {
      const endpoint = makeEndpoint();
      const encoded = btoa('admin:pass123');
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'basic', username: 'admin', password: 'pass123' },
      });

      expect(samples.curl).toContain(`Authorization: Basic ${encoded}`);
      expect(samples.javascript).toContain(`'Authorization': 'Basic ${encoded}'`);
    });

    it('includes API Key as header', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'apiKey', apiKeyName: 'X-API-Key', apiKeyValue: 'secret-456', apiKeyIn: 'header' },
      });

      expect(samples.curl).toContain("X-API-Key: secret-456");
      expect(samples.javascript).toContain("'X-API-Key': 'secret-456'");
    });

    it('appends API Key to URL as query param', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'apiKey', apiKeyName: 'api_key', apiKeyValue: 'secret-456', apiKeyIn: 'query' },
      });

      expect(samples.curl).toContain('?api_key=secret-456');
      expect(samples.javascript).toContain('?api_key=secret-456');
      expect(samples.curl).not.toContain("api_key: secret-456");
    });

    it('includes custom headers in output', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'X-Request-ID': 'abc-123', 'X-Tenant': 'acme' },
      });

      expect(samples.curl).toContain("X-Request-ID: abc-123");
      expect(samples.curl).toContain("X-Tenant: acme");
      expect(samples.javascript).toContain("'X-Request-ID': 'abc-123'");
    });

    it('custom header overrides default Accept', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'Accept': 'text/xml' },
      });

      expect(samples.curl).toContain("Accept: text/xml");
      expect(samples.curl).not.toContain("Accept: application/json");
    });

    it('user body overrides spec example', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string', example: 'Buddy' } },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"custom": true}',
      });

      expect(samples.curl).toContain('{"custom": true}');
      expect(samples.curl).not.toContain('Buddy');
    });

    it('falls back to spec example when userBody is empty', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string', example: 'Rex' } },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '',
      });

      expect(samples.curl).toContain('Rex');
    });

    it('auth type none adds no auth header', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'none' },
      });

      expect(samples.curl).not.toContain('Authorization');
    });

    it('merges auth and custom headers together', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        auth: { type: 'bearer', token: 'tok123' },
        headers: { 'X-Custom': 'val' },
      });

      expect(samples.curl).toContain("Authorization: Bearer tok123");
      expect(samples.curl).toContain("X-Custom: val");
    });
  });
});
