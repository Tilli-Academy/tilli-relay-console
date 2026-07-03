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
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"name": "Buddy"}',
      });

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
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"name": "Rex"}',
      });

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

    it('falls back to spec example when userBody is empty and endpoint has requestBody schema', () => {
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
      expect(samples.curl).toContain('Content-Type: application/json');
    });

    it('includes empty -d when userBody is empty and endpoint has no requestBody schema', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '',
      });

      expect(samples.curl).toContain("-d ''");
      expect(samples.curl).toContain('Content-Type: application/json');
    });

    it('falls back to spec example when userBody is not provided', () => {
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
      const samples = generateCodeSamples(endpoint, baseUrl);

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

  describe('resolvedUrl option', () => {
    it('uses resolvedUrl instead of baseUrl + endpoint.path', () => {
      const endpoint = makeEndpoint({ path: '/pets/{petId}' });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        resolvedUrl: 'https://api.example.com/pets/42',
      });

      expect(samples.curl).toContain('https://api.example.com/pets/42');
      expect(samples.curl).not.toContain('{petId}');
    });

    it('uses resolvedUrl with query params appended', () => {
      const endpoint = makeEndpoint({ path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        resolvedUrl: 'https://api.example.com/pets?limit=10&offset=0',
      });

      expect(samples.curl).toContain('https://api.example.com/pets?limit=10&offset=0');
    });

    it('falls back to baseUrl + endpoint.path when resolvedUrl not provided', () => {
      const endpoint = makeEndpoint({ path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl);

      expect(samples.curl).toContain('https://api.example.com/pets');
    });

    it('combines resolvedUrl with auth and headers', () => {
      const endpoint = makeEndpoint({ path: '/pets/{petId}' });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        resolvedUrl: 'https://api.example.com/pets/42',
        auth: { type: 'bearer', token: 'resolved-token-123' },
        headers: { 'X-Custom': 'value' },
      });

      expect(samples.curl).toContain('https://api.example.com/pets/42');
      expect(samples.curl).toContain('Authorization: Bearer resolved-token-123');
      expect(samples.curl).toContain('X-Custom: value');
      expect(samples.javascript).toContain('https://api.example.com/pets/42');
      expect(samples.python).toContain('https://api.example.com/pets/42');
      expect(samples.nodejs).toContain('https://api.example.com/pets/42');
    });
  });

  describe('escaping user input', () => {
    it('escapes single quotes in curl body', () => {
      const endpoint = makeEndpoint({ method: 'post', path: '/pets' });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"name": "O\'Brien"}',
      });

      expect(samples.curl).toContain("O'\\''Brien");
    });

    it('escapes single quotes in curl header values', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'X-Custom': "it's a test" },
      });

      expect(samples.curl).toContain("it'\\''s a test");
    });

    it('escapes single quotes in JavaScript header values', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'X-Custom': "it's a test" },
      });

      expect(samples.javascript).toContain("it\\'s a test");
    });

    it('escapes single quotes in Python header values', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'X-Custom': "it's a test" },
      });

      expect(samples.python).toContain("it\\'s a test");
    });

    it('escapes single quotes in Node.js header values', () => {
      const endpoint = makeEndpoint();
      const samples = generateCodeSamples(endpoint, baseUrl, {
        headers: { 'X-Custom': "it's a test" },
      });

      expect(samples.nodejs).toContain("it\\'s a test");
    });
  });

  describe('content type detection', () => {
    it('uses application/json for JSON request body', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"name": "Buddy"}',
      });

      expect(samples.curl).toContain('Content-Type: application/json');
      expect(samples.curl).toContain("-d ");
    });

    it('uses multipart/form-data when spec declares it', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/upload',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{}',
      });

      expect(samples.curl).toContain('-F ');
      expect(samples.curl).not.toContain('Content-Type: multipart/form-data');
      expect(samples.javascript).toContain('FormData');
      expect(samples.python).toContain('files=');
    });

    it('uses application/x-www-form-urlencoded when spec declares it', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/login',
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"username": "admin", "password": "pass"}',
      });

      expect(samples.curl).toContain('Content-Type: application/x-www-form-urlencoded');
      expect(samples.curl).toContain('--data-urlencode');
      expect(samples.javascript).toContain('URLSearchParams');
      expect(samples.python).toContain('data=payload');
    });

    it('prefers application/json when multiple content types available', () => {
      const endpoint = makeEndpoint({
        method: 'post',
        path: '/pets',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object' },
            },
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
      });
      const samples = generateCodeSamples(endpoint, baseUrl, {
        userBody: '{"name": "Buddy"}',
      });

      expect(samples.curl).toContain('Content-Type: application/json');
      expect(samples.curl).toContain("-d ");
    });
  });
});
