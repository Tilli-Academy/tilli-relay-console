import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/rundocs-copy-button.js';
import type { RunDocsCopyButton } from '../../../../src/components/shared/rundocs-copy-button.js';

describe('rundocs-copy-button', () => {
  it('renders a button', async () => {
    const el = await fixture<RunDocsCopyButton>(
      html`<rundocs-copy-button text="hello"></rundocs-copy-button>`,
    );
    const btn = el.shadowRoot!.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toContain('Copy');
  });

  it('has aria-label for accessibility', async () => {
    const el = await fixture<RunDocsCopyButton>(
      html`<rundocs-copy-button text="test"></rundocs-copy-button>`,
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Copy to clipboard');
  });

  it('renders copy icon', async () => {
    const el = await fixture<RunDocsCopyButton>(
      html`<rundocs-copy-button text="test"></rundocs-copy-button>`,
    );
    const icon = el.shadowRoot!.querySelector('rundocs-icon');
    expect(icon).toBeTruthy();
  });
});
