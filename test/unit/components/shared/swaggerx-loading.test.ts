import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-loading.js';
import type { SwaggerXLoading } from '../../../../src/components/shared/swaggerx-loading.js';

describe('swaggerx-loading', () => {
  let el: SwaggerXLoading;

  beforeEach(async () => {
    el = await fixture<SwaggerXLoading>(html`<swaggerx-loading></swaggerx-loading>`);
  });

  it('renders a spinner', () => {
    const spinner = el.shadowRoot!.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('does not render message by default', () => {
    const message = el.shadowRoot!.querySelector('.message');
    expect(message).toBeNull();
  });

  it('renders message when provided', async () => {
    el = await fixture<SwaggerXLoading>(html`<swaggerx-loading message="Loading..."></swaggerx-loading>`);
    const message = el.shadowRoot!.querySelector('.message');
    expect(message).toBeTruthy();
    expect(message!.textContent).toBe('Loading...');
  });
});
