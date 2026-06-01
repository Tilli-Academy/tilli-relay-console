import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/endpoint/swaggerx-method-badge.js';
import type { SwaggerXMethodBadge } from '../../../../src/components/endpoint/swaggerx-method-badge.js';

describe('swaggerx-method-badge', () => {
  let el: SwaggerXMethodBadge;

  beforeEach(async () => {
    el = await fixture<SwaggerXMethodBadge>(html`<swaggerx-method-badge method="get"></swaggerx-method-badge>`);
  });

  it('renders the method text', () => {
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('GET');
  });

  it('renders POST badge', async () => {
    el = await fixture<SwaggerXMethodBadge>(html`<swaggerx-method-badge method="post"></swaggerx-method-badge>`);
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('POST');
  });

  it('renders compact form (3 chars)', async () => {
    el = await fixture<SwaggerXMethodBadge>(html`<swaggerx-method-badge method="delete" compact></swaggerx-method-badge>`);
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('DEL');
  });

  it('applies method-specific CSS class for colors', () => {
    const badge = el.shadowRoot!.querySelector('.method-badge') as HTMLElement;
    // GET should have the 'get' CSS class for color styling
    expect(badge.classList.contains('get')).toBe(true);
  });

  it('renders all HTTP methods', async () => {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
    for (const method of methods) {
      el = await fixture<SwaggerXMethodBadge>(html`<swaggerx-method-badge method=${method}></swaggerx-method-badge>`);
      const badge = el.shadowRoot!.querySelector('.method-badge');
      expect(badge!.textContent!.trim()).toBe(method.toUpperCase());
    }
  });
});
