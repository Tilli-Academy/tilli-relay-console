import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/endpoint/rundocs-description.js';
import type { RunDocsDescription } from '../../../../src/components/endpoint/rundocs-description.js';

describe('rundocs-description', () => {
  it('renders nothing when text is empty', async () => {
    const el = await fixture<RunDocsDescription>(
      html`<rundocs-description></rundocs-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content');
    expect(content).toBeNull();
  });

  it('renders markdown text as HTML', async () => {
    const el = await fixture<RunDocsDescription>(
      html`<rundocs-description text="This is **bold** text."></rundocs-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    expect(content.innerHTML).toContain('<strong>');
    expect(content.textContent).toContain('bold');
  });

  it('renders inline code', async () => {
    const el = await fixture<RunDocsDescription>(
      html`<rundocs-description text="Use \`GET\` method."></rundocs-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    expect(content.innerHTML).toContain('<code>');
    expect(content.textContent).toContain('GET');
  });
});
