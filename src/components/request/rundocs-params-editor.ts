import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import type { Parameter } from '../../core/types.js';

/**
 * <rundocs-params-editor> — Edits path and query parameters for an endpoint.
 *
 * Pre-populates fields from the endpoint's parameter definitions.
 * Fires `param-change` with { name, value, paramIn } on input.
 */
@customElement('rundocs-params-editor')
export class RunDocsParamsEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .section-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
        margin: 12px 0 6px;
      }

      .param-row {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 8px;
        align-items: center;
        padding: 4px 0;
      }

      .param-label {
        font-size: 0.8125rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-weight: 500;
        color: var(--sx-text-primary);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .required {
        color: var(--sx-error);
        font-size: 0.6875rem;
      }

      input {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-md);
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.8125rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
      }

      input:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      input::placeholder {
        color: var(--sx-text-muted);
      }

      .description {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
        grid-column: 2;
        margin-top: -2px;
      }

      .empty {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        padding: 16px 0;
        text-align: center;
      }
    `,
  ];

  @property({ type: Array })
  parameters: Parameter[] = [];

  @property({ type: Object })
  pathValues: Record<string, string> = {};

  @property({ type: Object })
  queryValues: Record<string, string> = {};

  private _onInput(name: string, paramIn: string, e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent('param-change', {
        detail: { name, value, paramIn },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const pathParams = this.parameters.filter((p) => p.in === 'path');
    const queryParams = this.parameters.filter((p) => p.in === 'query');

    if (pathParams.length === 0 && queryParams.length === 0) {
      return html`<div class="empty">No parameters for this endpoint</div>`;
    }

    return html`
      ${pathParams.length > 0
        ? html`
            <div class="section-label">Path Parameters</div>
            ${pathParams.map(
              (p) => html`
                <div class="param-row">
                  <div class="param-label">
                    ${p.name} ${p.required ? html`<span class="required">*</span>` : nothing}
                  </div>
                  <input
                    type="text"
                    .value=${this.pathValues[p.name] ?? ''}
                    placeholder=${p.schema?.type ?? 'value'}
                    @input=${(e: InputEvent) => this._onInput(p.name, 'path', e)}
                  />
                  ${p.description ? html`<div class="description">${p.description}</div>` : nothing}
                </div>
              `,
            )}
          `
        : nothing}
      ${queryParams.length > 0
        ? html`
            <div class="section-label">Query Parameters</div>
            ${queryParams.map(
              (p) => html`
                <div class="param-row">
                  <div class="param-label">
                    ${p.name} ${p.required ? html`<span class="required">*</span>` : nothing}
                  </div>
                  <input
                    type="text"
                    .value=${this.queryValues[p.name] ?? ''}
                    placeholder=${p.schema?.type ?? 'value'}
                    @input=${(e: InputEvent) => this._onInput(p.name, 'query', e)}
                  />
                  ${p.description ? html`<div class="description">${p.description}</div>` : nothing}
                </div>
              `,
            )}
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-params-editor': RunDocsParamsEditor;
  }
}
