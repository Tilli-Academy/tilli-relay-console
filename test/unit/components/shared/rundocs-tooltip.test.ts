import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/shared/rundocs-tooltip.js';
import type { RunDocsTooltip } from '../../../../src/components/shared/rundocs-tooltip.js';

describe('rundocs-tooltip', () => {
  it('renders slotted content', async () => {
    const el = await fixture<RunDocsTooltip>(
      html`<rundocs-tooltip text="Help"><button>Click</button></rundocs-tooltip>`,
    );
    const trigger = el.shadowRoot!.querySelector('.trigger');
    expect(trigger).toBeTruthy();
    const slot = trigger!.querySelector('slot');
    expect(slot).toBeTruthy();
  });

  it('renders tooltip text', async () => {
    const el = await fixture<RunDocsTooltip>(
      html`<rundocs-tooltip text="Help text"></rundocs-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip')!;
    expect(tip.textContent).toContain('Help text');
  });

  it('hides tooltip when text is empty', async () => {
    const el = await fixture<RunDocsTooltip>(
      html`<rundocs-tooltip></rundocs-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip');
    expect(tip).toBeNull();
  });

  it('has role=tooltip on tip element', async () => {
    const el = await fixture<RunDocsTooltip>(
      html`<rundocs-tooltip text="Info"></rundocs-tooltip>`,
    );
    const tip = el.shadowRoot!.querySelector('.tip')!;
    expect(tip.getAttribute('role')).toBe('tooltip');
  });
});
