import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/endpoint/swaggerx-method-badge.js';
import type { SwaggerXMethodBadge } from '../../../../src/components/endpoint/swaggerx-method-badge.js';

describe('swaggerx-method-badge', () => {
  it('renders method text in uppercase', async () => {
    const el = await fixture<SwaggerXMethodBadge>(
      html`<swaggerx-method-badge method="get"></swaggerx-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('GET');
  });

  it('renders POST method', async () => {
    const el = await fixture<SwaggerXMethodBadge>(
      html`<swaggerx-method-badge method="post"></swaggerx-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('POST');
  });

  it('renders compact label (3 chars)', async () => {
    const el = await fixture<SwaggerXMethodBadge>(
      html`<swaggerx-method-badge method="delete" ?compact=${true}></swaggerx-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('DEL');
  });

  it('renders full label when not compact', async () => {
    const el = await fixture<SwaggerXMethodBadge>(
      html`<swaggerx-method-badge method="delete"></swaggerx-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('DELETE');
  });
});
