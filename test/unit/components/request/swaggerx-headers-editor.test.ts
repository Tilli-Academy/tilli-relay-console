import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/swaggerx-headers-editor.js';
import type { SwaggerXHeadersEditor } from '../../../../src/components/request/swaggerx-headers-editor.js';

describe('swaggerx-headers-editor', () => {
  it('renders key-value editor', async () => {
    const el = await fixture<SwaggerXHeadersEditor>(
      html`<swaggerx-headers-editor></swaggerx-headers-editor>`,
    );
    const kvEditor = el.shadowRoot!.querySelector('swaggerx-key-value-editor');
    expect(kvEditor).toBeTruthy();
  });

  it('passes pairs to key-value editor', async () => {
    const pairs = [{ key: 'Authorization', value: 'Bearer abc', enabled: true }];
    const el = await fixture<SwaggerXHeadersEditor>(
      html`<swaggerx-headers-editor .pairs=${pairs}></swaggerx-headers-editor>`,
    );
    const kvEditor = el.shadowRoot!.querySelector('swaggerx-key-value-editor') as HTMLElement & { pairs: unknown[] };
    expect(kvEditor).toBeTruthy();
  });
});
