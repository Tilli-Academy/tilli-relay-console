import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/endpoint/swaggerx-path-display.js';
import type { SwaggerXPathDisplay } from '../../../../src/components/endpoint/swaggerx-path-display.js';

describe('swaggerx-path-display', () => {
  let el: SwaggerXPathDisplay;

  beforeEach(async () => {
    el = await fixture<SwaggerXPathDisplay>(html`
      <swaggerx-path-display path="/pets/{petId}"></swaggerx-path-display>
    `);
  });

  it('renders the full path', () => {
    const path = el.shadowRoot!.querySelector('.path');
    expect(path!.textContent).toContain('/pets/');
    expect(path!.textContent).toContain('{petId}');
  });

  it('highlights path parameters', () => {
    const params = el.shadowRoot!.querySelectorAll('.param');
    expect(params.length).toBe(1);
    expect(params[0].textContent).toBe('{petId}');
  });

  it('highlights multiple path parameters', async () => {
    el = await fixture<SwaggerXPathDisplay>(html`
      <swaggerx-path-display path="/pets/{petId}/toys/{toyId}"></swaggerx-path-display>
    `);
    const params = el.shadowRoot!.querySelectorAll('.param');
    expect(params.length).toBe(2);
    expect(params[0].textContent).toBe('{petId}');
    expect(params[1].textContent).toBe('{toyId}');
  });

  it('renders path without parameters as plain text', async () => {
    el = await fixture<SwaggerXPathDisplay>(html`
      <swaggerx-path-display path="/pets"></swaggerx-path-display>
    `);
    const params = el.shadowRoot!.querySelectorAll('.param');
    expect(params.length).toBe(0);
    expect(el.shadowRoot!.querySelector('.path')!.textContent!.trim()).toBe('/pets');
  });
});
