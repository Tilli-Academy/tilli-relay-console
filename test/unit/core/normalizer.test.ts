import { describe, it, expect } from 'vitest';
import { normalize } from '../../../src/core/normalizer.js';
import petstoreSpec from '../../fixtures/petstore.json';
import minimalSpec from '../../fixtures/minimal-spec.json';

describe('normalizer', () => {
  describe('normalize()', () => {
    it('normalizes petstore spec into expected shape', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result).toHaveProperty('info');
      expect(result).toHaveProperty('servers');
      expect(result).toHaveProperty('tags');
      expect(result).toHaveProperty('endpoints');
      expect(result).toHaveProperty('securitySchemes');
      expect(result).toHaveProperty('schemas');
    });

    it('extracts API info correctly', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result.info.title).toBe('Petstore API');
      expect(result.info.version).toBe('1.0.0');
      expect(result.info.description).toBe('A sample API for managing pets');
      expect(result.info.contact?.email).toBe('support@petstore.com');
      expect(result.info.license?.name).toBe('MIT');
    });

    it('extracts server URLs', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result.servers).toHaveLength(2);
      expect(result.servers[0].url).toBe('https://api.petstore.com/v1');
      expect(result.servers[0].description).toBe('Production');
      expect(result.servers[1].url).toBe('https://staging.petstore.com/v1');
    });

    it('extracts all endpoints', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      // GET /pets, POST /pets, GET /pets/{petId}, DELETE /pets/{petId}, GET /store/inventory
      expect(result.endpoints).toHaveLength(5);
    });

    it('creates correct endpoint IDs', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);
      const ids = result.endpoints.map((e) => e.id);

      expect(ids).toContain('GET:/pets');
      expect(ids).toContain('POST:/pets');
      expect(ids).toContain('GET:/pets/{petId}');
      expect(ids).toContain('DELETE:/pets/{petId}');
      expect(ids).toContain('GET:/store/inventory');
    });

    it('groups endpoints by tags correctly', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result.tags).toHaveLength(2);

      const petsTag = result.tags.find((t) => t.name === 'pets');
      expect(petsTag).toBeDefined();
      expect(petsTag!.endpoints).toHaveLength(4);
      expect(petsTag!.description).toBe('Pet operations');

      const storeTag = result.tags.find((t) => t.name === 'store');
      expect(storeTag).toBeDefined();
      expect(storeTag!.endpoints).toHaveLength(1);
    });

    it('assigns "default" tag to untagged endpoints', () => {
      const result = normalize(minimalSpec as unknown as Record<string, unknown>);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('default');
      expect(result.tags[0].endpoints).toHaveLength(1);
    });

    it('extracts endpoint parameters', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);
      const listPets = result.endpoints.find((e) => e.id === 'GET:/pets');

      expect(listPets).toBeDefined();
      expect(listPets!.parameters).toHaveLength(2);
      expect(listPets!.parameters[0].name).toBe('limit');
      expect(listPets!.parameters[0].in).toBe('query');
      expect(listPets!.parameters[0].required).toBe(false);
    });

    it('extracts path parameters', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);
      const getPet = result.endpoints.find((e) => e.id === 'GET:/pets/{petId}');

      expect(getPet).toBeDefined();
      expect(getPet!.parameters).toHaveLength(1);
      expect(getPet!.parameters[0].name).toBe('petId');
      expect(getPet!.parameters[0].in).toBe('path');
      expect(getPet!.parameters[0].required).toBe(true);
    });

    it('extracts request body', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);
      const createPet = result.endpoints.find((e) => e.id === 'POST:/pets');

      expect(createPet).toBeDefined();
      expect(createPet!.requestBody).toBeDefined();
      expect(createPet!.requestBody!.required).toBe(true);
      expect(createPet!.requestBody!.content['application/json']).toBeDefined();
    });

    it('marks deprecated endpoints', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);
      const deletePet = result.endpoints.find((e) => e.id === 'DELETE:/pets/{petId}');

      expect(deletePet).toBeDefined();
      expect(deletePet!.deprecated).toBe(true);
    });

    it('extracts security schemes', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result.securitySchemes).toHaveProperty('bearerAuth');
      expect(result.securitySchemes.bearerAuth.type).toBe('http');
      expect(result.securitySchemes.bearerAuth.scheme).toBe('bearer');
    });

    it('extracts schemas', () => {
      const result = normalize(petstoreSpec as unknown as Record<string, unknown>);

      expect(result.schemas).toHaveProperty('Pet');
      expect(result.schemas).toHaveProperty('NewPet');
      expect(result.schemas.Pet.type).toBe('object');
    });

    it('handles spec with no endpoints gracefully', () => {
      const emptySpec = {
        openapi: '3.0.0',
        info: { title: 'Empty', version: '1.0.0' },
        paths: {},
      };
      const result = normalize(emptySpec);

      expect(result.endpoints).toHaveLength(0);
      expect(result.tags).toHaveLength(0);
    });

    it('handles minimal spec', () => {
      const result = normalize(minimalSpec as unknown as Record<string, unknown>);

      expect(result.info.title).toBe('Minimal API');
      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].method).toBe('get');
      expect(result.endpoints[0].path).toBe('/health');
      expect(result.endpoints[0].summary).toBe('Health check');
    });

    it('defaults to "/" server when no servers defined', () => {
      const result = normalize(minimalSpec as unknown as Record<string, unknown>);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].url).toBe('/');
    });
  });

  describe('parameter deduplication', () => {
    it('operation-level param overrides path-level param with same name+in', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items/{id}': {
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Path-level' },
            ],
            get: {
              summary: 'Get item',
              parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Operation-level' },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      const ep = result.endpoints[0];
      expect(ep.parameters).toHaveLength(1);
      expect(ep.parameters[0].description).toBe('Operation-level');
      expect(ep.parameters[0].schema.type).toBe('integer');
    });

    it('keeps both params when name matches but in differs', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items/{id}': {
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            ],
            get: {
              summary: 'Get item',
              parameters: [
                { name: 'id', in: 'query', required: false, schema: { type: 'string' } },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      const ep = result.endpoints[0];
      expect(ep.parameters).toHaveLength(2);
      expect(ep.parameters.map((p) => p.in)).toContain('path');
      expect(ep.parameters.map((p) => p.in)).toContain('query');
    });

    it('does not deduplicate when there are no duplicates', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items/{id}': {
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            ],
            get: {
              summary: 'Get item',
              parameters: [
                { name: 'limit', in: 'query', schema: { type: 'integer' } },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      const ep = result.endpoints[0];
      expect(ep.parameters).toHaveLength(2);
    });
  });

  describe('global security fallback', () => {
    it('falls back to global security when operation has no security', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        security: [{ bearerAuth: [] }],
        paths: {
          '/items': {
            get: {
              summary: 'List items',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      expect(result.endpoints[0].security).toEqual([{ bearerAuth: [] }]);
    });

    it('uses operation security when explicitly defined', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        security: [{ bearerAuth: [] }],
        paths: {
          '/items': {
            get: {
              summary: 'List items',
              security: [{ apiKey: [] }],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      expect(result.endpoints[0].security).toEqual([{ apiKey: [] }]);
    });

    it('empty operation security explicitly means no security', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        security: [{ bearerAuth: [] }],
        paths: {
          '/public': {
            get: {
              summary: 'Public endpoint',
              security: [],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      expect(result.endpoints[0].security).toEqual([]);
    });

    it('defaults to empty array when no global or operation security', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              summary: 'List items',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      const result = normalize(doc);
      expect(result.endpoints[0].security).toEqual([]);
    });
  });

  describe('tag ordering', () => {
    it('orders tags according to doc.tags array', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        tags: [
          { name: 'zeta', description: 'Z group' },
          { name: 'alpha', description: 'A group' },
        ],
        paths: {
          '/a': {
            get: { tags: ['alpha'], summary: 'Alpha', responses: { '200': { description: 'OK' } } },
          },
          '/z': {
            get: { tags: ['zeta'], summary: 'Zeta', responses: { '200': { description: 'OK' } } },
          },
        },
      };
      const result = normalize(doc);
      expect(result.tags[0].name).toBe('zeta');
      expect(result.tags[1].name).toBe('alpha');
    });

    it('puts tags not in doc.tags at the end', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        tags: [{ name: 'first' }],
        paths: {
          '/a': {
            get: { tags: ['unknown'], summary: 'Unknown', responses: { '200': { description: 'OK' } } },
          },
          '/b': {
            get: { tags: ['first'], summary: 'First', responses: { '200': { description: 'OK' } } },
          },
        },
      };
      const result = normalize(doc);
      expect(result.tags[0].name).toBe('first');
      expect(result.tags[1].name).toBe('unknown');
    });

    it('preserves insertion order when no doc.tags defined', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/b': {
            get: { tags: ['beta'], summary: 'B', responses: { '200': { description: 'OK' } } },
          },
          '/a': {
            get: { tags: ['alpha'], summary: 'A', responses: { '200': { description: 'OK' } } },
          },
        },
      };
      const result = normalize(doc);
      expect(result.tags[0].name).toBe('beta');
      expect(result.tags[1].name).toBe('alpha');
    });
  });

  describe('server variable substitution', () => {
    it('substitutes server variable defaults into URL', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        servers: [
          {
            url: 'https://{environment}.api.com/{version}',
            description: 'Main',
            variables: {
              environment: { default: 'prod', enum: ['prod', 'staging', 'dev'] },
              version: { default: 'v1' },
            },
          },
        ],
      };
      const result = normalize(doc);
      expect(result.servers[0].url).toBe('https://prod.api.com/v1');
      expect(result.servers[0].description).toBe('Main');
      expect(result.servers[0].variables).toBeDefined();
      expect(result.servers[0].variables!.environment.default).toBe('prod');
      expect(result.servers[0].variables!.environment.enum).toEqual(['prod', 'staging', 'dev']);
    });

    it('handles servers without variables unchanged', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        servers: [{ url: 'https://api.example.com', description: 'Prod' }],
      };
      const result = normalize(doc);
      expect(result.servers[0].url).toBe('https://api.example.com');
      expect(result.servers[0].variables).toBeUndefined();
    });

    it('handles variable with missing default gracefully', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        servers: [
          {
            url: 'https://{host}/api',
            variables: { host: {} },
          },
        ],
      };
      const result = normalize(doc);
      expect(result.servers[0].url).toBe('https:///api');
    });
  });
});
