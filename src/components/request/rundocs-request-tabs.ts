import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-tabs.js';
import './rundocs-params-editor.js';
import './rundocs-headers-editor.js';
import './rundocs-auth-editor.js';
import './rundocs-body-editor.js';
import type { Parameter, AuthConfig } from '../../core/types.js';
import type { KeyValuePair } from '../shared/rundocs-key-value-editor.js';
import type { TabDef } from '../shared/rundocs-tabs.js';

/**
 * <rundocs-request-tabs> — Tabbed interface: Params | Headers | Auth | Body.
 *
 * Wraps the individual editors in a tab layout and forwards events upward.
 */
@customElement('rundocs-request-tabs')
export class RunDocsRequestTabs extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .tab-content {
        padding: 16px 0 12px;
      }
    `,
  ];

  @property({ type: Array })
  parameters: Parameter[] = [];

  @property({ type: Object })
  pathValues: Record<string, string> = {};

  @property({ type: Object })
  queryValues: Record<string, string> = {};

  @property({ type: Array })
  headerPairs: KeyValuePair[] = [];

  @property({ type: Object })
  auth: AuthConfig = { type: 'none' };

  @property({ type: String })
  body = '';

  @property({ type: String })
  contentType = 'application/json';

  @property({ type: Boolean, attribute: 'has-body' })
  hasBody = false;

  @state()
  private _activeTab = 'params';

  private get _tabs(): TabDef[] {
    const tabs: TabDef[] = [
      {
        id: 'params',
        label: 'Params',
        badge: this.parameters.length > 0 ? String(this.parameters.length) : undefined,
      },
      {
        id: 'headers',
        label: 'Headers',
        badge: this.headerPairs.filter((p) => p.enabled && p.key).length > 0
          ? String(this.headerPairs.filter((p) => p.enabled && p.key).length)
          : undefined,
      },
      { id: 'auth', label: 'Auth' },
    ];

    if (this.hasBody) {
      tabs.push({ id: 'body', label: 'Body' });
    }

    return tabs;
  }

  override render() {
    return html`
      <rundocs-tabs
        .tabs=${this._tabs}
        active=${this._activeTab}
        @tab-change=${(e: CustomEvent) => { this._activeTab = e.detail.tab; }}
      ></rundocs-tabs>
      <div class="tab-content">
        ${this._activeTab === 'params'
          ? html`
              <rundocs-params-editor
                .parameters=${this.parameters}
                .pathValues=${this.pathValues}
                .queryValues=${this.queryValues}
                @param-change=${this._forwardEvent}
              ></rundocs-params-editor>
            `
          : nothing}
        ${this._activeTab === 'headers'
          ? html`
              <rundocs-headers-editor
                .pairs=${this.headerPairs}
                @headers-change=${this._forwardEvent}
              ></rundocs-headers-editor>
            `
          : nothing}
        ${this._activeTab === 'auth'
          ? html`
              <rundocs-auth-editor
                .auth=${this.auth}
                @auth-change=${this._forwardEvent}
              ></rundocs-auth-editor>
            `
          : nothing}
        ${this._activeTab === 'body'
          ? html`
              <rundocs-body-editor
                body=${this.body}
                content-type=${this.contentType}
                @body-change=${this._forwardEvent}
                @content-type-change=${this._forwardEvent}
              ></rundocs-body-editor>
            `
          : nothing}
      </div>
    `;
  }

  private _forwardEvent(_e: Event) {
    // Events already bubble+composed from children, so they will reach the app.
    // This method exists as a hook point if needed.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-request-tabs': RunDocsRequestTabs;
  }
}
