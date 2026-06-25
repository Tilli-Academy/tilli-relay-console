import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { methodBadgeStyles } from '../../styles/method-colors.js';
import type { HttpMethod } from '../../styles/method-colors.js';

/**
 * <rundocs-method-badge> — Colored HTTP method label (GET, POST, etc.)
 *
 * Uses CSS custom properties (--sx-method-*) for colors, supporting both
 * light and dark mode without :host-context().
 *
 * Usage:
 *   <rundocs-method-badge method="get"></rundocs-method-badge>
 *   <rundocs-method-badge method="post" compact></rundocs-method-badge>
 */
@customElement('rundocs-method-badge')
export class RunDocsMethodBadge extends LitElement {
  static override styles = [
    methodBadgeStyles,
    css`
      :host {
        display: inline-flex;
      }

      .method-badge.get {
        background: var(--sx-method-get-bg);
        color: var(--sx-method-get-text);
        border: 1px solid var(--sx-method-get-border);
      }
      .method-badge.post {
        background: var(--sx-method-post-bg);
        color: var(--sx-method-post-text);
        border: 1px solid var(--sx-method-post-border);
      }
      .method-badge.put {
        background: var(--sx-method-put-bg);
        color: var(--sx-method-put-text);
        border: 1px solid var(--sx-method-put-border);
      }
      .method-badge.patch {
        background: var(--sx-method-patch-bg);
        color: var(--sx-method-patch-text);
        border: 1px solid var(--sx-method-patch-border);
      }
      .method-badge.delete {
        background: var(--sx-method-delete-bg);
        color: var(--sx-method-delete-text);
        border: 1px solid var(--sx-method-delete-border);
      }
      .method-badge.head {
        background: var(--sx-method-head-bg);
        color: var(--sx-method-head-text);
        border: 1px solid var(--sx-method-head-border);
      }
      .method-badge.options {
        background: var(--sx-method-options-bg);
        color: var(--sx-method-options-text);
        border: 1px solid var(--sx-method-options-border);
      }
    `,
  ];

  @property({ type: String })
  method: HttpMethod = 'get';

  @property({ type: Boolean })
  compact = false;

  override render() {
    const label = this.method.toUpperCase();

    return html`
      <span class="method-badge ${this.method}"> ${this.compact ? label.slice(0, 3) : label} </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-method-badge': RunDocsMethodBadge;
  }
}
