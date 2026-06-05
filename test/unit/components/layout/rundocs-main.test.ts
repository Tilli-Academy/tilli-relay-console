import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/rundocs-main.js';
import type { RunDocsMain } from '../../../../src/components/layout/rundocs-main.js';

describe('rundocs-main', () => {
  it('renders with slot for content', async () => {
    const el = await fixture<RunDocsMain>(
      html`<rundocs-main><p>Hello</p></rundocs-main>`,
    );
    const mainContent = el.shadowRoot!.querySelector('.main-content');
    expect(mainContent).toBeTruthy();
  });

  it('has a slot element', async () => {
    const el = await fixture<RunDocsMain>(
      html`<rundocs-main></rundocs-main>`,
    );
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).toBeTruthy();
  });
});
