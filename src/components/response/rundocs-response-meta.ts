import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import './rundocs-status-badge.js';

/**
 * <rundocs-response-meta> — Status badge, response time, and response size.
 */
@customElement('rundocs-response-meta')
export class RunDocsResponseMeta extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: var(--sx-text-secondary);
      }

      .meta-label {
        font-weight: 600;
        color: var(--sx-text-muted);
      }

      .meta-value {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-weight: 500;
      }

      .meta-value.fast {
        color: var(--sx-success);
      }

      .meta-value.medium {
        color: var(--sx-warning);
      }

      .meta-value.slow {
        color: var(--sx-error);
      }
    `,
  ];

  @property({ type: Number })
  status = 0;

  @property({ type: String, attribute: 'status-text' })
  statusText = '';

  @property({ type: Number })
  time = 0;

  @property({ type: Number })
  size = 0;

  private _formatTime(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  }

  private _getTimeClass(ms: number): string {
    if (ms < 300) return 'fast';
    if (ms < 1000) return 'medium';
    return 'slow';
  }

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  override render() {
    return html`
      <div class="meta-row">
        <rundocs-status-badge
          status=${this.status}
          statusText=${this.statusText}
        ></rundocs-status-badge>
        <div class="meta-item">
          <span class="meta-label">Time:</span>
          <span class="meta-value ${this._getTimeClass(this.time)}"
            >${this._formatTime(this.time)}</span
          >
        </div>
        <div class="meta-item">
          <span class="meta-label">Size:</span>
          <span class="meta-value">${this._formatSize(this.size)}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-response-meta': RunDocsResponseMeta;
  }
}
