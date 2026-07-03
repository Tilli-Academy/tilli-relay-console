import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/rundocs-request-bar.js';
import type { RunDocsRequestBar } from '../../../../src/components/request/rundocs-request-bar.js';

describe('rundocs-request-bar', () => {
  it('renders method selector and URL input', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar method="get" url="https://api.example.com/pets"></rundocs-request-bar>`,
    );
    const root = el.shadowRoot!;
    expect(root.querySelector('.method-select')).toBeTruthy();
    expect(root.querySelector('.url-input')).toBeTruthy();
    expect(root.querySelector('.send-btn')).toBeTruthy();
  });

  it('displays the method options including all HTTP methods', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar method="post"></rundocs-request-bar>`,
    );
    const select = el.shadowRoot!.querySelector('.method-select') as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.length).toBe(7);
    expect(options.map((o) => o.value)).toEqual([
      'get', 'post', 'put', 'patch', 'delete', 'head', 'options',
    ]);
  });

  it('displays the URL in the input field', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar url="https://api.example.com/pets"></rundocs-request-bar>`,
    );
    const input = el.shadowRoot!.querySelector('.url-input') as HTMLInputElement;
    expect(input.value).toBe('https://api.example.com/pets');
  });

  it('fires send-request on Send button click', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar></rundocs-request-bar>`,
    );
    let fired = false;
    el.addEventListener('send-request', () => { fired = true; });
    const btn = el.shadowRoot!.querySelector('.send-btn') as HTMLButtonElement;
    btn.click();
    expect(fired).toBe(true);
  });

  it('does NOT fire send-request when loading', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar ?loading=${true}></rundocs-request-bar>`,
    );
    let fired = false;
    el.addEventListener('send-request', () => { fired = true; });
    const btn = el.shadowRoot!.querySelector('.send-btn') as HTMLButtonElement;
    btn.click();
    expect(fired).toBe(false);
  });

  it('fires method-change on select change', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar method="get"></rundocs-request-bar>`,
    );
    let method = '';
    el.addEventListener('method-change', ((e: CustomEvent) => { method = e.detail.method; }) as EventListener);
    const select = el.shadowRoot!.querySelector('.method-select') as HTMLSelectElement;
    select.value = 'post';
    select.dispatchEvent(new Event('change'));
    expect(method).toBe('post');
  });

  it('fires url-change on URL input', async () => {
    const el = await fixture<RunDocsRequestBar>(
      html`<rundocs-request-bar></rundocs-request-bar>`,
    );
    let url = '';
    el.addEventListener('url-change', ((e: CustomEvent) => { url = e.detail.url; }) as EventListener);
    const input = el.shadowRoot!.querySelector('.url-input') as HTMLInputElement;
    input.value = 'https://new-url.com';
    input.dispatchEvent(new InputEvent('input'));
    expect(url).toBe('https://new-url.com');
  });
});
