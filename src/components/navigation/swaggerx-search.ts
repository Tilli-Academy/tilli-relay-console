import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-icon.js';

/**
 * <swaggerx-search> — Fuzzy search input for filtering endpoints.
 *
 * Fires `search-input` with { query: string } on input.
 * Fires `search-clear` when the clear button is clicked.
 */
@customElement('swaggerx-search')
export class SwaggerXSearch extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding: 10px 12px;
        border-bottom: 1px solid var(--sx-border);
      }

      .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 10px;
        color: var(--sx-text-muted);
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 8px 32px 8px 34px;
        border: 1.5px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-primary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      input:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      input::placeholder {
        color: var(--sx-text-muted);
      }

      .clear-btn {
        position: absolute;
        right: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--sx-text-muted);
        padding: 0;
      }

      .clear-btn:hover {
        color: var(--sx-text-primary);
        background: var(--sx-surface-tertiary);
      }
    `,
  ];

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = 'Search endpoints...';

  @state()
  private _hasValue = false;

  private _onInput(e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    this._hasValue = value.length > 0;
    this.dispatchEvent(
      new CustomEvent('search-input', {
        detail: { query: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onClear() {
    this._hasValue = false;
    const input = this.shadowRoot!.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
    this.dispatchEvent(
      new CustomEvent('search-input', {
        detail: { query: '' },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('search-clear', { bubbles: true, composed: true }),
    );
  }

  override render() {
    return html`
      <div class="search-wrapper">
        <swaggerx-icon class="search-icon" name="search" size=${16}></swaggerx-icon>
        <input
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this._onInput}
          aria-label="Search endpoints"
        />
        ${this._hasValue
          ? html`
              <button class="clear-btn" @click=${this._onClear} aria-label="Clear search">
                <swaggerx-icon name="close" size=${14}></swaggerx-icon>
              </button>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-search': SwaggerXSearch;
  }
}
