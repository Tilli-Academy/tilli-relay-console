import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/rundocs-send-button.js';
import type { RunDocsSendButton } from '../../../../src/components/request/rundocs-send-button.js';

describe('rundocs-send-button', () => {
  it('renders "Send" text by default', async () => {
    const el = await fixture<RunDocsSendButton>(
      html`<rundocs-send-button></rundocs-send-button>`,
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.textContent!.trim()).toContain('Send');
  });

  it('shows spinner and "Sending..." when loading', async () => {
    const el = await fixture<RunDocsSendButton>(
      html`<rundocs-send-button ?loading=${true}></rundocs-send-button>`,
    );
    const spinner = el.shadowRoot!.querySelector('.spinner');
    expect(spinner).toBeTruthy();
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.textContent).toContain('Sending...');
  });

  it('fires send-request on click', async () => {
    const el = await fixture<RunDocsSendButton>(
      html`<rundocs-send-button></rundocs-send-button>`,
    );
    let fired = false;
    el.addEventListener('send-request', () => { fired = true; });
    const btn = el.shadowRoot!.querySelector('button')!;
    btn.click();
    expect(fired).toBe(true);
  });

  it('does NOT fire when loading (button disabled)', async () => {
    const el = await fixture<RunDocsSendButton>(
      html`<rundocs-send-button ?loading=${true}></rundocs-send-button>`,
    );
    let fired = false;
    el.addEventListener('send-request', () => { fired = true; });
    const btn = el.shadowRoot!.querySelector('button')!;
    btn.click();
    expect(fired).toBe(false);
  });
});
