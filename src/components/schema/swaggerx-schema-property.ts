import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import { getSchemaTypeLabel } from '../../core/schema-resolver.js';
import '../shared/swaggerx-badge.js';
import '../shared/swaggerx-icon.js';
import type { ResolvedSchema } from '../../core/types.js';

/**
 * <swaggerx-schema-property> — Renders a single schema property with
 * name, type, description, constraints, and nested children.
 *
 * Recursively renders child properties for objects/arrays.
 */
@customElement('swaggerx-schema-property')
export class SwaggerXSchemaProperty extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .property {
        padding: 6px 0;
        border-bottom: 1px solid var(--sx-border);
      }

      .property:last-child {
        border-bottom: none;
      }

      .property-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }

      .prop-name {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--sx-text-primary);
      }

      .prop-type {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.75rem;
        color: var(--sx-accent);
      }

      .prop-required {
        font-size: 0.6875rem;
        color: var(--sx-error);
        font-weight: 600;
      }

      .prop-deprecated {
        font-size: 0.6875rem;
        color: var(--sx-warning);
        text-decoration: line-through;
      }

      .prop-description {
        font-size: 0.8125rem;
        color: var(--sx-text-secondary);
        margin-top: 2px;
        line-height: 1.5;
      }

      .constraints {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }

      .constraint {
        font-size: 0.6875rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-text-muted);
        background: var(--sx-surface-tertiary);
        padding: 1px 6px;
        border-radius: 4px;
      }

      .children {
        margin-left: 16px;
        padding-left: 12px;
        border-left: 2px solid var(--sx-border);
        margin-top: 4px;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--sx-text-muted);
        font-size: 0.6875rem;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: inherit;
      }

      .toggle-btn:hover {
        background: var(--sx-surface-tertiary);
        color: var(--sx-text-primary);
      }

      .enum-values {
        font-size: 0.75rem;
        color: var(--sx-text-secondary);
        margin-top: 2px;
      }

      .enum-val {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        background: var(--sx-surface-tertiary);
        padding: 0 4px;
        border-radius: 3px;
        font-size: 0.6875rem;
      }
    `,
  ];

  @property({ type: String })
  name = '';

  @property({ type: Object })
  schema: ResolvedSchema = {};

  @property({ type: Boolean })
  required = false;

  @property({ type: Number })
  depth = 0;

  @state()
  private _expanded = true;

  private get _hasChildren(): boolean {
    const s = this.schema;
    if (s.properties && Object.keys(s.properties).length > 0) return true;
    if (s.items?.properties && Object.keys(s.items.properties).length > 0) return true;
    return false;
  }

  private get _childSchema(): ResolvedSchema | null {
    if (this.schema.properties) return this.schema;
    if (this.schema.items?.properties) return this.schema.items;
    return null;
  }

  private _getConstraints(): string[] {
    const c: string[] = [];
    const s = this.schema;
    if (s.minimum !== undefined) c.push(`>= ${s.minimum}`);
    if (s.maximum !== undefined) c.push(`<= ${s.maximum}`);
    if (s.minLength !== undefined) c.push(`minLen: ${s.minLength}`);
    if (s.maxLength !== undefined) c.push(`maxLen: ${s.maxLength}`);
    if (s.pattern) c.push(`pattern: ${s.pattern}`);
    if (s.nullable) c.push('nullable');
    if (s.readOnly) c.push('read-only');
    if (s.writeOnly) c.push('write-only');
    return c;
  }

  override render() {
    if (this.depth > 8) return html`<span class="prop-type">...</span>`;

    const typeLabel = getSchemaTypeLabel(this.schema);
    const constraints = this._getConstraints();

    return html`
      <div class="property">
        <div class="property-header">
          ${this._hasChildren
            ? html`
                <button class="toggle-btn" aria-expanded=${this._expanded} aria-label="Toggle ${this.name || 'property'} details" @click=${() => { this._expanded = !this._expanded; }}>
                  <swaggerx-icon name=${this._expanded ? 'chevron-down' : 'chevron-right'} size=${12}></swaggerx-icon>
                </button>
              `
            : nothing}
          ${this.name ? html`<span class="prop-name">${this.name}</span>` : nothing}
          <span class="prop-type">${typeLabel}</span>
          ${this.required ? html`<span class="prop-required">required</span>` : nothing}
        </div>
        ${this.schema.description
          ? html`<div class="prop-description">${this.schema.description}</div>`
          : nothing}
        ${this.schema.enum
          ? html`
              <div class="enum-values">
                Enum: ${this.schema.enum.map((v) => html`<span class="enum-val">${String(v)}</span> `)}
              </div>
            `
          : nothing}
        ${constraints.length > 0
          ? html`
              <div class="constraints">
                ${constraints.map((c) => html`<span class="constraint">${c}</span>`)}
              </div>
            `
          : nothing}
        ${this._hasChildren && this._expanded ? this._renderChildren() : nothing}
      </div>
    `;
  }

  private _renderChildren() {
    const child = this._childSchema;
    if (!child?.properties) return nothing;

    const requiredSet = new Set(child.required || []);

    return html`
      <div class="children">
        ${Object.entries(child.properties).map(
          ([propName, propSchema]) => html`
            <swaggerx-schema-property
              name=${propName}
              .schema=${propSchema}
              ?required=${requiredSet.has(propName)}
              depth=${this.depth + 1}
            ></swaggerx-schema-property>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-schema-property': SwaggerXSchemaProperty;
  }
}
