import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import './swaggerx-method-badge.js';
import './swaggerx-path-display.js';
import './swaggerx-description.js';
import '../schema/swaggerx-schema-view.js';
import '../shared/swaggerx-badge.js';
import '../shared/swaggerx-icon.js';
import '../shared/swaggerx-tabs.js';
import '../request/swaggerx-request-bar.js';
import '../request/swaggerx-request-tabs.js';
import '../response/swaggerx-response.js';
import '../code/swaggerx-code-samples.js';
import type { Endpoint, Parameter, HttpMethod, AuthConfig, ResponseState } from '../../core/types.js';
import type { KeyValuePair } from '../shared/swaggerx-key-value-editor.js';
import type { TabDef } from '../shared/swaggerx-tabs.js';

/**
 * <swaggerx-endpoint> — Full endpoint detail view.
 *
 * Renders:
 *   - Method badge + path
 *   - Summary + description
 *   - Deprecated/security badges
 *   - Parameters table (path, query, header, cookie)
 *   - Request body schema
 *   - Response schemas
 *
 * Usage:
 *   <swaggerx-endpoint .endpoint=${endpoint}></swaggerx-endpoint>
 */
@customElement('swaggerx-endpoint')
export class SwaggerXEndpoint extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        padding-bottom: 48px;
      }

      /* --- Compact Header --- */
      .endpoint-header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }

      .header-tags {
        display: flex;
        gap: 4px;
        margin-left: auto;
      }

      .summary {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--sx-text-secondary);
        margin: 0 0 4px;
      }

      .badges {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }

      .operation-id {
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-text-muted);
        margin-bottom: 12px;
      }

      /* --- Card wrappers --- */
      .request-card {
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-card);
        box-shadow: var(--sx-shadow-card);
        overflow: hidden;
        margin-bottom: 16px;
      }

      .request-card-body {
        padding: 16px;
      }

      .response-card {
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-card);
        box-shadow: var(--sx-shadow-card);
        overflow: hidden;
        margin-bottom: 16px;
      }

      /* --- Documentation tabs panel --- */
      .docs-panel {
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        background: var(--sx-surface-card);
        box-shadow: var(--sx-shadow-card);
        overflow: hidden;
      }

      .docs-tab-bar {
        padding: 0 16px;
        border-bottom: 1px solid var(--sx-border);
        background: var(--sx-surface-secondary);
      }

      .docs-tab-content {
        padding: 16px;
      }

      /* --- Params table (inside docs tab) --- */
      .section-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--sx-text-primary);
        margin: 0 0 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .params-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }

      .params-table th {
        text-align: left;
        font-weight: 600;
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--sx-text-muted);
        padding: 6px 12px;
        border-bottom: 2px solid var(--sx-border);
      }

      .params-table td {
        padding: 8px 12px;
        border-bottom: 1px solid var(--sx-border);
        vertical-align: top;
      }

      .param-name {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-weight: 600;
        color: var(--sx-text-primary);
      }

      .param-in {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
        background: var(--sx-surface-tertiary);
        padding: 1px 6px;
        border-radius: 4px;
      }

      .param-type {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-accent);
        font-size: 0.75rem;
      }

      .param-required {
        color: var(--sx-error);
        font-size: 0.6875rem;
        font-weight: 600;
      }

      .param-description {
        color: var(--sx-text-secondary);
        font-size: 0.8125rem;
      }

      /* --- Response schemas (inside docs tab) --- */
      .response-item {
        margin-bottom: 16px;
      }

      .response-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .response-code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-weight: 700;
        font-size: 0.875rem;
      }

      .response-desc {
        font-size: 0.8125rem;
        color: var(--sx-text-secondary);
      }
    `,
  ];

  @property({ type: Object })
  endpoint: Endpoint | null = null;

  /* Request builder state — fed from parent (swaggerx-app) */
  @property({ type: String })
  requestMethod: HttpMethod = 'get';

  @property({ type: String })
  requestUrl = '';

  @property({ type: Object })
  pathValues: Record<string, string> = {};

  @property({ type: Object })
  queryValues: Record<string, string> = {};

  @property({ type: Array })
  headerPairs: KeyValuePair[] = [];

  @property({ type: Object })
  auth: AuthConfig = { type: 'none' };

  @property({ type: String })
  requestBody = '';

  @property({ type: String })
  contentType = 'application/json';

  @property({ type: Boolean })
  requestLoading = false;

  @property({ type: Object })
  response: ResponseState | null = null;

  @property({ type: String, attribute: 'base-url' })
  baseUrl = '';

  @property({ type: Object })
  envVars: Record<string, string> = {};

  @state()
  private _docTab = '';

  private _getStatusVariant(code: string): 'success' | 'warning' | 'error' | 'info' {
    if (code.startsWith('2')) return 'success';
    if (code.startsWith('3')) return 'info';
    if (code.startsWith('4')) return 'warning';
    if (code.startsWith('5')) return 'error';
    return 'info';
  }

  private _hasRequestBody(ep: Endpoint): boolean {
    return ['post', 'put', 'patch'].includes(ep.method) || !!ep.requestBody;
  }

  private _groupParams(params: Parameter[]): Record<string, Parameter[]> {
    const groups: Record<string, Parameter[]> = {};
    for (const p of params) {
      if (!groups[p.in]) groups[p.in] = [];
      groups[p.in].push(p);
    }
    return groups;
  }

  private _getDocTabs(ep: Endpoint): TabDef[] {
    const tabs: TabDef[] = [];
    if (ep.parameters.length > 0) {
      tabs.push({ id: 'params', label: 'Params', badge: String(ep.parameters.length) });
    }
    const bodyContent = ep.requestBody?.content;
    const hasSchema = bodyContent
      ? !!(bodyContent['application/json'] || Object.values(bodyContent)[0])
      : false;
    if (hasSchema) {
      tabs.push({ id: 'schema', label: 'Request Body' });
    }
    if (Object.keys(ep.responses).length > 0) {
      tabs.push({ id: 'responses', label: 'Responses', badge: String(Object.keys(ep.responses).length) });
    }
    tabs.push({ id: 'code', label: 'Code' });
    return tabs;
  }

  private _getActiveDocTab(ep: Endpoint): string {
    const tabs = this._getDocTabs(ep);
    if (tabs.length === 0) return '';
    // If current _docTab is valid, keep it
    if (this._docTab && tabs.some((t) => t.id === this._docTab)) return this._docTab;
    // Default to first tab
    return tabs[0].id;
  }

  override render() {
    if (!this.endpoint) return nothing;
    const ep = this.endpoint;

    const paramGroups = this._groupParams(ep.parameters);
    const paramLocations = Object.keys(paramGroups);

    // Get request body schema (prefer application/json)
    const bodyContent = ep.requestBody?.content;
    const bodyMediaType = bodyContent
      ? bodyContent['application/json'] || Object.values(bodyContent)[0]
      : null;

    const docTabs = this._getDocTabs(ep);
    const activeDocTab = this._getActiveDocTab(ep);

    return html`
      <!-- Compact Header: Method + Path + Tags -->
      <div class="endpoint-header">
        <swaggerx-method-badge method=${ep.method}></swaggerx-method-badge>
        <swaggerx-path-display path=${ep.path}></swaggerx-path-display>
        <div class="header-tags">
          ${ep.deprecated ? html`<swaggerx-badge variant="warning">Deprecated</swaggerx-badge>` : nothing}
          ${ep.security.length > 0 ? html`<swaggerx-badge variant="info">Authenticated</swaggerx-badge>` : nothing}
          ${ep.tags.map((tag) => html`<swaggerx-badge>${tag}</swaggerx-badge>`)}
        </div>
      </div>

      <!-- Summary + description (compact) -->
      ${ep.summary ? html`<h2 class="summary">${ep.summary}</h2>` : nothing}
      ${ep.operationId ? html`<div class="operation-id">operationId: ${ep.operationId}</div>` : nothing}
      ${ep.description ? html`<swaggerx-description text=${ep.description}></swaggerx-description>` : nothing}

      <!-- Request Builder Card -->
      <div class="request-card">
        <div class="request-card-body">
          <swaggerx-request-bar
            method=${this.requestMethod}
            url=${this.requestUrl}
            ?loading=${this.requestLoading}
          ></swaggerx-request-bar>
          <swaggerx-request-tabs
            .parameters=${ep.parameters}
            .pathValues=${this.pathValues}
            .queryValues=${this.queryValues}
            .headerPairs=${this.headerPairs}
            .auth=${this.auth}
            body=${this.requestBody}
            content-type=${this.contentType}
            ?has-body=${this._hasRequestBody(ep)}
          ></swaggerx-request-tabs>
        </div>
      </div>

      <!-- Response Card -->
      ${this.response
        ? html`
            <div class="response-card">
              <swaggerx-response .response=${this.response}></swaggerx-response>
            </div>
          `
        : nothing}

      <!-- Documentation Tabs Panel -->
      ${docTabs.length > 0
        ? html`
            <div class="docs-panel">
              <div class="docs-tab-bar">
                <swaggerx-tabs
                  .tabs=${docTabs}
                  active=${activeDocTab}
                  @tab-change=${(e: CustomEvent) => { this._docTab = e.detail.tab; }}
                ></swaggerx-tabs>
              </div>
              <div class="docs-tab-content">
                ${activeDocTab === 'params' ? this._renderParams(paramLocations, paramGroups) : nothing}
                ${activeDocTab === 'schema' ? this._renderSchema(ep, bodyMediaType) : nothing}
                ${activeDocTab === 'responses' ? this._renderResponses(ep) : nothing}
                ${activeDocTab === 'code' ? this._renderCode(ep) : nothing}
              </div>
            </div>
          `
        : nothing}
    `;
  }

  private _renderParams(paramLocations: string[], paramGroups: Record<string, Parameter[]>) {
    return html`
      <table class="params-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>In</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${paramLocations.flatMap((loc) =>
            paramGroups[loc].map(
              (p) => html`
                <tr>
                  <td>
                    <span class="param-name">${p.name}</span>
                    ${p.required ? html`<span class="param-required"> *</span>` : nothing}
                  </td>
                  <td><span class="param-in">${p.in}</span></td>
                  <td><span class="param-type">${p.schema?.type ?? 'any'}</span></td>
                  <td><span class="param-description">${p.description ?? ''}</span></td>
                </tr>
              `,
            ),
          )}
        </tbody>
      </table>
    `;
  }

  private _renderSchema(ep: Endpoint, bodyMediaType: { schema: unknown } | null) {
    return html`
      ${ep.requestBody?.required ? html`<swaggerx-badge variant="error">required</swaggerx-badge>` : nothing}
      ${ep.requestBody?.description
        ? html`<swaggerx-description text=${ep.requestBody.description}></swaggerx-description>`
        : nothing}
      ${bodyMediaType
        ? html`<swaggerx-schema-view .schema=${bodyMediaType.schema}></swaggerx-schema-view>`
        : nothing}
    `;
  }

  private _renderResponses(ep: Endpoint) {
    return html`
      ${Object.entries(ep.responses).map(
        ([code, resp]) => html`
          <div class="response-item">
            <div class="response-status">
              <swaggerx-badge variant=${this._getStatusVariant(code)}>
                <span class="response-code">${code}</span>
              </swaggerx-badge>
              <span class="response-desc">${resp.description}</span>
            </div>
            ${resp.content
              ? (() => {
                  const media = resp.content['application/json'] || Object.values(resp.content)[0];
                  return media
                    ? html`<swaggerx-schema-view .schema=${media.schema}></swaggerx-schema-view>`
                    : nothing;
                })()
              : nothing}
          </div>
        `,
      )}
    `;
  }

  private _renderCode(ep: Endpoint) {
    return html`
      <swaggerx-code-samples
        .endpoint=${ep}
        base-url=${this.baseUrl}
        .auth=${this.auth}
        .headers=${this.headerPairs}
        .userBody=${this.requestBody}
        .pathValues=${this.pathValues}
        .queryValues=${this.queryValues}
        .envVars=${this.envVars}
      ></swaggerx-code-samples>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-endpoint': SwaggerXEndpoint;
  }
}
