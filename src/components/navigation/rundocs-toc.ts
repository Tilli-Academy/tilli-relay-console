import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import type { ApiInfo, ServerInfo } from '../../core/types.js';

/**
 * <rundocs-toc> — API overview section at the top of the sidebar.
 *
 * Shows API description, server URLs, and contact/license info.
 */
@customElement('rundocs-toc')
export class RunDocsToc extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 12px;
        border-bottom: 1px solid var(--sx-border-subtle);
      }

      .description {
        font-size: 0.8125rem;
        color: var(--sx-text-secondary);
        line-height: 1.5;
        margin: 0 0 8px;
      }

      .servers {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .server {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
      }

      .server-url {
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-accent);
        word-break: break-all;
      }

      .server-desc {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .meta-item {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
      }

      .meta-link {
        color: var(--sx-accent);
        text-decoration: none;
      }

      .meta-link:hover {
        text-decoration: underline;
      }
    `,
  ];

  @property({ type: Object })
  info: ApiInfo | null = null;

  @property({ type: Array })
  servers: ServerInfo[] = [];

  override render() {
    if (!this.info) return nothing;

    return html`
      ${this.info.description
        ? html`<p class="description">${this.info.description}</p>`
        : nothing}

      ${this.servers.length > 0
        ? html`
            <ul class="servers">
              ${this.servers.map(
                (s) => html`
                  <li class="server">
                    <rundocs-icon name="globe" size=${14}></rundocs-icon>
                    <span class="server-url">${s.url}</span>
                    ${s.description ? html`<span class="server-desc">(${s.description})</span>` : ''}
                  </li>
                `,
              )}
            </ul>
          `
        : nothing}

      <div class="meta">
        ${this.info.contact?.email
          ? html`<span class="meta-item">
              <a class="meta-link" href="mailto:${this.info.contact.email}">${this.info.contact.email}</a>
            </span>`
          : nothing}
        ${this.info.license
          ? html`<span class="meta-item">
              ${this.info.license.url
                ? html`<a class="meta-link" href=${this.info.license.url} target="_blank">${this.info.license.name}</a>`
                : this.info.license.name}
            </span>`
          : nothing}
        ${this.info.termsOfService
          ? html`<span class="meta-item">
              <a class="meta-link" href=${this.info.termsOfService} target="_blank">Terms</a>
            </span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-toc': RunDocsToc;
  }
}
