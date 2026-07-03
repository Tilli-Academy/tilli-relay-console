import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './rundocs-icon.js';

/**
 * <rundocs-copy-button> — Copies text to clipboard with visual feedback.
 *
 * Usage:
 *   <rundocs-copy-button text="curl https://api.example.com"></rundocs-copy-button>
 */
@customElement('rundocs-copy-button')
export class RunDocsCopyButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: 1px solid var(--sx-border);
      border-radius: 6px;
      background: var(--sx-surface-secondary);
      color: var(--sx-text-secondary);
      cursor: pointer;
      font-size: 0.75rem;
      font-family: inherit;
      transition:
        background 0.15s,
        color 0.15s;
    }

    button:hover {
      background: var(--sx-surface-tertiary);
      color: var(--sx-text-primary);
    }

    button.copied {
      color: var(--sx-success);
      border-color: var(--sx-success);
    }
  `;

  @property({ type: String })
  text = '';

  @state()
  private _copied = false;

  private async _copy() {
    try {
      await navigator.clipboard.writeText(this.text);
      this._copied = true;
      setTimeout(() => {
        this._copied = false;
      }, 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = this.text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this._copied = true;
      setTimeout(() => {
        this._copied = false;
      }, 2000);
    }
  }

  override render() {
    return html`
      <button
        class=${this._copied ? 'copied' : ''}
        @click=${this._copy}
        aria-label="Copy to clipboard"
      >
        <rundocs-icon name=${this._copied ? 'check' : 'copy'} size=${14}></rundocs-icon>
        ${this._copied ? 'Copied' : 'Copy'}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-copy-button': RunDocsCopyButton;
  }
}
