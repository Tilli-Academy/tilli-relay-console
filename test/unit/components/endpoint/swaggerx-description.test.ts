import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/endpoint/swaggerx-description.js';
import type { SwaggerXDescription } from '../../../../src/components/endpoint/swaggerx-description.js';

describe('swaggerx-description', () => {
  it('renders nothing when text is empty', async () => {
    const el = await fixture<SwaggerXDescription>(
      html`<swaggerx-description></swaggerx-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content');
    expect(content).toBeNull();
  });

  it('renders markdown text as HTML', async () => {
    const el = await fixture<SwaggerXDescription>(
      html`<swaggerx-description text="This is **bold** text."></swaggerx-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    expect(content.innerHTML).toContain('<strong>');
    expect(content.textContent).toContain('bold');
  });

  it('renders inline code', async () => {
    const el = await fixture<SwaggerXDescription>(
      html`<swaggerx-description text="Use \`GET\` method."></swaggerx-description>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    expect(content.innerHTML).toContain('<code>');
    expect(content.textContent).toContain('GET');
  });
});
