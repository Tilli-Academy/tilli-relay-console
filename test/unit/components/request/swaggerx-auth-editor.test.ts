import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/swaggerx-auth-editor.js';
import type { SwaggerXAuthEditor } from '../../../../src/components/request/swaggerx-auth-editor.js';
import type { AuthConfig } from '../../../../src/core/types.js';

describe('swaggerx-auth-editor', () => {
  it('renders auth type selector', async () => {
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor></swaggerx-auth-editor>`,
    );
    const select = el.shadowRoot!.querySelector('.auth-type-select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.length).toBe(4);
    expect(options.map((o) => o.value)).toEqual(['none', 'bearer', 'basic', 'apiKey']);
  });

  it('shows "No Auth" message for type=none', async () => {
    const auth: AuthConfig = { type: 'none' };
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor .auth=${auth}></swaggerx-auth-editor>`,
    );
    const noAuth = el.shadowRoot!.querySelector('.no-auth');
    expect(noAuth).toBeTruthy();
    expect(noAuth!.textContent).toContain('does not use any authorization');
  });

  it('shows token input for type=bearer', async () => {
    const auth: AuthConfig = { type: 'bearer', token: 'abc123' };
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor .auth=${auth}></swaggerx-auth-editor>`,
    );
    const noAuth = el.shadowRoot!.querySelector('.no-auth');
    expect(noAuth).toBeNull();
    const labels = el.shadowRoot!.querySelectorAll('.field-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toContain('Token');
    const input = el.shadowRoot!.querySelector('.field-input') as HTMLInputElement;
    expect(input.value).toBe('abc123');
  });

  it('shows username/password fields for type=basic', async () => {
    const auth: AuthConfig = { type: 'basic', username: 'admin', password: 'secret' };
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor .auth=${auth}></swaggerx-auth-editor>`,
    );
    const labels = el.shadowRoot!.querySelectorAll('.field-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('Username');
    expect(labels[1].textContent).toContain('Password');
    const inputs = el.shadowRoot!.querySelectorAll('.field-input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value).toBe('admin');
    expect(inputs[1].value).toBe('secret');
  });

  it('shows API key fields for type=apiKey', async () => {
    const auth: AuthConfig = {
      type: 'apiKey',
      apiKeyName: 'X-API-Key',
      apiKeyValue: 'secret123',
      apiKeyIn: 'header',
    };
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor .auth=${auth}></swaggerx-auth-editor>`,
    );
    const labels = el.shadowRoot!.querySelectorAll('.field-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('Key Name');
    expect(labels[1].textContent).toContain('Value');
    const radioLabels = el.shadowRoot!.querySelectorAll('.radio-label');
    expect(radioLabels.length).toBe(2);
  });

  it('fires auth-change on type change', async () => {
    const el = await fixture<SwaggerXAuthEditor>(
      html`<swaggerx-auth-editor></swaggerx-auth-editor>`,
    );
    let detail: { auth: AuthConfig } | null = null;
    el.addEventListener('auth-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const select = el.shadowRoot!.querySelector('.auth-type-select') as HTMLSelectElement;
    select.value = 'bearer';
    select.dispatchEvent(new Event('change'));
    expect(detail).toBeTruthy();
    expect(detail!.auth.type).toBe('bearer');
  });
});
