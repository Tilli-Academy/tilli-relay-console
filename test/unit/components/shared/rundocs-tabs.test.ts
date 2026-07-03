import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/rundocs-tabs.js';
import type { RunDocsTabs, TabDef } from '../../../../src/components/shared/rundocs-tabs.js';

const tabs: TabDef[] = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers', badge: '3' },
  { id: 'body', label: 'Body' },
];

describe('rundocs-tabs', () => {
  let el: RunDocsTabs;

  beforeEach(async () => {
    el = await fixture<RunDocsTabs>(html`
      <rundocs-tabs .tabs=${tabs} active="params"></rundocs-tabs>
    `);
  });

  it('renders all tabs', () => {
    const buttons = el.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(buttons.length).toBe(3);
  });

  it('marks the active tab with aria-selected', () => {
    const buttons = el.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons[1].getAttribute('aria-selected')).toBe('false');
  });

  it('renders badge when present', () => {
    const badge = el.shadowRoot!.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge!.textContent).toBe('3');
  });

  it('fires tab-change event on click', async () => {
    const handler = vi.fn();
    el.addEventListener('tab-change', handler as EventListener);

    const buttons = el.shadowRoot!.querySelectorAll('[role="tab"]');
    (buttons[1] as HTMLButtonElement).click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.tab).toBe('headers');
  });
});
