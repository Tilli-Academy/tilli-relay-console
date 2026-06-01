import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-icon.js';
import type { SwaggerXIcon } from '../../../../src/components/shared/swaggerx-icon.js';

describe('swaggerx-icon', () => {
  let el: SwaggerXIcon;

  beforeEach(async () => {
    el = await fixture<SwaggerXIcon>(html`<swaggerx-icon name="search"></swaggerx-icon>`);
  });

  it('renders an svg element', () => {
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders nothing for unknown icon names', async () => {
    el = await fixture<SwaggerXIcon>(html`<swaggerx-icon name="nonexistent"></swaggerx-icon>`);
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg).toBeNull();
  });

  it('applies custom size', async () => {
    el = await fixture<SwaggerXIcon>(html`<swaggerx-icon name="search" size=${20}></swaggerx-icon>`);
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg!.style.getPropertyValue('--icon-size')).toBe('20px');
  });

  it('renders different icons based on name', async () => {
    const el1 = await fixture<SwaggerXIcon>(html`<swaggerx-icon name="search"></swaggerx-icon>`);
    const el2 = await fixture<SwaggerXIcon>(html`<swaggerx-icon name="moon"></swaggerx-icon>`);

    const path1 = el1.shadowRoot!.querySelector('svg path');
    const path2 = el2.shadowRoot!.querySelector('svg path');

    expect(path1).toBeTruthy();
    expect(path2).toBeTruthy();
    expect(path1!.getAttribute('d')).not.toBe(path2!.getAttribute('d'));
  });
});
