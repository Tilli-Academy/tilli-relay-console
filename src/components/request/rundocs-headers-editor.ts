import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-key-value-editor.js';
import type { KeyValuePair } from '../shared/rundocs-key-value-editor.js';

/**
 * <rundocs-headers-editor> — Headers editor built on key-value editor.
 *
 * Fires `headers-change` with { headers: Record<string, string> }.
 */
@customElement('rundocs-headers-editor')
export class RunDocsHeadersEditor extends LitElement {
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
      <rundocs-key-value-editor
        .pairs=${this.pairs}
        key-placeholder="Header name"
        value-placeholder="Header value"
        @kv-change=${this._onChange}
      ></rundocs-key-value-editor>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-headers-editor': RunDocsHeadersEditor;
  }
}
