import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/env/rundocs-env-manager.js';
import type { RunDocsEnvManager } from '../../../../src/components/env/rundocs-env-manager.js';
import type { Environment } from '../../../../src/core/types.js';

function makeEnvs(): Environment[] {
  return [
    { id: 'env-1', name: 'Development', variables: { BASE_URL: 'http://localhost:3000' } },
    { id: 'env-2', name: 'Production', variables: { BASE_URL: 'https://api.example.com', API_KEY: 'abc123' } },
  ];
}

describe('rundocs-env-manager', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager></rundocs-env-manager>`,
    );
    const modal = el.shadowRoot!.querySelector('rundocs-modal');
    expect(modal).toBeNull();
  });

  it('renders modal when open', async () => {
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager ?open=${true} .environments=${makeEnvs()}></rundocs-env-manager>`,
    );
    const modal = el.shadowRoot!.querySelector('rundocs-modal');
    expect(modal).toBeTruthy();
  });

  it('shows add input and button', async () => {
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager ?open=${true}></rundocs-env-manager>`,
    );
    const input = el.shadowRoot!.querySelector('.add-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('New environment name');
    const addBtn = el.shadowRoot!.querySelector('.add-btn');
    expect(addBtn).toBeTruthy();
  });

  it('lists environments', async () => {
    const envs = makeEnvs();
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager ?open=${true} .environments=${envs}></rundocs-env-manager>`,
    );
    const items = el.shadowRoot!.querySelectorAll('.env-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.env-name')!.textContent).toContain('Development');
    expect(items[1].querySelector('.env-name')!.textContent).toContain('Production');
  });

  it('shows variable count per environment', async () => {
    const envs = makeEnvs();
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager ?open=${true} .environments=${envs}></rundocs-env-manager>`,
    );
    const counts = el.shadowRoot!.querySelectorAll('.env-count');
    expect(counts[0].textContent).toContain('1 vars');
    expect(counts[1].textContent).toContain('2 vars');
  });

  it('shows no-selection message when no env selected', async () => {
    const el = await fixture<RunDocsEnvManager>(
      html`<rundocs-env-manager ?open=${true} .environments=${makeEnvs()}></rundocs-env-manager>`,
    );
    const noSelection = el.shadowRoot!.querySelector('.no-selection');
    expect(noSelection).toBeTruthy();
    expect(noSelection!.textContent).toContain('Select an environment');
  });
});
