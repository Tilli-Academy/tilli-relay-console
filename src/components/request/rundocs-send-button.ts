import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../shared/rundocs-icon.js';

/**
 * <rundocs-send-button> — Send request button with loading state.
 *
 * Fires `send-request` on click.
 */
@customElement('rundocs-send-button')
export class RunDocsSendButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      background: var(--sx-accent);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }

    button:hover:not(:disabled) {
      background: var(--sx-accent-hover);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @property({ type: Boolean })
  loading = false;

  private _onClick() {
    if (this.loading) return;
    this.dispatchEvent(new CustomEvent('send-request', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <button @click=${this._onClick} ?disabled=${this.loading}>
        ${this.loading
          ? html`<div class="spinner"></div>
              Sending...`
          : html`<rundocs-icon name="send" size=${16}></rundocs-icon> Send`}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-send-button': RunDocsSendButton;
  }
}
