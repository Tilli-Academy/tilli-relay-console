import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * <rundocs-badge> — A small colored label.
 *
 * Usage:
 *   <rundocs-badge>Default</rundocs-badge>
 *   <rundocs-badge variant="success">200</rundocs-badge>
 *   <rundocs-badge variant="error">required</rundocs-badge>
 */
@customElement('rundocs-badge')
export class RunDocsBadge extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline-flex;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 1px 8px;
        border-radius: 9999px;
        font-size: 0.6875rem;
        font-weight: 600;
        line-height: 1.6;
        letter-spacing: 0.01em;
        white-space: nowrap;
      }

      .badge.default {
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-secondary);
      }

      .badge.success {
        background: var(--sx-status-success-bg);
        color: var(--sx-status-success-text);
      }

      .badge.warning {
        background: var(--sx-status-redirect-bg);
        color: var(--sx-status-redirect-text);
      }

      .badge.error {
        background: var(--sx-status-client-error-bg);
        color: var(--sx-status-client-error-text);
      }

      .badge.info {
        background: var(--sx-accent-bg-subtle);
        color: var(--sx-accent);
      }
    `,
  ];

  @property({ type: String })
  variant: BadgeVariant = 'default';

  override render() {
    return html`
      <span class="badge ${this.variant}">
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-badge': RunDocsBadge;
  }
}
