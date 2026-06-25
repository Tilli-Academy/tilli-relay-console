import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-tabs.js';
import './rundocs-response-meta.js';
import './rundocs-response-headers.js';
import './rundocs-response-body.js';
import type { ResponseState } from '../../core/types.js';
import type { TabDef } from '../shared/rundocs-tabs.js';

/**
 * <rundocs-response> — Response viewer container.
 *
 * Shows status badge + meta, and tabs for Body | Headers.
 */
@customElement('rundocs-response')
export class RunDocsResponse extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .response-container {
        overflow: hidden;
        background: var(--sx-surface-primary);
        position: relative;
      }

      .loading-overlay {
        position: absolute;
        inset: 0;
        background: var(--sx-surface-primary, #fff);
        opacity: 0.7;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .loading-spinner {
        width: 28px;
        height: 28px;
        border: 3px solid var(--sx-border);
        border-top-color: var(--sx-accent);
        border-radius: 50%;
        animation: sx-spin 0.8s linear infinite;
      }

      @keyframes sx-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .response-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--sx-border);
        background: var(--sx-surface-card);
      }

      .response-title {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
        margin: 0 0 8px;
      }

      .tab-area {
        padding: 0 16px;
      }

      .tab-content {
        padding: 12px 16px;
      }

      .error-body {
        padding: 16px;
        font-size: 0.8125rem;
        color: var(--sx-error);
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        line-height: 1.6;
      }
    `,
  ];

  @property({ type: Object })
  response: ResponseState | null = null;

  @property({ type: Boolean })
  loading = false;

  @state()
  private _activeTab = 'body';

  private get _tabs(): TabDef[] {
    if (!this.response) return [];
    const headerCount = Object.keys(this.response.headers).length;
    return [
      { id: 'body', label: 'Body' },
      {
        id: 'headers',
        label: 'Headers',
        badge: headerCount > 0 ? String(headerCount) : undefined,
      },
    ];
  }

  override render() {
    if (!this.response) return nothing;

    const resp = this.response;

    // Network/CORS error
    if (resp.status === 0) {
      return html`
        <div class="response-container">
          <div class="response-header">
            <div class="response-title">Response</div>
            <rundocs-response-meta
              status=${resp.status}
              status-text=${resp.statusText}
              time=${resp.time}
              size=${resp.size}
            ></rundocs-response-meta>
          </div>
          <div class="error-body">${resp.body}</div>
        </div>
      `;
    }

    return html`
      <div class="response-container">
        ${this.loading
          ? html`<div class="loading-overlay"><div class="loading-spinner"></div></div>`
          : nothing}
        <div class="response-header">
          <div class="response-title">Response</div>
          <rundocs-response-meta
            status=${resp.status}
            status-text=${resp.statusText}
            time=${resp.time}
            size=${resp.size}
          ></rundocs-response-meta>
        </div>
        <div class="tab-area">
          <rundocs-tabs
            .tabs=${this._tabs}
            active=${this._activeTab}
            @tab-change=${(e: CustomEvent) => {
              this._activeTab = e.detail.tab;
            }}
          ></rundocs-tabs>
        </div>
        <div class="tab-content">
          ${this._activeTab === 'body'
            ? html`
                <rundocs-response-body
                  body=${resp.body}
                  content-type=${resp.contentType}
                ></rundocs-response-body>
              `
            : nothing}
          ${this._activeTab === 'headers'
            ? html` <rundocs-response-headers .headers=${resp.headers}></rundocs-response-headers> `
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-response': RunDocsResponse;
  }
}
