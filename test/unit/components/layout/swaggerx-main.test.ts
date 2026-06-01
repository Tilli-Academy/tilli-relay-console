import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/swaggerx-main.js';
import type { SwaggerXMain } from '../../../../src/components/layout/swaggerx-main.js';

describe('swaggerx-main', () => {
  it('renders with slot for content', async () => {
    const el = await fixture<SwaggerXMain>(
      html`<swaggerx-main><p>Hello</p></swaggerx-main>`,
    );
    const mainContent = el.shadowRoot!.querySelector('.main-content');
    expect(mainContent).toBeTruthy();
  });

  it('has a slot element', async () => {
    const el = await fixture<SwaggerXMain>(
      html`<swaggerx-main></swaggerx-main>`,
    );
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).toBeTruthy();
  });
});
