import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-key-value-editor.js';
import type { SwaggerXKeyValueEditor, KeyValuePair } from '../../../../src/components/shared/swaggerx-key-value-editor.js';

const samplePairs: KeyValuePair[] = [
  { key: 'Authorization', value: 'Bearer token', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true },
];

describe('swaggerx-key-value-editor', () => {
  let el: SwaggerXKeyValueEditor;

  beforeEach(async () => {
    el = await fixture<SwaggerXKeyValueEditor>(html`
      <swaggerx-key-value-editor .pairs=${[...samplePairs]}></swaggerx-key-value-editor>
    `);
  });

  it('renders a row for each pair', () => {
    // +1 for header row
    const rows = el.shadowRoot!.querySelectorAll('.row');
    expect(rows.length).toBe(3); // 1 header + 2 data rows
  });

  it('renders key and value inputs', () => {
    const inputs = el.shadowRoot!.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(4); // 2 pairs x 2 inputs each
  });

  it('renders add button', () => {
    const addBtn = el.shadowRoot!.querySelector('.add-btn');
    expect(addBtn).toBeTruthy();
  });

  it('fires kv-change on add', async () => {
    const handler = vi.fn();
    el.addEventListener('kv-change', handler as EventListener);

    const addBtn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    addBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.pairs.length).toBe(3);
  });

  it('fires kv-change on remove', async () => {
    const handler = vi.fn();
    el.addEventListener('kv-change', handler as EventListener);

    const removeBtn = el.shadowRoot!.querySelector('.remove-btn') as HTMLButtonElement;
    removeBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.pairs.length).toBe(1);
  });

  it('hides add/remove buttons in readonly mode', async () => {
    el = await fixture<SwaggerXKeyValueEditor>(html`
      <swaggerx-key-value-editor .pairs=${[...samplePairs]} readonly></swaggerx-key-value-editor>
    `);

    const addBtn = el.shadowRoot!.querySelector('.add-btn');
    const removeBtns = el.shadowRoot!.querySelectorAll('.remove-btn');

    expect(addBtn).toBeNull();
    expect(removeBtns.length).toBe(0);
  });
});
