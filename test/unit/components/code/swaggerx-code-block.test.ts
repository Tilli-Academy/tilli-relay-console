import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/code/swaggerx-code-block.js';
import type { SwaggerXCodeBlock } from '../../../../src/components/code/swaggerx-code-block.js';

describe('swaggerx-code-block', () => {
  it('renders code content', async () => {
    const el = await fixture<SwaggerXCodeBlock>(
      html`<swaggerx-code-block code="console.log('hello')"></swaggerx-code-block>`,
    );
    const code = el.shadowRoot!.querySelector('code')!;
    expect(code.textContent).toContain("console.log('hello')");
  });

  it('displays language label', async () => {
    const el = await fixture<SwaggerXCodeBlock>(
      html`<swaggerx-code-block code="test" label="JavaScript"></swaggerx-code-block>`,
    );
    const label = el.shadowRoot!.querySelector('.language-label')!;
    expect(label.textContent).toContain('JavaScript');
  });

  it('renders copy button', async () => {
    const el = await fixture<SwaggerXCodeBlock>(
      html`<swaggerx-code-block code="test"></swaggerx-code-block>`,
    );
    const copyBtn = el.shadowRoot!.querySelector('swaggerx-copy-button');
    expect(copyBtn).toBeTruthy();
  });

  it('falls back to language as label', async () => {
    const el = await fixture<SwaggerXCodeBlock>(
      html`<swaggerx-code-block code="test" language="python"></swaggerx-code-block>`,
    );
    const label = el.shadowRoot!.querySelector('.language-label')!;
    expect(label.textContent).toContain('python');
  });
});
