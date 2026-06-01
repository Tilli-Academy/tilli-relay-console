import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/swaggerx-empty-state.js';
import type { SwaggerXEmptyState } from '../../../../src/components/shared/swaggerx-empty-state.js';

describe('swaggerx-empty-state', () => {
  it('renders title', async () => {
    const el = await fixture<SwaggerXEmptyState>(
      html`<swaggerx-empty-state title="No data"></swaggerx-empty-state>`,
    );
    const title = el.shadowRoot!.querySelector('.title')!;
    expect(title.textContent).toContain('No data');
  });

  it('renders description', async () => {
    const el = await fixture<SwaggerXEmptyState>(
      html`<swaggerx-empty-state description="Try again later."></swaggerx-empty-state>`,
    );
    const desc = el.shadowRoot!.querySelector('.description')!;
    expect(desc.textContent).toContain('Try again later.');
  });

  it('renders icon when provided', async () => {
    const el = await fixture<SwaggerXEmptyState>(
      html`<swaggerx-empty-state icon="clock" title="Empty"></swaggerx-empty-state>`,
    );
    const icon = el.shadowRoot!.querySelector('swaggerx-icon');
    expect(icon).toBeTruthy();
  });

  it('hides icon when not provided', async () => {
    const el = await fixture<SwaggerXEmptyState>(
      html`<swaggerx-empty-state title="No data"></swaggerx-empty-state>`,
    );
    const iconWrapper = el.shadowRoot!.querySelector('.icon');
    expect(iconWrapper).toBeNull();
  });
});
