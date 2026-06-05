import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/rundocs-badge.js';
import type { RunDocsBadge } from '../../../../src/components/shared/rundocs-badge.js';

describe('rundocs-badge', () => {
  let el: RunDocsBadge;

  beforeEach(async () => {
    el = await fixture<RunDocsBadge>(html`<rundocs-badge variant="success">200</rundocs-badge>`);
  });

  it('renders slotted content', () => {
    expect(el.textContent).toBe('200');
  });

  it('applies variant styles', () => {
    const badge = el.shadowRoot!.querySelector('.badge') as HTMLElement;
    expect(badge.classList.contains('success')).toBe(true);
  });

  it('defaults to default variant', async () => {
    el = await fixture<RunDocsBadge>(html`<rundocs-badge>Tag</rundocs-badge>`);
    const badge = el.shadowRoot!.querySelector('.badge') as HTMLElement;
    expect(badge.classList.contains('default')).toBe(true);
  });
});
