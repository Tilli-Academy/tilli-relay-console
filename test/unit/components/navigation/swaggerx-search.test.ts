import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/navigation/swaggerx-search.js';
import type { SwaggerXSearch } from '../../../../src/components/navigation/swaggerx-search.js';

describe('swaggerx-search', () => {
  let el: SwaggerXSearch;

  beforeEach(async () => {
    el = await fixture<SwaggerXSearch>(html`<swaggerx-search></swaggerx-search>`);
  });

  it('renders a search input', () => {
    const input = el.shadowRoot!.querySelector('input');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('type')).toBe('text');
  });

  it('has placeholder text', () => {
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Search endpoints...');
  });

  it('renders the search icon', () => {
    const icon = el.shadowRoot!.querySelector('.search-icon');
    expect(icon).toBeTruthy();
  });

  it('fires search-input on typing', async () => {
    const handler = vi.fn();
    el.addEventListener('search-input', handler as EventListener);

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'pets';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.query).toBe('pets');
  });

  it('shows clear button when input has value', async () => {
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await el.updateComplete;

    const clearBtn = el.shadowRoot!.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
  });

  it('does not show clear button when empty', () => {
    const clearBtn = el.shadowRoot!.querySelector('.clear-btn');
    expect(clearBtn).toBeNull();
  });

  it('fires search-input with empty query on clear', async () => {
    // First type something
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('search-input', handler as EventListener);

    const clearBtn = el.shadowRoot!.querySelector('.clear-btn') as HTMLButtonElement;
    clearBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.query).toBe('');
  });

  it('accepts custom placeholder', async () => {
    el = await fixture<SwaggerXSearch>(html`
      <swaggerx-search placeholder="Filter..."></swaggerx-search>
    `);
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Filter...');
  });
});
