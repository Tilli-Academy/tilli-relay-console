import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <swaggerx-loading> — A spinner/loading indicator.
 *
 * Usage:
 *   <swaggerx-loading></swaggerx-loading>
 *   <swaggerx-loading message="Loading API spec..."></swaggerx-loading>
 *   <swaggerx-loading size="small"></swaggerx-loading>
 */
@customElement('swaggerx-loading')
export class SwaggerXLoading extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
    }

    .spinner {
      border: 2px solid var(--sx-border);
      border-top-color: var(--sx-accent);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    :host([size='small']) .spinner {
      width: 16px;
      height: 16px;
    }

    :host(:not([size])) .spinner,
    :host([size='medium']) .spinner {
      width: 24px;
      height: 24px;
    }

    :host([size='large']) .spinner {
      width: 36px;
      height: 36px;
      border-width: 3px;
    }

    .message {
      font-size: 0.875rem;
      color: var(--sx-text-secondary);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @property({ type: String })
  message = '';

  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' = 'medium';

  override render() {
    return html`
      <div class="spinner"></div>
      ${this.message ? html`<span class="message">${this.message}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-loading': SwaggerXLoading;
  }
}
