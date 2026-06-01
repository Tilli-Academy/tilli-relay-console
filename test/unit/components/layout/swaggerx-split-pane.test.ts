import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/layout/swaggerx-split-pane.js';
import type { SwaggerXSplitPane } from '../../../../src/components/layout/swaggerx-split-pane.js';

describe('swaggerx-split-pane', () => {
  it('renders left and right panes', async () => {
    const el = await fixture<SwaggerXSplitPane>(
      html`<swaggerx-split-pane>
        <div slot="left">Left</div>
        <div slot="right">Right</div>
      </swaggerx-split-pane>`,
    );
    const left = el.shadowRoot!.querySelector('.left-pane');
    const right = el.shadowRoot!.querySelector('.right-pane');
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();
  });

  it('renders a divider', async () => {
    const el = await fixture<SwaggerXSplitPane>(
      html`<swaggerx-split-pane></swaggerx-split-pane>`,
    );
    const divider = el.shadowRoot!.querySelector('.divider');
    expect(divider).toBeTruthy();
  });

  it('applies ratio as left pane width', async () => {
    const el = await fixture<SwaggerXSplitPane>(
      html`<swaggerx-split-pane ratio=${0.3}></swaggerx-split-pane>`,
    );
    const left = el.shadowRoot!.querySelector('.left-pane') as HTMLElement;
    expect(left.style.width).toBe('30%');
  });

  it('defaults ratio to 0.25', async () => {
    const el = await fixture<SwaggerXSplitPane>(
      html`<swaggerx-split-pane></swaggerx-split-pane>`,
    );
    const left = el.shadowRoot!.querySelector('.left-pane') as HTMLElement;
    expect(left.style.width).toBe('25%');
  });
});
