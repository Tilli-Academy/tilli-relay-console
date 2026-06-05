import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <rundocs-tooltip> — Wraps content with a hover tooltip.
 *
 * Usage:
 *   <rundocs-tooltip text="Copy to clipboard">
 *     <button>Copy</button>
 *   </rundocs-tooltip>
 */
@customElement('rundocs-tooltip')
export class RunDocsTooltip extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      position: relative;
    }

    .trigger {
      display: inline-flex;
    }

    .tip {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      background: var(--sx-text-primary, #0f172a);
      color: var(--sx-surface-primary, #fff);
      z-index: 50;
    }

    :host(:hover) .tip,
    :host(:focus-within) .tip {
      opacity: 1;
    }

    :host([position='bottom']) .tip {
      bottom: auto;
      top: calc(100% + 6px);
    }

    :host([position='left']) .tip {
      bottom: auto;
      left: auto;
      right: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
    }

    :host([position='right']) .tip {
      bottom: auto;
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
    }
  `;

  @property({ type: String })
  text = '';

  @property({ type: String, reflect: true })
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  override render() {
    return html`
      <div class="trigger">
        <slot></slot>
      </div>
      ${this.text ? html`<div class="tip" role="tooltip">${this.text}</div>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-tooltip': RunDocsTooltip;
  }
}
