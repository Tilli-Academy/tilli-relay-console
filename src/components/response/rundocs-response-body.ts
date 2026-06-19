import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import { EditorView, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { sxEditorTheme, sxSyntaxHighlighting } from '../../utils/codemirror-theme.js';
import '../shared/rundocs-copy-button.js';

/**
 * <rundocs-response-body> — Displays response body with formatting.
 *
 * Features:
 *   - Pretty/Raw toggle for JSON
 *   - CodeMirror-based syntax highlighting with line numbers
 *   - Word wrap toggle
 *   - Copy button
 */
@customElement('rundocs-response-body')
export class RunDocsResponseBody extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .body-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .content-type {
        font-size: 0.6875rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        color: var(--sx-text-muted);
        background: var(--sx-surface-tertiary);
        padding: 2px 8px;
        border-radius: var(--sx-radius-sm);
      }

      .view-toggle {
        display: inline-flex;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-md);
        overflow: hidden;
      }

      .view-btn {
        padding: 3px 10px;
        border: none;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-secondary);
        cursor: pointer;
        font-size: 0.6875rem;
        font-weight: 500;
        font-family: inherit;
        transition: background 0.12s, color 0.12s;
      }

      .view-btn:not(:last-child) {
        border-right: 1px solid var(--sx-border);
      }

      .view-btn:hover {
        background: var(--sx-surface-tertiary);
      }

      .view-btn.active {
        background: var(--sx-accent);
        color: #fff;
      }

      .body-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .wrap-toggle {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-md);
        background: var(--sx-surface-secondary);
        color: var(--sx-text-secondary);
        cursor: pointer;
        font-size: 0.6875rem;
        font-family: inherit;
      }

      .wrap-toggle:hover {
        background: var(--sx-surface-tertiary);
      }

      .wrap-toggle.active {
        color: var(--sx-accent);
        border-color: var(--sx-accent);
      }

      .body-content {
        width: 100%;
        min-height: 120px;
        max-height: 500px;
        overflow: hidden;
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
      }

      .body-content .cm-editor {
        min-height: 120px;
        max-height: 498px;
      }

      .body-content .cm-editor.cm-focused {
        outline: none;
      }

      .body-content .cm-scroller {
        max-height: 498px;
      }

      .empty {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        padding: 16px 0;
        text-align: center;
      }
    `,
  ];

  @property({ type: String })
  body = '';

  @property({ type: String, attribute: 'content-type' })
  contentType = 'text/plain';

  @state()
  private _wordWrap = true;

  @state()
  private _viewMode: 'pretty' | 'raw' = 'pretty';

  private _view: EditorView | null = null;
  private _wrapCompartment = new Compartment();
  private _languageCompartment = new Compartment();
  private _mounted = false;

  private _isJson(): boolean {
    return this.contentType.includes('json');
  }

  private _getPrettyJson(): string {
    try {
      return JSON.stringify(JSON.parse(this.body), null, 2);
    } catch {
      return this.body;
    }
  }

  private _getFormattedBody(): string {
    if (!this.body) return '';
    if (this._isJson() && this._viewMode === 'pretty') {
      return this._getPrettyJson();
    }
    return this.body;
  }

  private _createView() {
    const wrapper = this.shadowRoot!.querySelector('.body-content');
    if (!wrapper) return;

    // Clear previous instance
    this._view?.destroy();
    this._view = null;

    const formatted = this._getFormattedBody();
    const isJson = this._isJson();

    this._view = new EditorView({
      state: EditorState.create({
        doc: formatted,
        extensions: [
          lineNumbers(),
          this._languageCompartment.of(isJson ? json() : []),
          sxEditorTheme,
          sxSyntaxHighlighting,
          this._wrapCompartment.of(this._wordWrap ? EditorView.lineWrapping : []),
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ],
      }),
      parent: wrapper,
    });
  }

  override firstUpdated() {
    this._mounted = true;
    if (this.body) {
      this._createView();
    }
  }

  override updated(changed: Map<string, unknown>) {
    if (!this._mounted) return;

    // Recreate view when body or viewMode changes (content changes)
    if (changed.has('body') || changed.has('_viewMode') || changed.has('contentType')) {
      if (this.body) {
        // Need to wait for render to complete if body just became non-empty
        if (changed.has('body') && !changed.get('body')) {
          this.updateComplete.then(() => this._createView());
        } else {
          this._updateContent();
        }
      } else {
        this._view?.destroy();
        this._view = null;
      }
    }

    if (changed.has('_wordWrap') && this._view) {
      this._view.dispatch({
        effects: this._wrapCompartment.reconfigure(
          this._wordWrap ? EditorView.lineWrapping : [],
        ),
      });
    }
  }

  private _updateContent() {
    if (!this._view) {
      this._createView();
      return;
    }

    const formatted = this._getFormattedBody();
    const currentDoc = this._view.state.doc.toString();
    if (currentDoc !== formatted) {
      this._view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: formatted },
      });
    }

    const isJson = this._isJson();
    this._view.dispatch({
      effects: this._languageCompartment.reconfigure(isJson ? json() : []),
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._view?.destroy();
    this._view = null;
    this._mounted = false;
  }

  override render() {
    if (!this.body) {
      return html`<div class="empty">No response body</div>`;
    }

    const formatted = this._getFormattedBody();
    const isJson = this._isJson();

    return html`
      <div class="body-toolbar">
        <div class="toolbar-left">
          <span class="content-type">${this.contentType}</span>
          ${isJson
            ? html`
                <div class="view-toggle" role="group" aria-label="View mode">
                  <button
                    class="view-btn ${this._viewMode === 'pretty' ? 'active' : ''}"
                    aria-pressed=${this._viewMode === 'pretty'}
                    @click=${() => { this._viewMode = 'pretty'; }}
                  >Pretty</button>
                  <button
                    class="view-btn ${this._viewMode === 'raw' ? 'active' : ''}"
                    aria-pressed=${this._viewMode === 'raw'}
                    @click=${() => { this._viewMode = 'raw'; }}
                  >Raw</button>
                </div>
              `
            : nothing}
        </div>
        <div class="body-actions">
          <button
            class="wrap-toggle ${this._wordWrap ? 'active' : ''}"
            aria-pressed=${this._wordWrap}
            @click=${() => { this._wordWrap = !this._wordWrap; }}
          >
            Word Wrap
          </button>
          <rundocs-copy-button text=${formatted}></rundocs-copy-button>
        </div>
      </div>
      <div class="body-content"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-response-body': RunDocsResponseBody;
  }
}
