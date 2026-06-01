import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/env/swaggerx-env-selector.js';
import type { SwaggerXEnvSelector } from '../../../../src/components/env/swaggerx-env-selector.js';
import type { Environment } from '../../../../src/core/types.js';

function makeEnvs(): Environment[] {
  return [
    { id: 'env-1', name: 'Development', variables: { BASE_URL: 'http://localhost:3000' } },
    { id: 'env-2', name: 'Production', variables: { BASE_URL: 'https://api.example.com' } },
  ];
}

describe('swaggerx-env-selector', () => {
  it('renders select element', async () => {
    const el = await fixture<SwaggerXEnvSelector>(
      html`<swaggerx-env-selector></swaggerx-env-selector>`,
    );
    const select = el.shadowRoot!.querySelector('.env-select') as HTMLSelectElement;
    expect(select).toBeTruthy();
  });

  it('shows "No Environment" default option', async () => {
    const el = await fixture<SwaggerXEnvSelector>(
      html`<swaggerx-env-selector></swaggerx-env-selector>`,
    );
    const select = el.shadowRoot!.querySelector('.env-select') as HTMLSelectElement;
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('No Environment');
    expect(options[0].value).toBe('');
  });

  it('lists environments as options', async () => {
    const envs = makeEnvs();
    const el = await fixture<SwaggerXEnvSelector>(
      html`<swaggerx-env-selector .environments=${envs}></swaggerx-env-selector>`,
    );
    const select = el.shadowRoot!.querySelector('.env-select') as HTMLSelectElement;
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3); // "No Environment" + 2 envs
    expect(options[1].textContent).toContain('Development');
    expect(options[2].textContent).toContain('Production');
  });

  it('fires env-select on change', async () => {
    const envs = makeEnvs();
    const el = await fixture<SwaggerXEnvSelector>(
      html`<swaggerx-env-selector .environments=${envs}></swaggerx-env-selector>`,
    );
    let detail: { id: string | null } | null = null;
    el.addEventListener('env-select', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const select = el.shadowRoot!.querySelector('.env-select') as HTMLSelectElement;
    select.value = 'env-1';
    select.dispatchEvent(new Event('change'));
    expect(detail).toBeTruthy();
    expect(detail!.id).toBe('env-1');
  });

  it('fires env-manage on manage button click', async () => {
    const el = await fixture<SwaggerXEnvSelector>(
      html`<swaggerx-env-selector></swaggerx-env-selector>`,
    );
    let fired = false;
    el.addEventListener('env-manage', () => { fired = true; });
    const manageBtn = el.shadowRoot!.querySelector('.manage-btn') as HTMLButtonElement;
    manageBtn.click();
    expect(fired).toBe(true);
  });
});
