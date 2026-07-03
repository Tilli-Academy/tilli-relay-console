import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/endpoint/rundocs-method-badge.js';
import type { RunDocsMethodBadge } from '../../../../src/components/endpoint/rundocs-method-badge.js';

describe('rundocs-method-badge', () => {
  let el: RunDocsMethodBadge;

  beforeEach(async () => {
    el = await fixture<RunDocsMethodBadge>(html`<rundocs-method-badge method="get"></rundocs-method-badge>`);
  });

  it('renders the method text', () => {
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('GET');
  });

  it('renders POST badge', async () => {
    el = await fixture<RunDocsMethodBadge>(html`<rundocs-method-badge method="post"></rundocs-method-badge>`);
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('POST');
  });

  it('renders compact form (3 chars)', async () => {
    el = await fixture<RunDocsMethodBadge>(html`<rundocs-method-badge method="delete" compact></rundocs-method-badge>`);
    const badge = el.shadowRoot!.querySelector('.method-badge');
    expect(badge!.textContent!.trim()).toBe('DEL');
  });

  it('applies method-specific CSS class for colors', () => {
    const badge = el.shadowRoot!.querySelector('.method-badge') as HTMLElement;
    // GET should have the 'get' CSS class for color styling
    expect(badge.classList.contains('get')).toBe(true);
  });

  it('renders all HTTP methods', async () => {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
    for (const method of methods) {
      el = await fixture<RunDocsMethodBadge>(html`<rundocs-method-badge method=${method}></rundocs-method-badge>`);
      const badge = el.shadowRoot!.querySelector('.method-badge');
      expect(badge!.textContent!.trim()).toBe(method.toUpperCase());
    }
  });
});
