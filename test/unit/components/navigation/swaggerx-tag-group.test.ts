import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/navigation/swaggerx-tag-group.js';
import type { SwaggerXTagGroup } from '../../../../src/components/navigation/swaggerx-tag-group.js';

describe('swaggerx-tag-group', () => {
  let el: SwaggerXTagGroup;

  beforeEach(async () => {
    el = await fixture<SwaggerXTagGroup>(html`
      <swaggerx-tag-group name="pets" count=${4}>
        <div class="child-content">Endpoints go here</div>
      </swaggerx-tag-group>
    `);
  });

  it('renders the tag name', () => {
    const name = el.shadowRoot!.querySelector('.group-name');
    expect(name!.textContent).toBe('pets');
  });

  it('renders the endpoint count', () => {
    const count = el.shadowRoot!.querySelector('.count');
    expect(count!.textContent).toBe('4');
  });

  it('starts expanded by default', () => {
    const body = el.shadowRoot!.querySelector('.group-body');
    expect(body!.classList.contains('hidden')).toBe(false);
  });

  it('collapses when header is clicked', async () => {
    const header = el.shadowRoot!.querySelector('.group-header') as HTMLButtonElement;
    header.click();
    await el.updateComplete;

    const body = el.shadowRoot!.querySelector('.group-body');
    expect(body!.classList.contains('hidden')).toBe(true);
  });

  it('toggles expand/collapse on repeated clicks', async () => {
    const header = el.shadowRoot!.querySelector('.group-header') as HTMLButtonElement;

    header.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.group-body')!.classList.contains('hidden')).toBe(true);

    header.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.group-body')!.classList.contains('hidden')).toBe(false);
  });

  it('rotates chevron when expanded', () => {
    const chevron = el.shadowRoot!.querySelector('.chevron');
    expect(chevron!.classList.contains('expanded')).toBe(true);
  });

  it('renders slotted content', () => {
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).toBeTruthy();
  });
});
