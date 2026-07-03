import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/response/rundocs-response-meta.js';
import type { RunDocsResponseMeta } from '../../../../src/components/response/rundocs-response-meta.js';

describe('rundocs-response-meta', () => {
  it('renders status badge', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} status-text="OK" time=${150} size=${1024}></rundocs-response-meta>`,
    );
    const badge = el.shadowRoot!.querySelector('rundocs-status-badge');
    expect(badge).toBeTruthy();
  });

  it('displays response time in ms for fast responses', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${150} size=${0}></rundocs-response-meta>`,
    );
    const meta = el.shadowRoot!.querySelector('.meta-row')!;
    expect(meta.textContent).toContain('150 ms');
  });

  it('displays response time in seconds for slow responses', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${2500} size=${0}></rundocs-response-meta>`,
    );
    const meta = el.shadowRoot!.querySelector('.meta-row')!;
    expect(meta.textContent).toContain('2.50 s');
  });

  it('displays size in bytes', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${0} size=${500}></rundocs-response-meta>`,
    );
    const meta = el.shadowRoot!.querySelector('.meta-row')!;
    expect(meta.textContent).toContain('500 B');
  });

  it('displays size in KB', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${0} size=${2048}></rundocs-response-meta>`,
    );
    const meta = el.shadowRoot!.querySelector('.meta-row')!;
    expect(meta.textContent).toContain('2.0 KB');
  });

  it('displays size in MB', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${0} size=${1572864}></rundocs-response-meta>`,
    );
    const meta = el.shadowRoot!.querySelector('.meta-row')!;
    expect(meta.textContent).toContain('1.50 MB');
  });

  it('applies fast class for quick responses', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${100} size=${0}></rundocs-response-meta>`,
    );
    const timeValue = el.shadowRoot!.querySelectorAll('.meta-value')[0];
    expect(timeValue.classList.contains('fast')).toBe(true);
  });

  it('applies medium class for moderate responses', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${500} size=${0}></rundocs-response-meta>`,
    );
    const timeValue = el.shadowRoot!.querySelectorAll('.meta-value')[0];
    expect(timeValue.classList.contains('medium')).toBe(true);
  });

  it('applies slow class for slow responses', async () => {
    const el = await fixture<RunDocsResponseMeta>(
      html`<rundocs-response-meta status=${200} time=${1500} size=${0}></rundocs-response-meta>`,
    );
    const timeValue = el.shadowRoot!.querySelectorAll('.meta-value')[0];
    expect(timeValue.classList.contains('slow')).toBe(true);
  });
});
