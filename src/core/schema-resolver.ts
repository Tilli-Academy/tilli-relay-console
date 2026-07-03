import type { ResolvedSchema } from './types.js';

const MAX_DEPTH = 10;

/**
 * Normalizes OAS 3.1 array `type` (e.g., ["string", "null"]) into a
 * single type string and a nullable flag.
 */
function normalizeType(schema: ResolvedSchema): { type: string | undefined; nullable: boolean } {
  const rawType = schema.type;
  if (Array.isArray(rawType)) {
    const types = rawType.filter((t) => t !== 'null');
    return {
      type: types[0] || undefined,
      nullable: rawType.includes('null'),
    };
  }
  return {
    type: rawType,
    nullable: schema.nullable === true,
  };
}

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

  // Normalize OAS 3.1 array type
  const { type } = normalizeType(schema);

  // Handle by type
  switch (type) {
    case 'object':
      return generateObjectExample(schema, depth);
    case 'array':
      return generateArrayExample(schema, depth);
    case 'string':
      return generateStringExample(schema);
    case 'number':
    case 'integer':
      return generateNumberExample(schema, type);
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

function generateNumberExample(schema: ResolvedSchema, type: string): number {
  if (schema.minimum !== undefined) return schema.minimum;
  if (schema.maximum !== undefined) return schema.maximum;
  if (type === 'integer') return 0;
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
    // Merge additional scalar fields (last-wins for conflicts)
    if (flat.type) merged.type = flat.type;
    if (flat.format) merged.format = flat.format;
    if (flat.enum) merged.enum = flat.enum;
    if (flat.nullable !== undefined) merged.nullable = flat.nullable;
    if (flat.additionalProperties !== undefined) {
      merged.additionalProperties = flat.additionalProperties;
    }
    if (flat.title && !merged.title) merged.title = flat.title;
    if (flat.minimum !== undefined) merged.minimum = flat.minimum;
    if (flat.maximum !== undefined) merged.maximum = flat.maximum;
    if (flat.minLength !== undefined) merged.minLength = flat.minLength;
    if (flat.maxLength !== undefined) merged.maxLength = flat.maxLength;
    if (flat.pattern) merged.pattern = flat.pattern;
  }

  // Copy over any direct properties from the parent schema (overrides allOf)
  if (schema.properties) {
    merged.properties = { ...merged.properties, ...schema.properties };
  }
  if (schema.required) {
    merged.required = [...(merged.required || []), ...schema.required];
  }
  if (schema.description) merged.description = schema.description;
  if (schema.nullable !== undefined) merged.nullable = schema.nullable;
  if (schema.format) merged.format = schema.format;

  return merged;
}

/**
 * Gets a human-readable type string for a schema.
 * Examples: "string", "integer", "object", "string[]", "Pet", "string (email)",
 *           "string | null", "integer | null"
 */
export function getSchemaTypeLabel(schema: ResolvedSchema): string {
  if (schema.title) return schema.title;

  const { type, nullable } = normalizeType(schema);

  if (type === 'array' && schema.items) {
    const itemType = getSchemaTypeLabel(schema.items);
    const label = `${itemType}[]`;
    return nullable ? `${label} | null` : label;
  }

  if (schema.oneOf) return schema.oneOf.map(getSchemaTypeLabel).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(getSchemaTypeLabel).join(' | ');
  if (schema.allOf) {
    return nullable ? 'object | null' : 'object';
  }
  if (schema.enum) {
    const label = `enum(${schema.enum.join(', ')})`;
    return nullable ? `${label} | null` : label;
  }

  const base = type || 'any';
  let label: string;
  if (schema.format) {
    label = `${base} (${schema.format})`;
  } else {
    label = base;
  }
  return nullable ? `${label} | null` : label;
}
