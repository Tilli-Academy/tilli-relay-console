import { describe, it, expect } from 'vitest';
import {
  generateExample,
  flattenSchema,
  getSchemaTypeLabel,
} from '../../../src/core/schema-resolver.js';
import type { ResolvedSchema } from '../../../src/core/types.js';

describe('schema-resolver', () => {
  describe('generateExample()', () => {
    it('returns explicit example if present', () => {
      const schema: ResolvedSchema = { type: 'string', example: 'hello' };
      expect(generateExample(schema)).toBe('hello');
    });

    it('returns default value if no example', () => {
      const schema: ResolvedSchema = { type: 'string', default: 'default-val' };
      expect(generateExample(schema)).toBe('default-val');
    });

    it('returns first enum value', () => {
      const schema: ResolvedSchema = { type: 'string', enum: ['a', 'b', 'c'] };
      expect(generateExample(schema)).toBe('a');
    });

    it('generates string example', () => {
      const schema: ResolvedSchema = { type: 'string' };
      expect(generateExample(schema)).toBe('string');
    });

    it('generates email format string', () => {
      const schema: ResolvedSchema = { type: 'string', format: 'email' };
      expect(generateExample(schema)).toBe('user@example.com');
    });

    it('generates date-time format string', () => {
      const schema: ResolvedSchema = { type: 'string', format: 'date-time' };
      expect(generateExample(schema)).toBe('2024-01-15T09:30:00Z');
    });

    it('generates uuid format string', () => {
      const schema: ResolvedSchema = { type: 'string', format: 'uuid' };
      expect(generateExample(schema)).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('generates integer example', () => {
      const schema: ResolvedSchema = { type: 'integer' };
      expect(generateExample(schema)).toBe(0);
    });

    it('generates number with minimum', () => {
      const schema: ResolvedSchema = { type: 'number', minimum: 5 };
      expect(generateExample(schema)).toBe(5);
    });

    it('generates boolean example', () => {
      const schema: ResolvedSchema = { type: 'boolean' };
      expect(generateExample(schema)).toBe(true);
    });

    it('generates null example', () => {
      const schema: ResolvedSchema = { type: 'null' };
      expect(generateExample(schema)).toBe(null);
    });

    it('generates object example with properties', () => {
      const schema: ResolvedSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Buddy' },
          age: { type: 'integer', example: 3 },
        },
      };
      expect(generateExample(schema)).toEqual({ name: 'Buddy', age: 3 });
    });

    it('generates array example', () => {
      const schema: ResolvedSchema = {
        type: 'array',
        items: { type: 'string', example: 'item' },
      };
      expect(generateExample(schema)).toEqual(['item']);
    });

    it('generates empty array when no items schema', () => {
      const schema: ResolvedSchema = { type: 'array' };
      expect(generateExample(schema)).toEqual([]);
    });

    it('generates nested object example', () => {
      const schema: ResolvedSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
        },
      };
      expect(generateExample(schema)).toEqual({
        user: {
          name: 'string',
          email: 'user@example.com',
        },
      });
    });

    it('handles allOf composition', () => {
      const schema: ResolvedSchema = {
        allOf: [
          {
            type: 'object',
            properties: { id: { type: 'integer', example: 1 } },
          },
          {
            type: 'object',
            properties: { name: { type: 'string', example: 'test' } },
          },
        ],
      };
      expect(generateExample(schema)).toEqual({ id: 1, name: 'test' });
    });

    it('handles oneOf by using first option', () => {
      const schema: ResolvedSchema = {
        oneOf: [
          { type: 'string', example: 'text' },
          { type: 'integer', example: 42 },
        ],
      };
      expect(generateExample(schema)).toBe('text');
    });

    it('stops at max depth to prevent infinite recursion', () => {
      const schema: ResolvedSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              deep: {
                type: 'object',
                properties: {
                  deeper: {
                    type: 'object',
                    properties: {
                      veryDeep: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };
      // Should not throw, should return something
      const result = generateExample(schema);
      expect(result).toBeDefined();
    });
  });

  describe('flattenSchema()', () => {
    it('returns schema as-is when no allOf', () => {
      const schema: ResolvedSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      expect(flattenSchema(schema)).toEqual(schema);
    });

    it('merges allOf schemas', () => {
      const schema: ResolvedSchema = {
        allOf: [
          {
            type: 'object',
            properties: { id: { type: 'integer' } },
            required: ['id'],
          },
          {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
          },
        ],
      };
      const result = flattenSchema(schema);

      expect(result.properties).toHaveProperty('id');
      expect(result.properties).toHaveProperty('name');
      expect(result.required).toContain('id');
      expect(result.required).toContain('name');
    });
  });

  describe('getSchemaTypeLabel()', () => {
    it('returns "string" for string type', () => {
      expect(getSchemaTypeLabel({ type: 'string' })).toBe('string');
    });

    it('returns "integer" for integer type', () => {
      expect(getSchemaTypeLabel({ type: 'integer' })).toBe('integer');
    });

    it('returns "string (email)" for string with format', () => {
      expect(getSchemaTypeLabel({ type: 'string', format: 'email' })).toBe('string (email)');
    });

    it('returns "string[]" for array of strings', () => {
      expect(getSchemaTypeLabel({ type: 'array', items: { type: 'string' } })).toBe('string[]');
    });

    it('returns title if present', () => {
      expect(getSchemaTypeLabel({ title: 'Pet', type: 'object' })).toBe('Pet');
    });

    it('returns enum values', () => {
      expect(getSchemaTypeLabel({ enum: ['a', 'b'] })).toBe('enum(a, b)');
    });

    it('returns "any" for unknown type', () => {
      expect(getSchemaTypeLabel({})).toBe('any');
    });

    it('returns "string | null" when nullable is true', () => {
      expect(getSchemaTypeLabel({ type: 'string', nullable: true })).toBe('string | null');
    });

    it('returns "integer | null" for nullable integer', () => {
      expect(getSchemaTypeLabel({ type: 'integer', nullable: true })).toBe('integer | null');
    });

    it('returns "string (email) | null" for nullable formatted string', () => {
      expect(getSchemaTypeLabel({ type: 'string', format: 'email', nullable: true })).toBe('string (email) | null');
    });

    it('returns "string[] | null" for nullable array', () => {
      expect(getSchemaTypeLabel({ type: 'array', items: { type: 'string' }, nullable: true })).toBe('string[] | null');
    });

    it('returns "object | null" for nullable allOf', () => {
      expect(getSchemaTypeLabel({
        allOf: [{ type: 'object', properties: { id: { type: 'integer' } } }],
        nullable: true,
      })).toBe('object | null');
    });

    it('does not append null when nullable is false', () => {
      expect(getSchemaTypeLabel({ type: 'string', nullable: false })).toBe('string');
    });

    it('handles OAS 3.1 array type ["string", "null"]', () => {
      expect(getSchemaTypeLabel({ type: ['string', 'null'] })).toBe('string | null');
    });

    it('handles OAS 3.1 array type ["integer", "null"]', () => {
      expect(getSchemaTypeLabel({ type: ['integer', 'null'] })).toBe('integer | null');
    });

    it('handles OAS 3.1 single-element array type', () => {
      expect(getSchemaTypeLabel({ type: ['string'] })).toBe('string');
    });
  });

  describe('generateExample() with OAS 3.1 array type', () => {
    it('generates string example for type: ["string", "null"]', () => {
      const schema: ResolvedSchema = { type: ['string', 'null'] };
      expect(generateExample(schema)).toBe('string');
    });

    it('generates integer example for type: ["integer", "null"]', () => {
      const schema: ResolvedSchema = { type: ['integer', 'null'] };
      expect(generateExample(schema)).toBe(0);
    });
  });

  describe('flattenSchema() improvements', () => {
    it('preserves format from allOf sub-schema', () => {
      const schema: ResolvedSchema = {
        allOf: [
          { type: 'object', properties: { email: { type: 'string', format: 'email' } } },
          { properties: { name: { type: 'string' } }, required: ['name'] },
        ],
      };
      const result = flattenSchema(schema);
      expect(result.properties).toHaveProperty('email');
      expect(result.properties).toHaveProperty('name');
      expect(result.required).toContain('name');
    });

    it('preserves nullable from allOf sub-schema', () => {
      const schema: ResolvedSchema = {
        allOf: [
          { type: 'object', properties: { id: { type: 'integer' } }, nullable: true },
        ],
      };
      const result = flattenSchema(schema);
      expect(result.nullable).toBe(true);
    });

    it('preserves type and format from allOf sub-schemas', () => {
      const schema: ResolvedSchema = {
        allOf: [
          { type: 'string', format: 'date-time' },
          { description: 'A timestamp' },
        ],
      };
      const result = flattenSchema(schema);
      expect(result.type).toBe('string');
      expect(result.format).toBe('date-time');
      expect(result.description).toBe('A timestamp');
    });

    it('parent schema fields override allOf sub-schema fields', () => {
      const schema: ResolvedSchema = {
        allOf: [
          { type: 'object', properties: { id: { type: 'integer' } } },
        ],
        description: 'Parent description',
        nullable: true,
      };
      const result = flattenSchema(schema);
      expect(result.description).toBe('Parent description');
      expect(result.nullable).toBe(true);
    });
  });
});
