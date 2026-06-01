import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <swaggerx-status-badge> — Colored HTTP status code badge.
 *
 * Colors:
 *   2xx → green, 3xx → blue, 4xx → amber, 5xx → red, 0 → gray (error)
 */
@customElement('swaggerx-status-badge')
export class SwaggerXStatusBadge extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: var(--sx-radius-md, 6px);
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-weight: 700;
      font-size: 0.875rem;
      line-height: 1;
    }

    .badge.success {
      background: var(--sx-status-success-bg);
      color: var(--sx-status-success-text);
    }

    .badge.redirect {
      background: var(--sx-status-redirect-bg);
      color: var(--sx-status-redirect-text);
    }

    .badge.client-error {
      background: var(--sx-status-client-error-bg);
      color: var(--sx-status-client-error-text);
    }

    .badge.server-error {
      background: var(--sx-status-server-error-bg);
      color: var(--sx-status-server-error-text);
    }

    .badge.network-error {
      background: var(--sx-surface-tertiary);
      color: var(--sx-text-secondary);
    }

    .status-text {
      font-weight: 500;
      font-size: 0.75rem;
      font-family: 'Inter', system-ui, sans-serif;
    }
  `;

  @property({ type: Number })
  status = 0;

  @property({ type: String })
  statusText = '';

  private _getVariant(): string {
    if (this.status === 0) return 'network-error';
    if (this.status < 300) return 'success';
    if (this.status < 400) return 'redirect';
    if (this.status < 500) return 'client-error';
    return 'server-error';
  }

  override render() {
    return html`
      <span class="badge ${this._getVariant()}">
        ${this.status === 0 ? 'ERR' : this.status}
        <span class="status-text">${this.statusText}</span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-status-badge': SwaggerXStatusBadge;
  }
}
