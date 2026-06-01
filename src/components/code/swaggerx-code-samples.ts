import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/swaggerx-tabs.js';
import './swaggerx-code-block.js';
import { generateCodeSamples } from '../../core/code-gen.js';
import type { Endpoint } from '../../core/types.js';
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

  @state()
  private _activeTab: CodeLanguage = 'curl';

  private get _samples(): Record<string, string> {
    if (!this.endpoint) return {};
    return generateCodeSamples(this.endpoint, this.baseUrl);
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
