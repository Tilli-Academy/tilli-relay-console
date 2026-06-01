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
});
