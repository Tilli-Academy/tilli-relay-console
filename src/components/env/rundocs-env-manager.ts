import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import '../shared/rundocs-modal.js';
import '../shared/rundocs-key-value-editor.js';
import type { Environment } from '../../core/types.js';
import type { KeyValuePair } from '../shared/rundocs-key-value-editor.js';

/**
 * <rundocs-env-manager> — Modal for managing environments and variables.
 *
 * Fires:
 *   - `env-add` with { name }
 *   - `env-remove` with { id }
 *   - `env-update` with { id, name?, variables? }
 *   - `env-close`
 */
@customElement('rundocs-env-manager')
export class RunDocsEnvManager extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .env-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 16px;
      }

      .env-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        cursor: pointer;
        transition: background 0.1s;
      }

      .env-item:hover {
        background: var(--sx-surface-secondary);
      }

      .env-item.selected {
        background: var(--sx-surface-secondary);
        border-left: 3px solid var(--sx-accent);
      }

      .env-name {
        flex: 1;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--sx-text-primary);
      }

      .env-count {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
      }

      .remove-btn {
        display: none;
        padding: 2px;
        border: none;
        background: none;
        color: var(--sx-text-muted);
        cursor: pointer;
        border-radius: 4px;
      }

      .remove-btn:hover {
        color: var(--sx-error);
      }

      .env-item:hover .remove-btn {
        display: inline-flex;
      }

      .add-row {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .add-input {
        flex: 1;
        padding: 6px 10px;
        border: 1.5px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: inherit;
        outline: none;
      }

      .add-input:focus {
        border-color: var(--sx-accent);
      }

      .add-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: var(--sx-accent);
        color: #fff;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }

      .add-btn:hover {
        background: var(--sx-accent-hover);
      }

      .divider {
        height: 1px;
        background: var(--sx-border);
        margin: 16px 0;
      }

      .vars-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--sx-text-primary);
        margin: 0 0 12px;
      }

      .no-selection {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        text-align: center;
        padding: 24px 0;
      }

      .auto-save-text {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
        font-weight: 400;
        transition: opacity 0.3s ease;
      }

      .vars-section {
        animation: vars-fade-in 0.2s ease-out;
      }

      @keyframes vars-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ];

  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  environments: Environment[] = [];

  @state()
  private _selectedId: string | null = null;

  @state()
  private _newEnvName = '';

  @state()
  private _autoSaveVisible = false;

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;

  // Store raw pairs per environment (preserves empty rows)
  private _envPairsMap = new Map<string, KeyValuePair[]>();

  private get _selectedEnv(): Environment | null {
    return this.environments.find((e) => e.id === this._selectedId) ?? null;
  }

  private _onAdd() {
    const name = this._newEnvName.trim();
    if (!name) return;
    this.dispatchEvent(
      new CustomEvent('env-add', { detail: { name }, bubbles: true, composed: true }),
    );
    this._newEnvName = '';
  }

  private _onAddKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') this._onAdd();
  }

  private _onRemove(id: string, e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('env-remove', { detail: { id }, bubbles: true, composed: true }),
    );
    if (this._selectedId === id) {
      this._selectedId = null;
    }
  }

  private _onVarsChange(e: CustomEvent<{ pairs: KeyValuePair[] }>) {
    if (!this._selectedId) return;

    // Save raw pairs (preserves empty rows)
    this._envPairsMap.set(this._selectedId, e.detail.pairs);

    // Update store with non-empty variables only
    const variables: Record<string, string> = {};
    for (const pair of e.detail.pairs) {
      if (pair.enabled && pair.key) {
        variables[pair.key] = pair.value;
      }
    }
    this.dispatchEvent(
      new CustomEvent('env-update', {
        detail: { id: this._selectedId, variables },
        bubbles: true,
        composed: true,
      }),
    );

    // Show auto-save indicator after user stops typing (500ms debounce)
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this._autoSaveVisible = false;
    this._debounceTimer = setTimeout(() => {
      this._autoSaveVisible = true;
      this._hideTimer = setTimeout(() => {
        this._autoSaveVisible = false;
      }, 1500);
    }, 500);
  }

  private _onClose() {
    this.dispatchEvent(new CustomEvent('env-close', { bubbles: true, composed: true }));
  }

  private _getVarPairs(env: Environment): KeyValuePair[] {
    // Return saved raw pairs if available (preserves empty rows)
    const saved = this._envPairsMap.get(env.id);
    if (saved) return saved;

    // Otherwise build from environment variables
    return Object.entries(env.variables).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <rundocs-modal ?open=${this.open} heading="Manage Environments" @modal-close=${this._onClose}>
        ${this._autoSaveVisible
          ? html`<span slot="header-extra" class="auto-save-text">✓ Auto-saved</span>`
          : nothing}

        <div class="add-row">
          <input
            class="add-input"
            type="text"
            placeholder="New environment name"
            .value=${this._newEnvName}
            @input=${(e: InputEvent) => {
              this._newEnvName = (e.target as HTMLInputElement).value;
            }}
            @keydown=${this._onAddKeyDown}
          />
          <button class="add-btn" @click=${this._onAdd}>
            <rundocs-icon name="plus" size=${14}></rundocs-icon>
            Add
          </button>
        </div>

        <div class="env-list">
          ${this.environments.map(
            (env) => html`
              <div
                class="env-item ${this._selectedId === env.id ? 'selected' : ''}"
                role="button"
                tabindex="0"
                aria-label="Select environment: ${env.name}"
                @click=${() => {
                  this._selectedId = env.id;
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._selectedId = env.id;
                  }
                }}
              >
                <span class="env-name">${env.name}</span>
                <span class="env-count">${Object.keys(env.variables).length} vars</span>
                <button
                  class="remove-btn"
                  @click=${(e: Event) => this._onRemove(env.id, e)}
                  aria-label="Remove"
                >
                  <rundocs-icon name="trash" size=${14}></rundocs-icon>
                </button>
              </div>
            `,
          )}
        </div>

        ${this._selectedEnv
          ? keyed(
              this._selectedEnv.id,
              html`
                <div class="vars-section">
                  <div class="divider"></div>
                  <h4 class="vars-title">${this._selectedEnv.name} — Variables</h4>
                  <rundocs-key-value-editor
                    .pairs=${this._getVarPairs(this._selectedEnv)}
                    key-placeholder="Variable name"
                    value-placeholder="Value"
                    @kv-change=${this._onVarsChange}
                  ></rundocs-key-value-editor>
                </div>
              `,
            )
          : html`<div class="no-selection">Select an environment to edit its variables</div>`}
      </rundocs-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-env-manager': RunDocsEnvManager;
  }
}
