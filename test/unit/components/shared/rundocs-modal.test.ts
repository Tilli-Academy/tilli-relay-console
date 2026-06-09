import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/rundocs-modal.js';
import type { RunDocsModal } from '../../../../src/components/shared/rundocs-modal.js';

describe('rundocs-modal', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture<RunDocsModal>(html`
      <rundocs-modal heading="Test Modal">Content</rundocs-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeNull();
  });

  it('renders modal when open', async () => {
    const el = await fixture<RunDocsModal>(html`
      <rundocs-modal .open=${true} heading="Test Modal">Content</rundocs-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('displays the title', async () => {
    const el = await fixture<RunDocsModal>(html`
      <rundocs-modal .open=${true} heading="My Dialog">Content</rundocs-modal>
    `);
    const title = el.shadowRoot!.querySelector('.modal-title');
    expect(title!.textContent).toBe('My Dialog');
  });

  it('fires modal-close on close button click', async () => {
    const handler = vi.fn();
    const el = await fixture<RunDocsModal>(html`
      <rundocs-modal .open=${true} heading="Test" @modal-close=${handler}>Content</rundocs-modal>
    `);
    const closeBtn = el.shadowRoot!.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire modal-close on backdrop click', async () => {
    const handler = vi.fn();
    const el = await fixture<RunDocsModal>(html`
      <rundocs-modal .open=${true} heading="Test" @modal-close=${handler}>Content</rundocs-modal>
    `);
    const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement;
    backdrop.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('fires modal-close on Escape key', async () => {
    const handler = vi.fn();
    await fixture<RunDocsModal>(html`
      <rundocs-modal .open=${true} heading="Test" @modal-close=${handler}>Content</rundocs-modal>
    `);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
