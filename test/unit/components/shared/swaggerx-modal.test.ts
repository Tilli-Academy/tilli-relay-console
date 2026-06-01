import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-modal.js';
import type { SwaggerXModal } from '../../../../src/components/shared/swaggerx-modal.js';

describe('swaggerx-modal', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture<SwaggerXModal>(html`
      <swaggerx-modal heading="Test Modal">Content</swaggerx-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeNull();
  });

  it('renders modal when open', async () => {
    const el = await fixture<SwaggerXModal>(html`
      <swaggerx-modal .open=${true} heading="Test Modal">Content</swaggerx-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('displays the title', async () => {
    const el = await fixture<SwaggerXModal>(html`
      <swaggerx-modal .open=${true} heading="My Dialog">Content</swaggerx-modal>
    `);
    const title = el.shadowRoot!.querySelector('.modal-title');
    expect(title!.textContent).toBe('My Dialog');
  });

  it('fires modal-close on close button click', async () => {
    const handler = vi.fn();
    const el = await fixture<SwaggerXModal>(html`
      <swaggerx-modal .open=${true} heading="Test" @modal-close=${handler}>Content</swaggerx-modal>
    `);
    const closeBtn = el.shadowRoot!.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('fires modal-close on backdrop click', async () => {
    const handler = vi.fn();
    const el = await fixture<SwaggerXModal>(html`
      <swaggerx-modal .open=${true} heading="Test" @modal-close=${handler}>Content</swaggerx-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement;
    backdrop.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('fires modal-close on Escape key', async () => {
    const handler = vi.fn();
    await fixture<SwaggerXModal>(html`
      <swaggerx-modal .open=${true} heading="Test" @modal-close=${handler}>Content</swaggerx-modal>
    `);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
