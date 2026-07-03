import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/rundocs-empty-state.js';
import type { RunDocsEmptyState } from '../../../../src/components/shared/rundocs-empty-state.js';

describe('rundocs-empty-state', () => {
  it('renders title', async () => {
    const el = await fixture<RunDocsEmptyState>(
      html`<rundocs-empty-state title="No data"></rundocs-empty-state>`,
    );
    const title = el.shadowRoot!.querySelector('.title')!;
    expect(title.textContent).toContain('No data');
  });

  it('renders description', async () => {
    const el = await fixture<RunDocsEmptyState>(
      html`<rundocs-empty-state description="Try again later."></rundocs-empty-state>`,
    );
    const desc = el.shadowRoot!.querySelector('.description')!;
    expect(desc.textContent).toContain('Try again later.');
  });

  it('renders icon when provided', async () => {
    const el = await fixture<RunDocsEmptyState>(
      html`<rundocs-empty-state icon="clock" title="Empty"></rundocs-empty-state>`,
    );
    const icon = el.shadowRoot!.querySelector('rundocs-icon');
    expect(icon).toBeTruthy();
  });

  it('hides icon when not provided', async () => {
    const el = await fixture<RunDocsEmptyState>(
      html`<rundocs-empty-state title="No data"></rundocs-empty-state>`,
    );
    const iconWrapper = el.shadowRoot!.querySelector('.icon');
    expect(iconWrapper).toBeNull();
  });
});
