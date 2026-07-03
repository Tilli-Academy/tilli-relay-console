import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';

/**
 * <rundocs-tag-group> — Collapsible group of endpoints under a tag name.
 *
 * Usage:
 *   <rundocs-tag-group name="pets" count="4">
 *     <rundocs-endpoint-item ...></rundocs-endpoint-item>
 *   </rundocs-tag-group>
 */
@customElement('rundocs-tag-group')
export class RunDocsTagGroup extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .group-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 12px;
        cursor: pointer;
        border: none;
        background: var(--sx-surface-secondary);
        width: 100%;
        text-align: left;
        font-family: inherit;
        transition: background 0.12s;
        border-bottom: 1px solid var(--sx-border-subtle);
      }

      .group-header:hover {
        background: var(--sx-surface-tertiary);
      }

      .chevron {
        color: var(--sx-text-muted);
        transition: transform 0.15s;
        flex-shrink: 0;
      }

      .chevron.expanded {
        transform: rotate(90deg);
      }

      .group-name {
        flex: 1;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-secondary);
      }

      .count {
        font-size: 0.625rem;
        color: var(--sx-text-muted);
        background: none;
        padding: 0;
        font-weight: 500;
      }

      .group-body {
        padding: 4px 0 4px 8px;
      }

      .group-body.hidden {
        display: none;
      }
    `,
  ];

  @property({ type: String })
  name = '';

  @property({ type: Number })
  count = 0;

  @property({ type: String })
  description = '';

  @state()
  private _expanded = true;

  private _toggle() {
    this._expanded = !this._expanded;
  }

  override render() {
    return html`
      <button class="group-header" @click=${this._toggle} aria-expanded=${this._expanded}>
        <rundocs-icon
          class="chevron ${this._expanded ? 'expanded' : ''}"
          name="chevron-right"
          size=${14}
        ></rundocs-icon>
        <span class="group-name">${this.name}</span>
        <span class="count">${this.count}</span>
      </button>
      <div class="group-body ${this._expanded ? '' : 'hidden'}">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-tag-group': RunDocsTagGroup;
  }
}
