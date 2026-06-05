import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import type { HttpMethod } from '../../core/types.js';

const METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/**
 * <rundocs-request-bar> — Method selector + URL display bar.
 *
 * Fires:
 *   - `method-change` with { method: HttpMethod }
 *   - `url-change` with { url: string }
 *   - `send-request` when Send button or Enter is pressed
 */
@customElement('rundocs-request-bar')
export class RunDocsRequestBar extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .method-select {
        flex-shrink: 0;
        padding: 9px 12px;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        text-transform: uppercase;
        cursor: pointer;
        outline: none;
        min-width: 90px;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      .method-select:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      .url-input {
        flex: 1;
        padding: 9px 14px;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-primary);
        color: var(--sx-text-primary);
        font-size: 0.875rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;
        min-width: 0;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      .url-input:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      .url-input::placeholder {
        color: var(--sx-text-muted);
      }

      .send-btn {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 20px;
        border: none;
        border-radius: var(--sx-radius-lg);
        background: var(--sx-accent);
        color: #fff;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s, box-shadow 0.15s;
      }

      .send-btn:hover {
        background: var(--sx-accent-hover);
        box-shadow: var(--sx-shadow-md);
      }

      .send-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ];

  @property({ type: String })
  method: HttpMethod = 'get';

  @property({ type: String })
  url = '';

  @property({ type: Boolean })
  loading = false;

  private _onMethodChange(e: Event) {
    const method = (e.target as HTMLSelectElement).value as HttpMethod;
    this.dispatchEvent(
      new CustomEvent('method-change', { detail: { method }, bubbles: true, composed: true }),
    );
  }

  private _onUrlInput(e: InputEvent) {
    const url = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent('url-change', { detail: { url }, bubbles: true, composed: true }),
    );
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._send();
    }
  }

  private _send() {
    if (this.loading) return;
    this.dispatchEvent(
      new CustomEvent('send-request', { bubbles: true, composed: true }),
    );
  }

  override render() {
    return html`
      <div class="bar">
        <select
          class="method-select"
          .value=${this.method}
          @change=${this._onMethodChange}
        >
          ${METHODS.map(
            (m) => html`<option value=${m} ?selected=${m === this.method}>${m.toUpperCase()}</option>`,
          )}
        </select>
        <input
          class="url-input"
          type="text"
          .value=${this.url}
          placeholder="Enter request URL"
          @input=${this._onUrlInput}
          @keydown=${this._onKeyDown}
        />
        <button class="send-btn" @click=${this._send} ?disabled=${this.loading}>
          <rundocs-icon name="send" size=${14}></rundocs-icon>
          ${this.loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-request-bar': RunDocsRequestBar;
  }
}
