import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-tabs.js';
import './swaggerx-code-block.js';
import { generateCodeSamples } from '../../core/code-gen.js';
import { buildUrl } from '../../utils/url-builder.js';
import { interpolate } from '../../utils/env-interpolator.js';
import type { Endpoint, AuthConfig } from '../../core/types.js';
import type { TabDef } from '../shared/swaggerx-tabs.js';

type CodeLanguage = 'curl' | 'javascript' | 'python' | 'nodejs';

const LANG_LABELS: Record<string, string> = {
  curl: 'cURL',
  javascript: 'JavaScript',
  python: 'Python',
  nodejs: 'Node.js',
};

/**
 * <swaggerx-code-samples> — Tabbed code samples (cURL, JavaScript, Python, Node.js).
 */
@customElement('swaggerx-code-samples')
export class SwaggerXCodeSamples extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .tab-content {
        padding: 12px 0;
      }
    `,
  ];

  @property({ type: Object })
  endpoint: Endpoint | null = null;

  @property({ type: String, attribute: 'base-url' })
  baseUrl = '';

  @property({ type: Object })
  auth: AuthConfig = { type: 'none' };

  @property({ type: Array })
  headers: Array<{ key: string; value: string; enabled: boolean }> = [];

  @property({ type: String })
  userBody = '';

  @property({ type: Object })
  pathValues: Record<string, string> = {};

  @property({ type: Object })
  queryValues: Record<string, string> = {};

  @property({ type: Object })
  envVars: Record<string, string> = {};

  @state()
  private _activeTab: CodeLanguage = 'curl';

  private get _samples(): Record<string, string> {
    if (!this.endpoint) return {};

    const env = this.envVars;

    // 1. Resolve URL: substitute path params, append query params, interpolate env vars
    let effectiveBase = this.baseUrl;
    if (!effectiveBase || effectiveBase === '/' || !effectiveBase.startsWith('http')) {
      if (typeof window !== 'undefined' && window.location?.origin) {
        effectiveBase = window.location.origin;
      }
    }
    const resolvedUrl = interpolate(
      buildUrl(effectiveBase, this.endpoint.path, this.pathValues, this.queryValues),
      env,
    );

    // 2. Resolve auth: interpolate env vars in all auth fields
    const resolvedAuth: AuthConfig = {
      ...this.auth,
      token: this.auth.token ? interpolate(this.auth.token, env) : this.auth.token,
      username: this.auth.username ? interpolate(this.auth.username, env) : this.auth.username,
      password: this.auth.password ? interpolate(this.auth.password, env) : this.auth.password,
      apiKeyName: this.auth.apiKeyName ? interpolate(this.auth.apiKeyName, env) : this.auth.apiKeyName,
      apiKeyValue: this.auth.apiKeyValue ? interpolate(this.auth.apiKeyValue, env) : this.auth.apiKeyValue,
    };

    // 3. Resolve headers: interpolate env vars in keys and values
    const headerRecord: Record<string, string> = {};
    for (const pair of this.headers) {
      if (pair.enabled && pair.key.trim()) {
        headerRecord[interpolate(pair.key, env)] = interpolate(pair.value, env);
      }
    }

    // 4. Resolve body: interpolate env vars
    const resolvedBody = this.userBody ? interpolate(this.userBody, env) : this.userBody;

    return generateCodeSamples(this.endpoint, this.baseUrl, {
      auth: resolvedAuth,
      headers: headerRecord,
      userBody: resolvedBody,
      resolvedUrl,
    });
  }

  private get _tabs(): TabDef[] {
    return Object.keys(this._samples).map((lang) => ({
      id: lang,
      label: LANG_LABELS[lang] ?? lang,
    }));
  }

  override render() {
    if (!this.endpoint) return nothing;

    const samples = this._samples;
    const activeCode = samples[this._activeTab] ?? '';

    return html`
      <swaggerx-tabs
        .tabs=${this._tabs}
        active=${this._activeTab}
        @tab-change=${(e: CustomEvent) => { this._activeTab = e.detail.tab as CodeLanguage; }}
      ></swaggerx-tabs>
      <div class="tab-content">
        ${activeCode
          ? html`
              <swaggerx-code-block
                code=${activeCode}
                language=${this._activeTab}
                label=${LANG_LABELS[this._activeTab] ?? this._activeTab}
              ></swaggerx-code-block>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swaggerx-code-samples': SwaggerXCodeSamples;
  }
}
