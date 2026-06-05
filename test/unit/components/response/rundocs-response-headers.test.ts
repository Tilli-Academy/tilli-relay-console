import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/response/rundocs-response-headers.js';
import type { RunDocsResponseHeaders } from '../../../../src/components/response/rundocs-response-headers.js';

describe('rundocs-response-headers', () => {
  it('shows empty state when no headers', async () => {
    const el = await fixture<RunDocsResponseHeaders>(
      html`<rundocs-response-headers></rundocs-response-headers>`,
    );
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toContain('No response headers');
  });

  it('renders headers in a table', async () => {
    const headers = { 'content-type': 'application/json', 'x-request-id': 'abc123' };
    const el = await fixture<RunDocsResponseHeaders>(
      html`<rundocs-response-headers .headers=${headers}></rundocs-response-headers>`,
    );
    const rows = el.shadowRoot!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('displays header names and values', async () => {
    const headers = { 'content-type': 'application/json' };
    const el = await fixture<RunDocsResponseHeaders>(
      html`<rundocs-response-headers .headers=${headers}></rundocs-response-headers>`,
    );
    const names = el.shadowRoot!.querySelectorAll('.header-name');
    const values = el.shadowRoot!.querySelectorAll('.header-value');
    expect(names[0].textContent).toBe('content-type');
    expect(values[0].textContent).toBe('application/json');
  });

  it('renders table headers', async () => {
    const headers = { 'x-test': 'value' };
    const el = await fixture<RunDocsResponseHeaders>(
      html`<rundocs-response-headers .headers=${headers}></rundocs-response-headers>`,
    );
    const ths = el.shadowRoot!.querySelectorAll('th');
    expect(ths.length).toBe(2);
    expect(ths[0].textContent).toBe('Name');
    expect(ths[1].textContent).toBe('Value');
  });
});
