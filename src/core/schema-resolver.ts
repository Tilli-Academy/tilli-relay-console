import type { ResolvedSchema } from './types.js';

const MAX_DEPTH = 10;

/**
 * Generates an example value from a resolved OpenAPI schema.
 * Handles nested objects, arrays, allOf/oneOf/anyOf, and circular refs.
 */
export function generateExample(schema: ResolvedSchema, depth = 0): unknown {
  if (depth > MAX_DEPTH) return {};

  // If schema has an explicit example, use it
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  // Handle enum — use first value
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];

  // Handle composition keywords
  if (schema.allOf && schema.allOf.length > 0) {
    return mergeAllOf(schema.allOf, depth);
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateExample(schema.oneOf[0], depth + 1);
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateExample(schema.anyOf[0], depth + 1);
  }

  // Handle by type
  switch (schema.type) {
    case 'object':
      return generateObjectExample(schema, depth);
    case 'array':
      return generateArrayExample(schema, depth);
    case 'string':
      return generateStringExample(schema);
    case 'number':
    case 'integer':
      return generateNumberExample(schema);
    case 'boolean':
      return true;
    case 'null':
      return null;
    default:
      // No type specified — try to infer from properties
      if (schema.properties) return generateObjectExample(schema, depth);
      return {};
  }
}

function generateObjectExample(schema: ResolvedSchema, depth: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (!schema.properties) return result;

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    result[key] = generateExample(propSchema, depth + 1);
  }

  return result;
}

function generateArrayExample(schema: ResolvedSchema, depth: number): unknown[] {
  if (!schema.items) return [];
  return [generateExample(schema.items, depth + 1)];
}

function generateStringExample(schema: ResolvedSchema): string {
  if (schema.enum && schema.enum.length > 0) return String(schema.enum[0]);

  switch (schema.format) {
    case 'date':
      return '2024-01-15';
    case 'date-time':
      return '2024-01-15T09:30:00Z';
    case 'email':
      return 'user@example.com';
    case 'uri':
    case 'url':
      return 'https://example.com';
    case 'uuid':
      return '550e8400-e29b-41d4-a716-446655440000';
    case 'hostname':
      return 'example.com';
    case 'ipv4':
      return '192.168.1.1';
    case 'ipv6':
      return '::1';
    case 'byte':
      return 'dGVzdA==';
    case 'binary':
      return '<binary>';
    case 'password':
      return '********';
    default:
      return 'string';
  }
}

function generateNumberExample(schema: ResolvedSchema): number {
  if (schema.minimum !== undefined) return schema.minimum;
  if (schema.maximum !== undefined) return schema.maximum;
  if (schema.type === 'integer') return 0;
  return 0.0;
}

function mergeAllOf(schemas: ResolvedSchema[], depth: number): unknown {
  const merged: Record<string, unknown> = {};

  for (const schema of schemas) {
    const example = generateExample(schema, depth + 1);
    if (typeof example === 'object' && example !== null && !Array.isArray(example)) {
      Object.assign(merged, example);
    }
  }

  return merged;
}

/**
 * Flattens a schema by resolving allOf compositions into a single schema.
 * Useful for displaying a unified property list in the UI.
 */
export function flattenSchema(schema: ResolvedSchema): ResolvedSchema {
  if (!schema.allOf || schema.allOf.length === 0) return schema;

  const merged: ResolvedSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const subSchema of schema.allOf) {
    const flat = flattenSchema(subSchema);
    if (flat.properties) {
      merged.properties = { ...merged.properties, ...flat.properties };
    }
    if (flat.required) {
      merged.required = [...(merged.required || []), ...flat.required];
    }
    if (flat.description && !merged.description) {
      merged.description = flat.description;
    }
  }

  // Copy over any direct properties from the parent schema
  if (schema.properties) {
    merged.properties = { ...merged.properties, ...schema.properties };
  }
  if (schema.required) {
    merged.required = [...(merged.required || []), ...schema.required];
  }

  return merged;
}

/**
 * Gets a human-readable type string for a schema.
 * Examples: "string", "integer", "object", "string[]", "Pet", "string (email)"
 */
export function getSchemaTypeLabel(schema: ResolvedSchema): string {
  if (schema.title) return schema.title;

  if (schema.type === 'array' && schema.items) {
    const itemType = getSchemaTypeLabel(schema.items);
    return `${itemType}[]`;
  }

  if (schema.oneOf) return schema.oneOf.map(getSchemaTypeLabel).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(getSchemaTypeLabel).join(' | ');
  if (schema.allOf) return 'object';
  if (schema.enum) return `enum(${schema.enum.join(', ')})`;

  const base = schema.type || 'any';
  if (schema.format) return `${base} (${schema.format})`;
  return base;
}
