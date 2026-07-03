import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/navigation/rundocs-endpoint-item.js';
import type { RunDocsEndpointItem } from '../../../../src/components/navigation/rundocs-endpoint-item.js';

describe('rundocs-endpoint-item', () => {
  let el: RunDocsEndpointItem;

  beforeEach(async () => {
    el = await fixture<RunDocsEndpointItem>(html`
      <rundocs-endpoint-item
        endpoint-id="GET:/pets"
        method="get"
        path="/pets"
        summary="List all pets"
      ></rundocs-endpoint-item>
    `);
  });

  it('renders the path', () => {
    const path = el.shadowRoot!.querySelector('.path');
    expect(path!.textContent).toBe('/pets');
  });

  it('renders the summary', () => {
    const summary = el.shadowRoot!.querySelector('.summary');
    expect(summary!.textContent).toBe('List all pets');
  });

  it('renders a method badge', () => {
    const badge = el.shadowRoot!.querySelector('rundocs-method-badge');
    expect(badge).toBeTruthy();
    expect(badge!.getAttribute('method')).toBe('get');
  });

  it('fires endpoint-select on click', () => {
    const handler = vi.fn();
    el.addEventListener('endpoint-select', handler as EventListener);

    const button = el.shadowRoot!.querySelector('.endpoint-item') as HTMLButtonElement;
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.endpointId).toBe('GET:/pets');
  });

  it('marks as selected via aria-selected', async () => {
    el = await fixture<RunDocsEndpointItem>(html`
      <rundocs-endpoint-item
        endpoint-id="GET:/pets"
        method="get"
        path="/pets"
        selected
      ></rundocs-endpoint-item>
    `);
    const button = el.shadowRoot!.querySelector('.endpoint-item');
    expect(button!.getAttribute('aria-selected')).toBe('true');
  });

  it('applies deprecated class', async () => {
    el = await fixture<RunDocsEndpointItem>(html`
      <rundocs-endpoint-item
        endpoint-id="DELETE:/pets/{petId}"
        method="delete"
        path="/pets/{petId}"
        deprecated
      ></rundocs-endpoint-item>
    `);
    const button = el.shadowRoot!.querySelector('.endpoint-item');
    expect(button!.classList.contains('deprecated')).toBe(true);
  });
});
