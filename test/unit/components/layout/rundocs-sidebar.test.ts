import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/rundocs-sidebar.js';
import type { RunDocsSidebar } from '../../../../src/components/layout/rundocs-sidebar.js';

describe('rundocs-sidebar', () => {
  it('renders two tab buttons', async () => {
    const el = await fixture<RunDocsSidebar>(
      html`<rundocs-sidebar></rundocs-sidebar>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('.sidebar-tab');
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent).toContain('Endpoints');
    expect(tabs[1].textContent).toContain('History');
  });

  it('defaults to endpoints panel', async () => {
    const el = await fixture<RunDocsSidebar>(
      html`<rundocs-sidebar></rundocs-sidebar>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('.sidebar-tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('fires panel-change when history tab is clicked', async () => {
    const el = await fixture<RunDocsSidebar>(
      html`<rundocs-sidebar></rundocs-sidebar>`,
    );
    let detail: { panel: string } | null = null;
    el.addEventListener('panel-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const historyTab = el.shadowRoot!.querySelectorAll('.sidebar-tab')[1] as HTMLButtonElement;
    historyTab.click();
    expect(detail).toBeTruthy();
    expect(detail!.panel).toBe('history');
  });

  it('shows endpoints slot when active', async () => {
    const el = await fixture<RunDocsSidebar>(
      html`<rundocs-sidebar activePanel="endpoints"></rundocs-sidebar>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="endpoints"]');
    expect(slot).toBeTruthy();
  });
});
