import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-badge.js';
import type { SwaggerXBadge } from '../../../../src/components/shared/swaggerx-badge.js';

describe('swaggerx-badge', () => {
  let el: SwaggerXBadge;

  beforeEach(async () => {
    el = await fixture<SwaggerXBadge>(html`<swaggerx-badge variant="success">200</swaggerx-badge>`);
  });

  it('renders slotted content', () => {
    expect(el.textContent).toBe('200');
  });

  it('applies variant styles', () => {
    const badge = el.shadowRoot!.querySelector('.badge') as HTMLElement;
    expect(badge.classList.contains('success')).toBe(true);
  });

  it('defaults to default variant', async () => {
    el = await fixture<SwaggerXBadge>(html`<swaggerx-badge>Tag</swaggerx-badge>`);
    const badge = el.shadowRoot!.querySelector('.badge') as HTMLElement;
    expect(badge.classList.contains('default')).toBe(true);
  });
});
