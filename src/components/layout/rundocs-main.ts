import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

/**
 * <rundocs-main> — Main content area that holds endpoint detail views.
 *
 * Usage:
 *   <rundocs-main>
 *     <rundocs-endpoint ...></rundocs-endpoint>
 *   </rundocs-main>
 */
@customElement('rundocs-main')
export class RunDocsMain extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
        background: var(--sx-surface-primary);
      }

      .main-content {
        max-width: 960px;
        margin: 0 auto;
        padding: 24px 32px;
      }
    `,
  ];

  override render() {
    return html`
      <div class="main-content">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-main': RunDocsMain;
  }
}
