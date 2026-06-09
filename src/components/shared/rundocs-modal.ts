import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

/**
 * <rundocs-modal> — A simple overlay modal dialog.
 *
 * Fires `modal-close` when closed via backdrop click, Escape, or close button.
 *
 * Usage:
 *   <rundocs-modal .open=${true} heading="Edit Environment" @modal-close=${handler}>
 *     <p>Modal body content here</p>
 *   </rundocs-modal>
 */
@customElement('rundocs-modal')
export class RunDocsModal extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: contents;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .modal {
        background: var(--sx-surface-primary);
        border: 1.5px solid var(--sx-border);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        max-width: 560px;
        width: 100%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--sx-border);
      }

      .modal-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--sx-text-primary);
        margin: 0;
      }

      .modal-header-extra {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      .close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        color: var(--sx-text-secondary);
        font-size: 1.125rem;
        line-height: 1;
      }

      .close-btn:hover {
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-primary);
      }

      .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
    `,
  ];

  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  heading = '';

  private _close() {
    this.dispatchEvent(
      new CustomEvent('modal-close', { bubbles: true, composed: true }),
    );
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this._close();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
  }

  override render() {
    if (!this.open) return html``;

    return html`
      <div class="backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-label=${this.heading}>
          <div class="modal-header">
            <h2 class="modal-title">${this.heading}</h2>
            <div class="modal-header-extra"><slot name="header-extra"></slot></div>
            <button class="close-btn" @click=${this._close} aria-label="Close">&times;</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-modal': RunDocsModal;
  }
}
