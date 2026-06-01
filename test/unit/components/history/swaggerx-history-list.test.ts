import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/history/swaggerx-history-list.js';
import type { SwaggerXHistoryList } from '../../../../src/components/history/swaggerx-history-list.js';
import type { HistoryEntry } from '../../../../src/core/types.js';

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'entry-1',
    timestamp: Date.now(),
    endpointId: 'GET:/pets',
    method: 'get',
    url: 'https://api.example.com/pets',
    request: { headers: {}, body: '' },
    response: {
      status: 200,
      statusText: 'OK',
      headers: {},
      body: '[]',
      contentType: 'application/json',
      time: 100,
      size: 2,
    },
    ...overrides,
  };
}

describe('swaggerx-history-list', () => {
  it('shows empty state when no entries', async () => {
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list></swaggerx-history-list>`,
    );
    const emptyState = el.shadowRoot!.querySelector('swaggerx-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('renders history items when entries exist', async () => {
    const entries = [makeEntry(), makeEntry({ id: 'entry-2', method: 'post', url: '/test' })];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    const items = el.shadowRoot!.querySelectorAll('swaggerx-history-item');
    expect(items.length).toBe(2);
  });

  it('shows entry count in header', async () => {
    const entries = [makeEntry(), makeEntry({ id: 'entry-2' })];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    const title = el.shadowRoot!.querySelector('.title')!;
    expect(title.textContent).toContain('2 requests');
  });

  it('shows clear button', async () => {
    const entries = [makeEntry()];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    const clearBtn = el.shadowRoot!.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
  });

  it('fires history-clear on clear button click', async () => {
    const entries = [makeEntry()];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    let fired = false;
    el.addEventListener('history-clear', () => { fired = true; });
    const clearBtn = el.shadowRoot!.querySelector('.clear-btn') as HTMLButtonElement;
    clearBtn.click();
    expect(fired).toBe(true);
  });

  it('groups entries by date with labels', async () => {
    const entries = [makeEntry(), makeEntry({ id: 'entry-2' })];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    const dateLabels = el.shadowRoot!.querySelectorAll('.date-group-label');
    expect(dateLabels.length).toBeGreaterThanOrEqual(1);
    expect(dateLabels[0].textContent).toContain('Today');
  });

  it('shows different date groups for different timestamps', async () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const entries = [
      makeEntry({ id: 'today', timestamp: now }),
      makeEntry({ id: 'yesterday', timestamp: yesterday }),
    ];
    const el = await fixture<SwaggerXHistoryList>(
      html`<swaggerx-history-list .entries=${entries}></swaggerx-history-list>`,
    );
    const dateLabels = el.shadowRoot!.querySelectorAll('.date-group-label');
    expect(dateLabels.length).toBe(2);
  });
});
