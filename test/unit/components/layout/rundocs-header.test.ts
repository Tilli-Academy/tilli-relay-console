import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/rundocs-header.js';
import type { RunDocsHeader } from '../../../../src/components/layout/rundocs-header.js';

describe('rundocs-header', () => {
  it('renders logo text', async () => {
    const el = await fixture<RunDocsHeader>(
      html`<rundocs-header></rundocs-header>`,
    );
    const logo = el.shadowRoot!.querySelector('.logo')!;
    expect(logo.textContent).toContain('RunDocs');
  });

  it('shows API title when provided', async () => {
    const el = await fixture<RunDocsHeader>(
      html`<rundocs-header api-title="Pet Store" api-version="3.0"></rundocs-header>`,
    );
    const title = el.shadowRoot!.querySelector('.api-title')!;
    expect(title.textContent).toContain('Pet Store');
    const version = el.shadowRoot!.querySelector('.api-version')!;
    expect(version.textContent).toContain('v3.0');
  });

  it('fires theme-toggle on theme button click', async () => {
    const el = await fixture<RunDocsHeader>(
      html`<rundocs-header></rundocs-header>`,
    );
    let fired = false;
    el.addEventListener('theme-toggle', () => { fired = true; });
    const btns = el.shadowRoot!.querySelectorAll('.icon-btn');
    const themeBtn = btns[btns.length - 1] as HTMLButtonElement;
    themeBtn.click();
    expect(fired).toBe(true);
  });

  it('fires sidebar-toggle on sidebar button click', async () => {
    const el = await fixture<RunDocsHeader>(
      html`<rundocs-header></rundocs-header>`,
    );
    let fired = false;
    el.addEventListener('sidebar-toggle', () => { fired = true; });
    const sidebarBtn = el.shadowRoot!.querySelector('.sidebar-btn') as HTMLButtonElement;
    sidebarBtn.click();
    expect(fired).toBe(true);
  });
});
