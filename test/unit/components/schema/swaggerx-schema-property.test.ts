import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/schema/swaggerx-schema-property.js';
import type { SwaggerXSchemaProperty } from '../../../../src/components/schema/swaggerx-schema-property.js';
import type { ResolvedSchema } from '../../../../src/core/types.js';

describe('swaggerx-schema-property', () => {
  it('renders property name and type', async () => {
    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="id"
        .schema=${{ type: 'integer' }}
      ></swaggerx-schema-property>
    `);

    const name = el.shadowRoot!.querySelector('.prop-name');
    expect(name!.textContent).toBe('id');

    const type = el.shadowRoot!.querySelector('.prop-type');
    expect(type!.textContent).toBe('integer');
  });

  it('shows required indicator', async () => {
    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="name"
        .schema=${{ type: 'string' }}
        required
      ></swaggerx-schema-property>
    `);

    const required = el.shadowRoot!.querySelector('.prop-required');
    expect(required).toBeTruthy();
    expect(required!.textContent).toBe('required');
  });

  it('renders description', async () => {
    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="tag"
        .schema=${{ type: 'string', description: 'Optional tag for the pet' }}
      ></swaggerx-schema-property>
    `);

    const desc = el.shadowRoot!.querySelector('.prop-description');
    expect(desc!.textContent).toBe('Optional tag for the pet');
  });

  it('renders enum values', async () => {
    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="status"
        .schema=${{ type: 'string', enum: ['available', 'pending', 'sold'] }}
      ></swaggerx-schema-property>
    `);

    const enumValues = el.shadowRoot!.querySelector('.enum-values');
    expect(enumValues).toBeTruthy();
    expect(enumValues!.textContent).toContain('available');
    expect(enumValues!.textContent).toContain('pending');
    expect(enumValues!.textContent).toContain('sold');
  });

  it('renders constraints', async () => {
    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="limit"
        .schema=${{ type: 'integer', minimum: 1, maximum: 100 }}
      ></swaggerx-schema-property>
    `);

    const constraints = el.shadowRoot!.querySelectorAll('.constraint');
    expect(constraints.length).toBe(2);
    expect(constraints[0].textContent).toBe('>= 1');
    expect(constraints[1].textContent).toBe('<= 100');
  });

  it('renders nested object properties', async () => {
    const schema: ResolvedSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    };

    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="pet"
        .schema=${schema}
      ></swaggerx-schema-property>
    `);

    const children = el.shadowRoot!.querySelector('.children');
    expect(children).toBeTruthy();

    const childProps = children!.querySelectorAll('swaggerx-schema-property');
    expect(childProps.length).toBe(2);
  });

  it('has toggle button for nested properties', async () => {
    const schema: ResolvedSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
    };

    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="pet"
        .schema=${schema}
      ></swaggerx-schema-property>
    `);

    const toggle = el.shadowRoot!.querySelector('.toggle-btn');
    expect(toggle).toBeTruthy();
  });

  it('collapses children on toggle click', async () => {
    const schema: ResolvedSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
    };

    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="pet"
        .schema=${schema}
      ></swaggerx-schema-property>
    `);

    // Initially expanded
    expect(el.shadowRoot!.querySelector('.children')).toBeTruthy();

    // Click toggle
    const toggle = el.shadowRoot!.querySelector('.toggle-btn') as HTMLButtonElement;
    toggle.click();
    await el.updateComplete;

    // Children should be hidden
    expect(el.shadowRoot!.querySelector('.children')).toBeNull();
  });

  it('renders array item properties', async () => {
    const schema: ResolvedSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
        },
      },
    };

    const el = await fixture<SwaggerXSchemaProperty>(html`
      <swaggerx-schema-property
        name="pets"
        .schema=${schema}
      ></swaggerx-schema-property>
    `);

    const children = el.shadowRoot!.querySelector('.children');
    expect(children).toBeTruthy();
  });
});
