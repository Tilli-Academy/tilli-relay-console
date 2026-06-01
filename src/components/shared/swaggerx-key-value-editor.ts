import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import './swaggerx-icon.js';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

/**
 * <swaggerx-key-value-editor> — Editable key-value pair list (for headers, params, env vars).
 *
 * Fires:
 *   - `kv-change` with { pairs: KeyValuePair[] } on any change
 *
 * Usage:
 *   <swaggerx-key-value-editor
 *     .pairs=${[{ key: 'Authorization', value: 'Bearer token', enabled: true }]}
 *     @kv-change=${(e) => console.log(e.detail.pairs)}
 *   ></swaggerx-key-value-editor>
 */
@customElement('swaggerx-key-value-editor')
export class SwaggerXKeyValueEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .row {
        display: grid;
        grid-template-columns: auto 1fr 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 4px 0;
      }

      .header-row {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
        padding-bottom: 6px;
        border-bottom: 1px solid var(--sx-border);
        margin-bottom: 4px;
      }

      .header-row .placeholder {
        width: 20px;
      }

      input[type='text'] {
        width: 100%;
        padding: 6px 10px;
        border: 1.5px solid var(--sx-border);
        border-radius: var(--sx-radius-md);
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      input[type='text']:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      input[type='text']::placeholder {
        color: var(--sx-text-muted);
      }

      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: var(--sx-accent);
      }

      .remove-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--sx-text-muted);
        padding: 0;
      }

      .remove-btn:hover {
        background: var(--sx-surface-tertiary);
        color: var(--sx-error);
      }

      .add-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        margin-top: 8px;
        border: 1.5px dashed var(--sx-border);
        border-radius: 6px;
        background: none;
        cursor: pointer;
        color: var(--sx-text-secondary);
        font-size: 0.8125rem;
        font-family: inherit;
      }

      .add-btn:hover {
        border-color: var(--sx-accent);
        color: var(--sx-accent);
        background: var(--sx-surface-secondary);
      }

      .disabled-row input[type='text'] {
        opacity: 0.5;
      }
    `,
  ];

  @property({ type: Array })
  pairs: KeyValuePair[] = [];

  @property({ type: Boolean })
  readonly = false;

  @property({ type: String, attribute: 'key-placeholder' })
  keyPlaceholder = 'Key';

  @property({ type: String, attribute: 'value-placeholder' })
  valuePlaceholder = 'Value';

  private _emit() {
    this.dispatchEvent(
      new CustomEvent('kv-change', {
        detail: { pairs: [...this.pairs] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _toggleEnabled(index: number) {
    this.pairs = this.pairs.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p,
    );
    this._emit();
  }

  private _updateKey(index: number, key: string) {
    this.pairs = this.pairs.map((p, i) => (i === index ? { ...p, key } : p));
    this._emit();
  }

  private _updateValue(index: number, value: string) {
    this.pairs = this.pairs.map((p, i) => (i === index ? { ...p, value } : p));
    this._emit();
  }

  private _removeRow(index: number) {
    this.pairs = this.pairs.filter((_, i) => i !== index);
    this._emit();
  }

  private _addRow() {
    this.pairs = [...this.pairs, { key: '', value: '', enabled: true }];
    this._emit();
  }

  override render() {
    return html`
      ${this.pairs.length > 0
        ? html`
            <div class="row header-row">
              <div class="placeholder"></div>
              <div>${this.keyPlaceholder}</div>
              <div>${this.valuePlaceholder}</div>
              <div class="placeholder"></div>
            </div>
          `
        : nothing}
      ${this.pairs.map(
        (pair, index) => html`
          <div class="row ${pair.enabled ? '' : 'disabled-row'}">
            <input
              type="checkbox"
              .checked=${pair.enabled}
              @change=${() => this._toggleEnabled(index)}
              ?disabled=${this.readonly}
            />
            <input
              type="text"
              .value=${pair.key}
              placeholder=${this.keyPlaceholder}
              @input=${(e: InputEvent) => this._updateKey(index, (e.target as HTMLInputElement).value)}
              ?disabled=${this.readonly}
            />
            <input
              type="text"
              .value=${pair.value}
              placeholder=${this.valuePlaceholder}
              @input=${(e: InputEvent) => this._updateValue(index, (e.target as HTMLInputElement).value)}
              ?disabled=${this.readonly}
            />
            ${!this.readonly
              ? html`
                  <button class="remove-btn" @click=${() => this._removeRow(index)} aria-label="Remove row">
                    <swaggerx-icon name="minus" size=${14}></swaggerx-icon>
                  </button>
                `
              : html`<div></div>`}
          </div>
        `,
      )}
      ${!this.readonly
        ? html`
            <button class="add-btn" @click=${this._addRow}>
              <swaggerx-icon name="plus" size=${14}></swaggerx-icon>
              Add row
            </button>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-key-value-editor': SwaggerXKeyValueEditor;
  }
}
