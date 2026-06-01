import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-icon.js';
import type { HttpMethod } from '../../core/types.js';

/**
 * <swaggerx-history-item> — A single history entry row.
 *
 * Fires:
 *   - `history-select` with { id }
 *   - `history-remove` with { id }
 */
@customElement('swaggerx-history-item')
export class SwaggerXHistoryItem extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.1s;
      }

      .item:hover {
        background: var(--sx-surface-secondary);
        box-shadow: var(--sx-shadow-sm);
      }

      .item[aria-selected='true'] {
        background: var(--sx-accent-bg-subtle);
        border-left: 3px solid var(--sx-accent);
      }

      .item {
        border-bottom: 1px solid var(--sx-border-subtle);
      }

      .method {
        flex-shrink: 0;
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        min-width: 36px;
        text-align: center;
      }

      .method.get { color: var(--sx-method-get-text); }
      .method.post { color: var(--sx-method-post-text); }
      .method.put { color: var(--sx-method-put-text); }
      .method.patch { color: var(--sx-method-patch-text); }
      .method.delete { color: var(--sx-method-delete-text); }
      .method.head { color: var(--sx-method-head-text); }
      .method.options { color: var(--sx-method-options-text); }

      .details {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .url {
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .meta {
        display: flex;
        gap: 8px;
        font-size: 0.625rem;
        color: var(--sx-text-muted);
        margin-top: 2px;
      }

      .status {
        font-weight: 600;
      }

      .status.success {
        color: var(--sx-success);
      }

      .status.error {
        color: var(--sx-error);
      }

      .remove-btn {
        flex-shrink: 0;
        display: none;
        padding: 2px;
        border: none;
        background: none;
        color: var(--sx-text-muted);
        cursor: pointer;
        border-radius: var(--sx-radius-sm);
      }

      .remove-btn:hover {
        color: var(--sx-error);
        background: var(--sx-surface-tertiary);
      }

      .item:hover .remove-btn {
        display: inline-flex;
      }
    `,
  ];

  @property({ type: String })
  historyId = '';

  @property({ type: String })
  method: HttpMethod = 'get';

  @property({ type: String })
  url = '';

  @property({ type: Number })
  status = 0;

  @property({ type: Number })
  timestamp = 0;

  @property({ type: Boolean })
  selected = false;

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent('history-select', {
        detail: { id: this.historyId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._onClick();
    }
  }

  private _onRemove(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('history-remove', {
        detail: { id: this.historyId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _formatTime(ts: number): string {
    const date = new Date(ts);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  override render() {
    return html`
      <div class="item" role="button" tabindex="0" @click=${this._onClick} @keydown=${this._onKeyDown} aria-label="${this.method.toUpperCase()} ${this.url}" aria-selected=${this.selected}>
        <span class="method ${this.method}">${this.method.toUpperCase()}</span>
        <div class="details">
          <div class="url">${this.url}</div>
          <div class="meta">
            <span class="status ${this.status >= 200 && this.status < 400 ? 'success' : 'error'}">
              ${this.status || 'ERR'}
            </span>
            <span>${this._formatTime(this.timestamp)}</span>
          </div>
        </div>
        <button class="remove-btn" @click=${this._onRemove} aria-label="Remove">
          <swaggerx-icon name="trash" size=${14}></swaggerx-icon>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-history-item': SwaggerXHistoryItem;
  }
}
