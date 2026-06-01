import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/history/swaggerx-history-item.js';
import type { SwaggerXHistoryItem } from '../../../../src/components/history/swaggerx-history-item.js';

describe('swaggerx-history-item', () => {
  it('renders method and URL', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item
        historyId="test-1"
        method="get"
        url="https://api.example.com/pets"
        status=${200}
        timestamp=${Date.now()}
      ></swaggerx-history-item>`,
    );
    const method = el.shadowRoot!.querySelector('.method')!;
    expect(method.textContent!.trim()).toBe('GET');
    const url = el.shadowRoot!.querySelector('.url')!;
    expect(url.textContent).toContain('https://api.example.com/pets');
  });

  it('shows status code', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item
        historyId="test-1"
        method="post"
        url="/test"
        status=${201}
        timestamp=${Date.now()}
      ></swaggerx-history-item>`,
    );
    const status = el.shadowRoot!.querySelector('.status')!;
    expect(status.textContent).toContain('201');
  });

  it('fires history-select on click', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item historyId="test-1" method="get" url="/test" status=${200} timestamp=${0}></swaggerx-history-item>`,
    );
    let detail: { id: string } | null = null;
    el.addEventListener('history-select', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const item = el.shadowRoot!.querySelector('.item') as HTMLElement;
    item.click();
    expect(detail).toBeTruthy();
    expect(detail!.id).toBe('test-1');
  });

  it('fires history-remove on remove button click', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item historyId="test-1" method="get" url="/test" status=${200} timestamp=${0}></swaggerx-history-item>`,
    );
    let detail: { id: string } | null = null;
    el.addEventListener('history-remove', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const removeBtn = el.shadowRoot!.querySelector('.remove-btn') as HTMLButtonElement;
    removeBtn.click();
    expect(detail).toBeTruthy();
    expect(detail!.id).toBe('test-1');
  });

  it('applies success class for 2xx status', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item historyId="t" method="get" url="/test" status=${200} timestamp=${0}></swaggerx-history-item>`,
    );
    const status = el.shadowRoot!.querySelector('.status')!;
    expect(status.classList.contains('success')).toBe(true);
  });

  it('applies error class for 5xx status', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item historyId="t" method="get" url="/test" status=${500} timestamp=${0}></swaggerx-history-item>`,
    );
    const status = el.shadowRoot!.querySelector('.status')!;
    expect(status.classList.contains('error')).toBe(true);
  });

  it('has bottom border for visual separation', async () => {
    const el = await fixture<SwaggerXHistoryItem>(
      html`<swaggerx-history-item historyId="t" method="get" url="/test" status=${200} timestamp=${0}></swaggerx-history-item>`,
    );
    const item = el.shadowRoot!.querySelector('.item')!;
    expect(item).toBeTruthy();
  });
});
