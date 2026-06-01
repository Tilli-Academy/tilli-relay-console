import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/swaggerx-tooltip.js';
import type { SwaggerXTooltip } from '../../../../src/components/shared/swaggerx-tooltip.js';

describe('swaggerx-tooltip', () => {
  it('renders slotted content', async () => {
    const el = await fixture<SwaggerXTooltip>(
      html`<swaggerx-tooltip text="Help"><button>Click</button></swaggerx-tooltip>`,
    );
    const trigger = el.shadowRoot!.querySelector('.trigger');
    expect(trigger).toBeTruthy();
    const slot = trigger!.querySelector('slot');
    expect(slot).toBeTruthy();
  });

  it('renders tooltip text', async () => {
    const el = await fixture<SwaggerXTooltip>(
      html`<swaggerx-tooltip text="Help text"></swaggerx-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip')!;
    expect(tip.textContent).toContain('Help text');
  });

  it('hides tooltip when text is empty', async () => {
    const el = await fixture<SwaggerXTooltip>(
      html`<swaggerx-tooltip></swaggerx-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip');
    expect(tip).toBeNull();
  });

  it('has role=tooltip on tip element', async () => {
    const el = await fixture<SwaggerXTooltip>(
      html`<swaggerx-tooltip text="Info"></swaggerx-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip')!;
    expect(tip.getAttribute('role')).toBe('tooltip');
  });
});
