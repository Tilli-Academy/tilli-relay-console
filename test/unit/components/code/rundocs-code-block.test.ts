import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/code/rundocs-code-block.js';
import type { RunDocsCodeBlock } from '../../../../src/components/code/rundocs-code-block.js';

describe('rundocs-code-block', () => {
  it('renders code content', async () => {
    const el = await fixture<RunDocsCodeBlock>(
      html`<rundocs-code-block code="console.log('hello')"></rundocs-code-block>`,
    );
    const code = el.shadowRoot!.querySelector('code')!;
    expect(code.textContent).toContain("console.log('hello')");
  });

  it('displays language label', async () => {
    const el = await fixture<RunDocsCodeBlock>(
      html`<rundocs-code-block code="test" label="JavaScript"></rundocs-code-block>`,
    );
    const label = el.shadowRoot!.querySelector('.language-label')!;
    expect(label.textContent).toContain('JavaScript');
  });

  it('renders copy button', async () => {
    const el = await fixture<RunDocsCodeBlock>(
      html`<rundocs-code-block code="test"></rundocs-code-block>`,
    );
    const copyBtn = el.shadowRoot!.querySelector('rundocs-copy-button');
    expect(copyBtn).toBeTruthy();
  });

  it('falls back to language as label', async () => {
    const el = await fixture<RunDocsCodeBlock>(
      html`<rundocs-code-block code="test" language="python"></rundocs-code-block>`,
    );
    const label = el.shadowRoot!.querySelector('.language-label')!;
    expect(label.textContent).toContain('python');
  });
});
