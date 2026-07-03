import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/response/rundocs-response-body.js';
import type { RunDocsResponseBody } from '../../../../src/components/response/rundocs-response-body.js';

describe('rundocs-response-body', () => {
  it('shows empty state when no body', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body></rundocs-response-body>`,
    );
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toContain('No response body');
  });

  it('renders body content in CodeMirror', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="Hello, World!"></rundocs-response-body>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.body-content');
    expect(wrapper).toBeTruthy();
    const cmEditor = wrapper!.querySelector('.cm-editor');
    expect(cmEditor).toBeTruthy();
    const cmContent = wrapper!.querySelector('.cm-content');
    expect(cmContent!.textContent).toContain('Hello, World!');
  });

  it('pretty-prints JSON body', async () => {
    const json = '{"name":"test","value":42}';
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body=${json} content-type="application/json"></rundocs-response-body>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.body-content')!;
    const cmContent = wrapper.querySelector('.cm-content')!;
    expect(cmContent.textContent).toContain('"name": "test"');
    expect(cmContent.textContent).toContain('"value": 42');
  });

  it('shows raw body when JSON parsing fails', async () => {
    const invalid = 'not json {';
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body=${invalid} content-type="application/json"></rundocs-response-body>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.body-content')!;
    const cmContent = wrapper.querySelector('.cm-content')!;
    expect(cmContent.textContent).toContain('not json {');
  });

  it('displays content type label', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="data" content-type="text/html"></rundocs-response-body>`,
    );
    const ct = el.shadowRoot!.querySelector('.content-type')!;
    expect(ct.textContent).toContain('text/html');
  });

  it('shows copy button', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="data"></rundocs-response-body>`,
    );
    const copyBtn = el.shadowRoot!.querySelector('rundocs-copy-button');
    expect(copyBtn).toBeTruthy();
  });

  it('has word wrap toggle', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="data"></rundocs-response-body>`,
    );
    const toggle = el.shadowRoot!.querySelector('.wrap-toggle');
    expect(toggle).toBeTruthy();
    expect(toggle!.textContent).toContain('Word Wrap');
  });

  it('has line numbers', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="data"></rundocs-response-body>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.body-content')!;
    const gutters = wrapper.querySelector('.cm-lineNumbers');
    expect(gutters).toBeTruthy();
  });

  it('is read-only', async () => {
    const el = await fixture<RunDocsResponseBody>(
      html`<rundocs-response-body body="data"></rundocs-response-body>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.body-content')!;
    const cmContent = wrapper.querySelector('.cm-content') as HTMLElement;
    expect(cmContent).toBeTruthy();
    expect(cmContent.getAttribute('contenteditable')).toBe('false');
  });
});
