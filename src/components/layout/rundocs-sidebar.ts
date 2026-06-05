import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import '../shared/rundocs-empty-state.js';

/**
 * <rundocs-sidebar> — Left navigation panel with tabs for endpoints and history.
 *
 * Fires `panel-change` with { panel: 'endpoints' | 'history' }.
 */
@customElement('rundocs-sidebar')
export class RunDocsSidebar extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--sx-surface-secondary);
      }

      .sidebar-tabs {
        display: flex;
        border-bottom: 1px solid var(--sx-border);
        flex-shrink: 0;
      }

      .sidebar-tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--sx-text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        font-family: inherit;
        transition: color 0.15s, border-color 0.15s;
      }

      .sidebar-tab:hover {
        color: var(--sx-text-primary);
      }

      .sidebar-tab[aria-selected='true'] {
        color: var(--sx-accent);
        border-bottom-color: var(--sx-accent);
        font-weight: 600;
      }

      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }
    `,
  ];

  @property({ type: String })
  activePanel: 'endpoints' | 'history' = 'endpoints';

  private _switchPanel(panel: 'endpoints' | 'history') {
    this.dispatchEvent(
      new CustomEvent('panel-change', {
        detail: { panel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <div class="sidebar-tabs" role="tablist">
        <button
          class="sidebar-tab"
          role="tab"
          aria-selected=${this.activePanel === 'endpoints'}
          @click=${() => this._switchPanel('endpoints')}
        >
          <rundocs-icon name="code" size=${16}></rundocs-icon>
          Endpoints
        </button>
        <button
          class="sidebar-tab"
          role="tab"
          aria-selected=${this.activePanel === 'history'}
          @click=${() => this._switchPanel('history')}
        >
          <rundocs-icon name="clock" size=${16}></rundocs-icon>
          History
        </button>
      </div>
      <div class="sidebar-content">
        ${this.activePanel === 'endpoints'
          ? html`<slot name="endpoints"></slot>`
          : html`<slot name="history"></slot>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-sidebar': RunDocsSidebar;
  }
}
