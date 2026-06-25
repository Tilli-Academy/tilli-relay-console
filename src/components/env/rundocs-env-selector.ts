import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import type { Environment } from '../../core/types.js';

/**
 * <rundocs-env-selector> — Dropdown to select the active environment.
 *
 * Fires:
 *   - `env-select` with { id: string | null }
 *   - `env-manage` (open environment manager)
 */
@customElement('rundocs-env-selector')
export class RunDocsEnvSelector extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .env-select {
        padding: 4px 8px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.75rem;
        font-family: inherit;
        outline: none;
        cursor: pointer;
        min-width: 120px;
      }

      .env-select:focus {
        border-color: var(--sx-accent);
      }

      .manage-btn {
        display: inline-flex;
        align-items: center;
        padding: 4px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-secondary);
        cursor: pointer;
      }

      .manage-btn:hover {
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-primary);
      }
    `,
  ];

  @property({ type: Array })
  environments: Environment[] = [];

  @property({ type: String, attribute: 'active-id' })
  activeId: string | null = null;

  private _onChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.dispatchEvent(
      new CustomEvent('env-select', {
        detail: { id: value || null },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onManage() {
    this.dispatchEvent(new CustomEvent('env-manage', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <select
        class="env-select"
        .value=${this.activeId ?? ''}
        @change=${this._onChange}
        aria-label="Select environment"
      >
        <option value="">No Environment</option>
        ${this.environments.map(
          (env) => html`
            <option value=${env.id} ?selected=${env.id === this.activeId}>${env.name}</option>
          `,
        )}
      </select>
      <button class="manage-btn" @click=${this._onManage} aria-label="Manage environments">
        <rundocs-icon name="globe" size=${14}></rundocs-icon>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-env-selector': RunDocsEnvSelector;
  }
}
