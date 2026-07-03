import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/rundocs-icon.js';
import type { RunDocsIcon } from '../../../../src/components/shared/rundocs-icon.js';

describe('rundocs-icon', () => {
  let el: RunDocsIcon;

  beforeEach(async () => {
    el = await fixture<RunDocsIcon>(html`<rundocs-icon name="search"></rundocs-icon>`);
  });

  it('renders an svg element', () => {
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders nothing for unknown icon names', async () => {
    el = await fixture<RunDocsIcon>(html`<rundocs-icon name="nonexistent"></rundocs-icon>`);
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg).toBeNull();
  });

  it('applies custom size', async () => {
    el = await fixture<RunDocsIcon>(html`<rundocs-icon name="search" size=${20}></rundocs-icon>`);
    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg!.style.getPropertyValue('--icon-size')).toBe('20px');
  });

  it('renders different icons based on name', async () => {
    const el1 = await fixture<RunDocsIcon>(html`<rundocs-icon name="search"></rundocs-icon>`);
    const el2 = await fixture<RunDocsIcon>(html`<rundocs-icon name="moon"></rundocs-icon>`);

    const path1 = el1.shadowRoot!.querySelector('svg path');
    const path2 = el2.shadowRoot!.querySelector('svg path');

    expect(path1).toBeTruthy();
    expect(path2).toBeTruthy();
    expect(path1!.getAttribute('d')).not.toBe(path2!.getAttribute('d'));
  });
});
