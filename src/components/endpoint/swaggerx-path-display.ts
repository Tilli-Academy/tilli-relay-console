import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

/**
 * <swaggerx-path-display> — Renders a URL path with highlighted parameters.
 *
 * Path parameters like {petId} are visually distinguished.
 *
 * Usage:
 *   <swaggerx-path-display path="/pets/{petId}/toys/{toyId}"></swaggerx-path-display>
 */
@customElement('swaggerx-path-display')
export class SwaggerXPathDisplay extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline;
      }

      .path {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--sx-text-primary);
        word-break: break-all;
      }

      .param {
        color: var(--sx-accent);
        font-weight: 600;
      }
    `,
  ];

  @property({ type: String })
  path = '';

  override render() {
    // Split path into segments, highlighting {param} tokens
    const parts = this.path.split(/(\{[^}]+\})/g);

    return html`
      <span class="path">
        ${parts.map((part) =>
          part.startsWith('{') && part.endsWith('}')
            ? html`<span class="param">${part}</span>`
            : part,
        )}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-path-display': SwaggerXPathDisplay;
  }
}
