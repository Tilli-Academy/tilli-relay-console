import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

/**
 * <swaggerx-response-headers> — Displays response headers in a table.
 */
@customElement('swaggerx-response-headers')
export class SwaggerXResponseHeaders extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .headers-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }

      .headers-table th {
        text-align: left;
        font-weight: 600;
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
        padding: 6px 12px;
        border-bottom: 2px solid var(--sx-border);
      }

      .headers-table td {
        padding: 8px 12px;
        border-bottom: 1px solid var(--sx-border);
        vertical-align: top;
        word-break: break-all;
      }

      .header-name {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-weight: 600;
        color: var(--sx-text-primary);
        white-space: nowrap;
      }

      .header-value {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-text-secondary);
        font-size: 0.75rem;
      }

      .empty {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        padding: 16px 0;
        text-align: center;
      }
    `,
  ];

  @property({ type: Object })
  headers: Record<string, string> = {};

  override render() {
    const entries = Object.entries(this.headers);
    if (entries.length === 0) {
      return html`<div class="empty">No response headers</div>`;
    }

    return html`
      <table class="headers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(
            ([name, value]) => html`
              <tr>
                <td><span class="header-name">${name}</span></td>
                <td><span class="header-value">${value}</span></td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-response-headers': SwaggerXResponseHeaders;
  }
}
