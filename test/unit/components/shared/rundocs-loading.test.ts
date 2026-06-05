import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/rundocs-loading.js';
import type { RunDocsLoading } from '../../../../src/components/shared/rundocs-loading.js';

describe('rundocs-loading', () => {
  let el: RunDocsLoading;

  beforeEach(async () => {
    el = await fixture<RunDocsLoading>(html`<rundocs-loading></rundocs-loading>`);
  });

  it('renders a spinner', () => {
    const spinner = el.shadowRoot!.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('does not render message by default', () => {
    const message = el.shadowRoot!.querySelector('.message');
    expect(message).toBeNull();
  });

  it('renders message when provided', async () => {
    el = await fixture<RunDocsLoading>(html`<rundocs-loading message="Loading..."></rundocs-loading>`);
    const message = el.shadowRoot!.querySelector('.message');
    expect(message).toBeTruthy();
    expect(message!.textContent).toBe('Loading...');
  });
});
