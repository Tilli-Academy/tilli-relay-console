import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/swaggerx-header.js';
import type { SwaggerXHeader } from '../../../../src/components/layout/swaggerx-header.js';

describe('swaggerx-header', () => {
  it('renders logo text', async () => {
    const el = await fixture<SwaggerXHeader>(
      html`<swaggerx-header></swaggerx-header>`,
    );
    const logo = el.shadowRoot!.querySelector('.logo')!;
    expect(logo.textContent).toContain('SwaggerX');
  });

  it('shows API title when provided', async () => {
    const el = await fixture<SwaggerXHeader>(
      html`<swaggerx-header api-title="Pet Store" api-version="3.0"></swaggerx-header>`,
    );
    const title = el.shadowRoot!.querySelector('.api-title')!;
    expect(title.textContent).toContain('Pet Store');
    const version = el.shadowRoot!.querySelector('.api-version')!;
    expect(version.textContent).toContain('v3.0');
  });

  it('fires theme-toggle on theme button click', async () => {
    const el = await fixture<SwaggerXHeader>(
      html`<swaggerx-header></swaggerx-header>`,
    );
    let fired = false;
    el.addEventListener('theme-toggle', () => { fired = true; });
    const btns = el.shadowRoot!.querySelectorAll('.icon-btn');
    const themeBtn = btns[btns.length - 1] as HTMLButtonElement;
    themeBtn.click();
    expect(fired).toBe(true);
  });

  it('fires sidebar-toggle on sidebar button click', async () => {
    const el = await fixture<SwaggerXHeader>(
      html`<swaggerx-header></swaggerx-header>`,
    );
    let fired = false;
    el.addEventListener('sidebar-toggle', () => { fired = true; });
    const sidebarBtn = el.shadowRoot!.querySelector('.sidebar-btn') as HTMLButtonElement;
    sidebarBtn.click();
    expect(fired).toBe(true);
  });
});
