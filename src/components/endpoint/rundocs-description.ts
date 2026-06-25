import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { baseStyles } from '../../styles/theme.js';
import { markdownToHtml } from '../../utils/markdown.js';

/**
 * <rundocs-description> — Renders markdown description as styled HTML.
 *
 * Usage:
 *   <rundocs-description text="This endpoint **creates** a new pet."></rundocs-description>
 */
@customElement('rundocs-description')
export class RunDocsDescription extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        font-size: 0.875rem;
        color: var(--sx-text-secondary);
        line-height: 1.65;
      }

      .content h1,
      .content h2,
      .content h3,
      .content h4 {
        color: var(--sx-text-primary);
        margin: 16px 0 8px;
        line-height: 1.3;
      }

      .content h1 {
        font-size: 1.25rem;
      }
      .content h2 {
        font-size: 1.125rem;
      }
      .content h3 {
        font-size: 1rem;
      }
      .content h4 {
        font-size: 0.875rem;
      }

      .content p {
        margin: 8px 0;
      }

      .content a {
        color: var(--sx-accent);
        text-decoration: none;
      }

      .content a:hover {
        text-decoration: underline;
      }

      .content code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        background: var(--sx-surface-tertiary);
        padding: 1px 5px;
        border-radius: 4px;
      }

      .content pre {
        background: var(--sx-surface-tertiary);
        padding: 12px 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 12px 0;
      }

      .content pre code {
        background: none;
        padding: 0;
      }

      .content ul {
        padding-left: 20px;
        margin: 8px 0;
      }

      .content li {
        margin: 4px 0;
      }

      .content strong {
        color: var(--sx-text-primary);
        font-weight: 600;
      }
    `,
  ];

  @property({ type: String })
  text = '';

  override render() {
    if (!this.text) return html``;
    return html`<div class="content">${unsafeHTML(markdownToHtml(this.text))}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-description': RunDocsDescription;
  }
}
