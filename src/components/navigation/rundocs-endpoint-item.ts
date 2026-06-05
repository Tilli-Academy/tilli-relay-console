import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../endpoint/rundocs-method-badge.js';

/**
 * <rundocs-endpoint-item> — A single endpoint row in the sidebar.
 *
 * Fires `endpoint-select` with { endpointId: string } on click.
 */
@customElement('rundocs-endpoint-item')
export class RunDocsEndpointItem extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .endpoint-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        border-radius: var(--sx-radius-md);
        margin: 1px 0;
        transition: background 0.12s, box-shadow 0.12s;
        font-family: inherit;
        border-left: 3px solid transparent;
      }

      .endpoint-item:hover {
        background: var(--sx-surface-tertiary);
        box-shadow: var(--sx-shadow-sm);
      }

      .endpoint-item[aria-selected='true'] {
        background: var(--sx-accent-bg-subtle);
        border-left-color: var(--sx-accent);
      }

      .endpoint-item[aria-selected='true'] .path {
        color: var(--sx-accent);
      }

      .endpoint-item[aria-selected='true'] .summary {
        color: var(--sx-text-secondary);
      }

      .text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .path {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--sx-text-primary);
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .summary {
        font-size: 0.6875rem;
        color: var(--sx-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 1px;
      }

      .deprecated .path {
        text-decoration: line-through;
        opacity: 0.6;
      }

      .lock-icon {
        color: var(--sx-text-muted);
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: String, attribute: 'endpoint-id' })
  endpointId = '';

  @property({ type: String })
  method = 'get';

  @property({ type: String })
  path = '';

  @property({ type: String })
  summary = '';

  @property({ type: Boolean })
  deprecated = false;

  @property({ type: Boolean })
  secured = false;

  @property({ type: Boolean })
  selected = false;

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent('endpoint-select', {
        detail: { endpointId: this.endpointId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <button
        class="endpoint-item ${this.deprecated ? 'deprecated' : ''}"
        aria-selected=${this.selected}
        @click=${this._onClick}
      >
        <rundocs-method-badge method=${this.method} compact></rundocs-method-badge>
        <div class="text">
          <div class="path">${this.path}</div>
          ${this.summary ? html`<div class="summary">${this.summary}</div>` : ''}
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-endpoint-item': RunDocsEndpointItem;
  }
}
