import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';

export interface TabDef {
  id: string;
  label: string;
  badge?: string;
}

/**
 * <swaggerx-tabs> — A horizontal tab bar.
 *
 * Fires `tab-change` CustomEvent with { tab: string } when a tab is clicked.
 *
 * Usage:
 *   <swaggerx-tabs
 *     .tabs=${[{ id: 'params', label: 'Params' }, { id: 'headers', label: 'Headers', badge: '3' }]}
 *     active="params"
 *     @tab-change=${(e) => console.log(e.detail.tab)}
 *   ></swaggerx-tabs>
 */
@customElement('swaggerx-tabs')
export class SwaggerXTabs extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .tabs-container {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--sx-border);
      }

      .tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--sx-text-secondary);
        border-bottom: 2px solid transparent;
        border-radius: var(--sx-radius-sm) var(--sx-radius-sm) 0 0;
        margin-bottom: -2px;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
        font-family: inherit;
      }

      .tab:hover {
        color: var(--sx-text-primary);
        background: var(--sx-surface-tertiary);
      }

      .tab[aria-selected='true'] {
        color: var(--sx-accent);
        border-bottom-color: var(--sx-accent);
        font-weight: 600;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9px;
        font-size: 0.6875rem;
        font-weight: 600;
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-secondary);
      }

      .tab[aria-selected='true'] .badge {
        background: var(--sx-accent);
        color: #fff;
      }
    `,
  ];

  @property({ type: Array })
  tabs: TabDef[] = [];

  @property({ type: String })
  active = '';

  private _onTabClick(tabId: string) {
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tab: tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <div class="tabs-container" role="tablist">
        ${this.tabs.map(
          (tab) => html`
            <button
              class="tab"
              role="tab"
              aria-selected=${this.active === tab.id}
              @click=${() => this._onTabClick(tab.id)}
            >
              ${tab.label}
              ${tab.badge ? html`<span class="badge">${tab.badge}</span>` : ''}
            </button>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-tabs': SwaggerXTabs;
  }
}
