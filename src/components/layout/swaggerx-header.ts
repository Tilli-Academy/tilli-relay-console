import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-icon.js';
import '../shared/swaggerx-tooltip.js';

/**
 * <swaggerx-header> — Top bar with logo, API info, env selector, and theme toggle.
 *
 * Fires:
 *   - `theme-toggle` when theme button is clicked
 *   - `sidebar-toggle` when sidebar toggle is clicked
 */
@customElement('swaggerx-header')
export class SwaggerXHeader extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        border-bottom: 1px solid var(--sx-border);
        background: var(--sx-surface-primary);
        height: 52px;
        box-shadow: var(--sx-shadow-sm);
      }

      .left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .sidebar-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1.5px solid var(--sx-border);
        border-radius: 6px;
        background: none;
        cursor: pointer;
        color: var(--sx-text-secondary);
        padding: 0;
      }

      .sidebar-btn:hover {
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
      }

      .logo {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--sx-accent);
        letter-spacing: -0.025em;
      }

      .divider {
        width: 1px;
        height: 20px;
        background: var(--sx-border);
      }

      .api-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .api-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--sx-text-primary);
      }

      .api-version {
        font-size: 0.6875rem;
        padding: 1px 8px;
        border-radius: 9999px;
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-secondary);
        font-weight: 500;
      }

      .right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1.5px solid var(--sx-border);
        border-radius: var(--sx-radius-md);
        background: none;
        cursor: pointer;
        color: var(--sx-text-secondary);
        padding: 0;
        transition: background 0.12s, color 0.12s, box-shadow 0.12s;
      }

      .icon-btn:hover {
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        box-shadow: var(--sx-shadow-sm);
      }
    `,
  ];

  @property({ type: String, attribute: 'api-title' })
  apiTitle = '';

  @property({ type: String, attribute: 'api-version' })
  apiVersion = '';

  @property({ type: String })
  theme: 'light' | 'dark' = 'light';

  private _toggleTheme() {
    this.dispatchEvent(
      new CustomEvent('theme-toggle', { bubbles: true, composed: true }),
    );
  }

  private _toggleSidebar() {
    this.dispatchEvent(
      new CustomEvent('sidebar-toggle', { bubbles: true, composed: true }),
    );
  }

  override render() {
    return html`
      <header>
        <div class="left">
          <swaggerx-tooltip text="Toggle sidebar">
            <button class="sidebar-btn" @click=${this._toggleSidebar} aria-label="Toggle sidebar">
              <swaggerx-icon name="sidebar-left" size=${18}></swaggerx-icon>
            </button>
          </swaggerx-tooltip>
          <span class="logo">SwaggerX</span>
          ${this.apiTitle
            ? html`
                <span class="divider"></span>
                <div class="api-info">
                  <span class="api-title">${this.apiTitle}</span>
                  ${this.apiVersion ? html`<span class="api-version">v${this.apiVersion}</span>` : ''}
                </div>
              `
            : ''}
        </div>
        <div class="right">
          <slot name="actions"></slot>
          <swaggerx-tooltip text=${this.theme === 'light' ? 'Dark mode' : 'Light mode'}>
            <button class="icon-btn" @click=${this._toggleTheme} aria-label="Toggle theme">
              <swaggerx-icon name=${this.theme === 'light' ? 'moon' : 'sun'} size=${18}></swaggerx-icon>
            </button>
          </swaggerx-tooltip>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-header': SwaggerXHeader;
  }
}
