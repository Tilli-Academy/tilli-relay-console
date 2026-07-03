import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

/**
 * <rundocs-split-pane> — A resizable horizontal split view.
 *
 * Fires `ratio-change` with { ratio: number } when the divider is dragged.
 *
 * Usage:
 *   <rundocs-split-pane ratio="0.25" min-ratio="0.1" max-ratio="0.5">
 *     <div slot="left">Sidebar</div>
 *     <div slot="right">Main content</div>
 *   </rundocs-split-pane>
 */
@customElement('rundocs-split-pane')
export class RunDocsSplitPane extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .left-pane {
        overflow-y: auto;
        overflow-x: hidden;
        flex-shrink: 0;
      }

      .divider {
        width: 1px;
        cursor: col-resize;
        background: var(--sx-border);
        flex-shrink: 0;
        transition:
          background 0.15s,
          width 0.15s;
        position: relative;
      }

      .divider::after {
        content: '';
        position: absolute;
        inset: 0 -4px;
      }

      .divider:hover {
        width: 3px;
        background: var(--sx-accent);
      }

      .divider.dragging {
        width: 3px;
        background: var(--sx-accent);
      }

      .right-pane {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-width: 0;
      }

      :host([collapsed]) .left-pane {
        display: none;
      }

      :host([collapsed]) .divider {
        display: none;
      }
    `,
  ];

  @property({ type: Number })
  ratio = 0.25;

  @property({ type: Number, attribute: 'min-ratio' })
  minRatio = 0.1;

  @property({ type: Number, attribute: 'max-ratio' })
  maxRatio = 0.5;

  @property({ type: Boolean, reflect: true })
  collapsed = false;

  @state()
  private _dragging = false;

  private _onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    this._dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this._dragging) return;
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let ratio = x / rect.width;
    ratio = Math.max(this.minRatio, Math.min(this.maxRatio, ratio));
    this.ratio = ratio;
    this.dispatchEvent(
      new CustomEvent('ratio-change', {
        detail: { ratio },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _onPointerUp = () => {
    this._dragging = false;
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const step = 0.02;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.ratio = Math.max(this.minRatio, this.ratio - step);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.ratio = Math.min(this.maxRatio, this.ratio + step);
    }
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
  }

  override render() {
    const leftWidth = `${this.ratio * 100}%`;

    return html`
      <div class="left-pane" style="width: ${leftWidth}">
        <slot name="left"></slot>
      </div>
      <div
        class="divider ${this._dragging ? 'dragging' : ''}"
        role="separator"
        tabindex="0"
        aria-valuenow=${Math.round(this.ratio * 100)}
        aria-valuemin=${Math.round(this.minRatio * 100)}
        aria-valuemax=${Math.round(this.maxRatio * 100)}
        aria-label="Resize pane"
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeyDown}
      ></div>
      <div class="right-pane">
        <slot name="right"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-split-pane': RunDocsSplitPane;
  }
}
