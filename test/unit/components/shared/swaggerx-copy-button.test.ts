import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/swaggerx-copy-button.js';
import type { SwaggerXCopyButton } from '../../../../src/components/shared/swaggerx-copy-button.js';

describe('swaggerx-copy-button', () => {
  it('renders a button', async () => {
    const el = await fixture<SwaggerXCopyButton>(
      html`<swaggerx-copy-button text="hello"></swaggerx-copy-button>`,
    );
    const btn = el.shadowRoot!.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toContain('Copy');
  });

  it('has aria-label for accessibility', async () => {
    const el = await fixture<SwaggerXCopyButton>(
      html`<swaggerx-copy-button text="test"></swaggerx-copy-button>`,
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Copy to clipboard');
  });

  it('renders copy icon', async () => {
    const el = await fixture<SwaggerXCopyButton>(
      html`<swaggerx-copy-button text="test"></swaggerx-copy-button>`,
    );
    const icon = el.shadowRoot!.querySelector('swaggerx-icon');
    expect(icon).toBeTruthy();
  });
});
