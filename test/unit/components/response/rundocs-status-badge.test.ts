import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/response/rundocs-status-badge.js';
import type { RunDocsStatusBadge } from '../../../../src/components/response/rundocs-status-badge.js';

describe('rundocs-status-badge', () => {
  it('renders status code and text', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${200} statusText="OK"></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.textContent).toContain('200');
    expect(badge.textContent).toContain('OK');
  });

  it('applies success class for 2xx', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${201}></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.classList.contains('success')).toBe(true);
  });

  it('applies redirect class for 3xx', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${301}></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.classList.contains('redirect')).toBe(true);
  });

  it('applies client-error class for 4xx', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${404}></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.classList.contains('client-error')).toBe(true);
  });

  it('applies server-error class for 5xx', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${500}></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.classList.contains('server-error')).toBe(true);
  });

  it('applies network-error class for status 0', async () => {
    const el = await fixture<RunDocsStatusBadge>(
      html`<rundocs-status-badge status=${0}></rundocs-status-badge>`,
    );
    const badge = el.shadowRoot!.querySelector('.badge')!;
    expect(badge.classList.contains('network-error')).toBe(true);
    expect(badge.textContent).toContain('ERR');
  });
});
