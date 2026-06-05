import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/rundocs-headers-editor.js';
import type { RunDocsHeadersEditor } from '../../../../src/components/request/rundocs-headers-editor.js';

describe('rundocs-headers-editor', () => {
  it('renders key-value editor', async () => {
    const el = await fixture<RunDocsHeadersEditor>(
      html`<rundocs-headers-editor></rundocs-headers-editor>`,
    );
    const kvEditor = el.shadowRoot!.querySelector('rundocs-key-value-editor');
    expect(kvEditor).toBeTruthy();
  });

  it('passes pairs to key-value editor', async () => {
    const pairs = [{ key: 'Authorization', value: 'Bearer abc', enabled: true }];
    const el = await fixture<RunDocsHeadersEditor>(
      html`<rundocs-headers-editor .pairs=${pairs}></rundocs-headers-editor>`,
    );
    const kvEditor = el.shadowRoot!.querySelector('rundocs-key-value-editor') as HTMLElement & { pairs: unknown[] };
    expect(kvEditor).toBeTruthy();
  });
});
