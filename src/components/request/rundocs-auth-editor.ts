import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import type { AuthConfig } from '../../core/types.js';

type AuthType = AuthConfig['type'];

/**
 * <rundocs-auth-editor> — Auth configuration panel (Bearer, Basic, API Key).
 *
 * Fires `auth-change` with { auth: AuthConfig }.
 */
@customElement('rundocs-auth-editor')
export class RunDocsAuthEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .auth-type-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: inherit;
        outline: none;
        margin-bottom: 16px;
      }

      .auth-type-select:focus {
        border-color: var(--sx-accent);
      }

      .field {
        margin-bottom: 12px;
      }

      .field-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--sx-text-secondary);
        margin-bottom: 4px;
      }

      .field-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;
        box-sizing: border-box;
      }

      .field-input:focus {
        border-color: var(--sx-accent);
      }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .api-key-location {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 8px;
      }

      .radio-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8125rem;
        color: var(--sx-text-secondary);
        cursor: pointer;
      }

      .no-auth {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        padding: 16px 0;
        text-align: center;
      }
    `,
  ];

  @property({ type: Object })
  auth: AuthConfig = { type: 'none' };

  private _emit(auth: AuthConfig) {
    this.dispatchEvent(
      new CustomEvent('auth-change', {
        detail: { auth },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onTypeChange(e: Event) {
    const type = (e.target as HTMLSelectElement).value as AuthType;
    const auth: AuthConfig = { type };
    if (type === 'apiKey') {
      auth.apiKeyIn = 'header';
      auth.apiKeyName = '';
      auth.apiKeyValue = '';
    }
    this._emit(auth);
  }

  private _onFieldChange(field: string, value: string) {
    this._emit({ ...this.auth, [field]: value });
  }

  override render() {
    return html`
      <label for="auth-type-select" class="sr-only">Authentication type</label>
      <select id="auth-type-select" class="auth-type-select" .value=${this.auth.type} @change=${this._onTypeChange}>
        <option value="none">No Auth</option>
        <option value="bearer">Bearer Token</option>
        <option value="basic">Basic Auth</option>
        <option value="apiKey">API Key</option>
      </select>

      ${this.auth.type === 'none' ? html`<div class="no-auth">This request does not use any authorization.</div>` : nothing}

      ${this.auth.type === 'bearer'
        ? html`
            <div class="field">
              <label class="field-label" for="auth-bearer-token">Token</label>
              <input
                id="auth-bearer-token"
                class="field-input"
                type="text"
                .value=${this.auth.token ?? ''}
                placeholder="Enter bearer token"
                @input=${(e: InputEvent) => this._onFieldChange('token', (e.target as HTMLInputElement).value)}
              />
            </div>
          `
        : nothing}

      ${this.auth.type === 'basic'
        ? html`
            <div class="field-row">
              <div class="field">
                <label class="field-label" for="auth-basic-username">Username</label>
                <input
                  id="auth-basic-username"
                  class="field-input"
                  type="text"
                  .value=${this.auth.username ?? ''}
                  placeholder="Username"
                  @input=${(e: InputEvent) => this._onFieldChange('username', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="field">
                <label class="field-label" for="auth-basic-password">Password</label>
                <input
                  id="auth-basic-password"
                  class="field-input"
                  type="password"
                  .value=${this.auth.password ?? ''}
                  placeholder="Password"
                  @input=${(e: InputEvent) => this._onFieldChange('password', (e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          `
        : nothing}

      ${this.auth.type === 'apiKey'
        ? html`
            <div class="field-row">
              <div class="field">
                <label class="field-label" for="auth-apikey-name">Key Name</label>
                <input
                  id="auth-apikey-name"
                  class="field-input"
                  type="text"
                  .value=${this.auth.apiKeyName ?? ''}
                  placeholder="e.g. X-API-Key"
                  @input=${(e: InputEvent) => this._onFieldChange('apiKeyName', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="field">
                <label class="field-label" for="auth-apikey-value">Value</label>
                <input
                  id="auth-apikey-value"
                  class="field-input"
                  type="text"
                  .value=${this.auth.apiKeyValue ?? ''}
                  placeholder="API key value"
                  @input=${(e: InputEvent) => this._onFieldChange('apiKeyValue', (e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
            <div class="api-key-location">
              <label class="radio-label">
                <input
                  type="radio"
                  name="apiKeyIn"
                  value="header"
                  .checked=${this.auth.apiKeyIn === 'header'}
                  @change=${() => this._onFieldChange('apiKeyIn', 'header')}
                /> Header
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  name="apiKeyIn"
                  value="query"
                  .checked=${this.auth.apiKeyIn === 'query'}
                  @change=${() => this._onFieldChange('apiKeyIn', 'query')}
                /> Query Param
              </label>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-auth-editor': RunDocsAuthEditor;
  }
}
