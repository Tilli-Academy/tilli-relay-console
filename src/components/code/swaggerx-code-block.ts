import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import { highlightCode } from '../../utils/prism-highlight.js';
import '../shared/swaggerx-copy-button.js';

/**
 * <swaggerx-code-block> — Displays a code snippet with copy button.
 *
 * Supports syntax highlighting for: json, curl, javascript, nodejs, python.
 * Unsupported languages render as plain monospace text.
 */
@customElement('swaggerx-code-block')
export class SwaggerXCodeBlock extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .code-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        background: var(--sx-surface-secondary);
        border: 1px solid var(--sx-border);
        border-bottom: none;
        border-radius: var(--sx-radius-lg) var(--sx-radius-lg) 0 0;
      }

      .language-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
      }

      .code-content {
        margin: 0;
        padding: 14px;
        border: 1px solid var(--sx-border);
        border-radius: 0 0 var(--sx-radius-lg) var(--sx-radius-lg);
        background: var(--sx-surface-tertiary);
        overflow-x: auto;
      }

      .code-content code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
        color: var(--sx-text-primary);
        white-space: pre;
      }

      /* Prism.js syntax highlighting — mapped to theme variables */
      .token.property,
      .token.tag,
      .token.keyword { color: var(--sx-syntax-key); }
      .token.string,
      .token.attr-value { color: var(--sx-syntax-string); }
      .token.number { color: var(--sx-syntax-number); }
      .token.boolean,
      .token.builtin,
      .token.function { color: var(--sx-syntax-boolean); }
      .token.operator { color: var(--sx-syntax-key); }
      .token.comment { color: var(--sx-syntax-null); font-style: italic; }
      .token.punctuation { color: var(--sx-syntax-bracket); }
      .token.class-name { color: var(--sx-syntax-number); }
      .token.null { color: var(--sx-syntax-null); }
      /* API-specific tokens */
      .token.flag { color: var(--sx-syntax-number); }
      .token.http-method { color: var(--sx-syntax-boolean); }
      .token.method-call .token.function { color: var(--sx-syntax-boolean); }
    `,
  ];

  @property({ type: String })
  code = '';

  @property({ type: String })
  language = '';

  @property({ type: String })
  label = '';

  override render() {
    const highlighted = highlightCode(this.code, this.language);

    return html`
      <div class="code-header">
        <span class="language-label">${this.label || this.language}</span>
        <swaggerx-copy-button text=${this.code}></swaggerx-copy-button>
      </div>
      ${highlighted
        ? html`<pre class="code-content"><code>${unsafeHTML(highlighted)}</code></pre>`
        : html`<pre class="code-content"><code>${this.code}</code></pre>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-code-block': SwaggerXCodeBlock;
  }
}
