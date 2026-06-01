import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/schema/swaggerx-schema-view.js';
import type { SwaggerXSchemaView } from '../../../../src/components/schema/swaggerx-schema-view.js';
import type { ResolvedSchema } from '../../../../src/core/types.js';

const petSchema: ResolvedSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    name: { type: 'string', example: 'Buddy' },
    tag: { type: 'string', description: 'Optional tag' },
    status: { type: 'string', enum: ['available', 'pending', 'sold'] },
  },
  required: ['id', 'name'],
};

describe('swaggerx-schema-view', () => {
  let el: SwaggerXSchemaView;

  beforeEach(async () => {
    el = await fixture<SwaggerXSchemaView>(html`
      <swaggerx-schema-view .schema=${petSchema} title="Pet"></swaggerx-schema-view>
    `);
  });

  it('renders the title', () => {
    const title = el.shadowRoot!.querySelector('.schema-title');
    expect(title!.textContent).toBe('Pet');
  });

  it('renders tabs for schema and example', () => {
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeTruthy();
  });

  it('renders schema properties by default', () => {
    const properties = el.shadowRoot!.querySelectorAll('swaggerx-schema-property');
    expect(properties.length).toBe(4); // id, name, tag, status
  });

  it('switches to example view on tab click', async () => {
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs')!;
    tabs.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: 'example' } }));
    await el.updateComplete;

    const exampleCode = el.shadowRoot!.querySelector('.example-code');
    expect(exampleCode).toBeTruthy();
    const text = exampleCode!.textContent!;
    // Should contain the example values
    expect(text).toContain('"id": 1');
    expect(text).toContain('"name": "Buddy"');
  });

  it('renders copy button in example view', async () => {
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs')!;
    tabs.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: 'example' } }));
    await el.updateComplete;

    const copyBtn = el.shadowRoot!.querySelector('swaggerx-copy-button');
    expect(copyBtn).toBeTruthy();
  });

  it('handles empty schema', async () => {
    el = await fixture<SwaggerXSchemaView>(html`
      <swaggerx-schema-view .schema=${{}}></swaggerx-schema-view>
    `);
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toContain('No properties defined');
  });
});
