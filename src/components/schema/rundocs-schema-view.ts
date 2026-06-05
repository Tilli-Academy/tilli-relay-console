import { LitElement, html, css, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import { highlightJson } from '../../utils/prism-highlight.js';
import { generateExample, flattenSchema } from '../../core/schema-resolver.js';
import '../shared/rundocs-tabs.js';
import '../shared/rundocs-copy-button.js';
import './rundocs-schema-property.js';
import type { ResolvedSchema } from '../../core/types.js';

/**
 * <rundocs-schema-view> — Renders a schema as a property tree and/or JSON example.
 *
 * Two views toggled via tabs:
 *   - Schema: property tree with types, constraints, descriptions
 *   - Example: generated JSON example
 *
 * Usage:
 *   <rundocs-schema-view .schema=${schema} title="Response Body"></rundocs-schema-view>
 */
@customElement('rundocs-schema-view')
export class RunDocsSchemaView extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .schema-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .schema-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--sx-text-primary);
      }

      .schema-content {
        border: 1px solid var(--sx-border);
        border-radius: 8px;
        overflow: hidden;
      }

      .properties-view {
        padding: 8px 12px;
      }

      .example-view {
        position: relative;
      }

      .example-code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
        padding: 12px 16px;
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-primary);
        overflow-x: auto;
        white-space: pre;
        margin: 0;
      }

      .copy-wrapper {
        position: absolute;
        top: 8px;
        right: 8px;
      }

      .empty {
        padding: 16px;
        text-align: center;
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
      }

      /* Prism.js syntax highlighting — mapped to theme variables */
      .token.property,
      .token.tag,
      .token.keyword { color: var(--sx-syntax-key); }
      .token.string,
      .token.attr-value { color: var(--sx-syntax-string); }
      .token.number { color: var(--sx-syntax-number); }
      .token.boolean,
      .token.builtin,
      .token.function { color: var(--sx-syntax-boolean); }
      .token.operator { color: var(--sx-syntax-key); }
      .token.comment { color: var(--sx-syntax-null); font-style: italic; }
      .token.punctuation { color: var(--sx-syntax-bracket); }
      .token.class-name { color: var(--sx-syntax-number); }
      .token.null { color: var(--sx-syntax-null); }
    `,
  ];

  @property({ type: Object })
  schema: ResolvedSchema = {};

  @property({ type: String })
  title = '';

  @state()
  private _activeTab = 'schema';

  private get _flatSchema(): ResolvedSchema {
    return flattenSchema(this.schema);
  }

  private get _exampleJson(): string {
    try {
      const example = generateExample(this.schema);
      return JSON.stringify(example, null, 2);
    } catch {
      return '{}';
    }
  }

  override render() {
    const flat = this._flatSchema;
    const hasProperties = flat.properties && Object.keys(flat.properties).length > 0;

    return html`
      ${this.title ? html`<div class="schema-header"><span class="schema-title">${this.title}</span></div>` : nothing}
      <div class="schema-content">
        <rundocs-tabs
          .tabs=${[
            { id: 'schema', label: 'Schema' },
            { id: 'example', label: 'Example' },
          ]}
          active=${this._activeTab}
          @tab-change=${(e: CustomEvent) => { this._activeTab = e.detail.tab; }}
        ></rundocs-tabs>
        ${this._activeTab === 'schema'
          ? hasProperties
            ? html`
                <div class="properties-view">
                  ${Object.entries(flat.properties!).map(
                    ([name, propSchema]) => html`
                      <rundocs-schema-property
                        name=${name}
                        .schema=${propSchema}
                        ?required=${(flat.required || []).includes(name)}
                        depth=${0}
                      ></rundocs-schema-property>
                    `,
                  )}
                </div>
              `
            : html`<div class="empty">No properties defined</div>`
          : html`
              <div class="example-view">
                <pre class="example-code">${unsafeHTML(highlightJson(this._exampleJson))}</pre>
                <div class="copy-wrapper">
                  <rundocs-copy-button text=${this._exampleJson}></rundocs-copy-button>
                </div>
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-schema-view': RunDocsSchemaView;
  }
}
