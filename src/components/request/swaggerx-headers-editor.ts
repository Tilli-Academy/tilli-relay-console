import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-key-value-editor.js';
import type { KeyValuePair } from '../shared/swaggerx-key-value-editor.js';

/**
 * <swaggerx-headers-editor> — Headers editor built on key-value editor.
 *
 * Fires `headers-change` with { headers: Record<string, string> }.
 */
@customElement('swaggerx-headers-editor')
export class SwaggerXHeadersEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: Array })
  pairs: KeyValuePair[] = [];

  private _onChange(e: CustomEvent<{ pairs: KeyValuePair[] }>) {
    const headers: Record<string, string> = {};
    for (const pair of e.detail.pairs) {
      if (pair.enabled && pair.key) {
        headers[pair.key] = pair.value;
      }
    }
    this.dispatchEvent(
      new CustomEvent('headers-change', {
        detail: { headers, pairs: e.detail.pairs },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <swaggerx-key-value-editor
        .pairs=${this.pairs}
        key-placeholder="Header name"
        value-placeholder="Header value"
        @kv-change=${this._onChange}
      ></swaggerx-key-value-editor>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-headers-editor': SwaggerXHeadersEditor;
  }
}
