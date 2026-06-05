import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/endpoint/rundocs-method-badge.js';
import type { RunDocsMethodBadge } from '../../../../src/components/endpoint/rundocs-method-badge.js';

describe('rundocs-method-badge', () => {
  it('renders method text in uppercase', async () => {
    const el = await fixture<RunDocsMethodBadge>(
      html`<rundocs-method-badge method="get"></rundocs-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('GET');
  });

  it('renders POST method', async () => {
    const el = await fixture<RunDocsMethodBadge>(
      html`<rundocs-method-badge method="post"></rundocs-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('POST');
  });

  it('renders compact label (3 chars)', async () => {
    const el = await fixture<RunDocsMethodBadge>(
      html`<rundocs-method-badge method="delete" ?compact=${true}></rundocs-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('DEL');
  });

  it('renders full label when not compact', async () => {
    const el = await fixture<RunDocsMethodBadge>(
      html`<rundocs-method-badge method="delete"></rundocs-method-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.method-badge')!;
    expect(badge.textContent!.trim()).toBe('DELETE');
  });
});
