import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { defaultKeymap } from '@codemirror/commands';
import { sxEditorTheme, sxSyntaxHighlighting } from '../../utils/codemirror-theme.js';

/**
 * <rundocs-body-editor> — Request body editor with CodeMirror.
 *
 * Fires:
 *   - `body-change` with { body: string }
 *   - `content-type-change` with { contentType: string }
 */
@customElement('rundocs-body-editor')
export class RunDocsBodyEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .content-type-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .content-type-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--sx-text-secondary);
      }

      .content-type-select {
        padding: 4px 8px;
        border: 1px solid var(--sx-border);
        border-radius: 6px;
        background: var(--sx-surface-secondary);
        color: var(--sx-text-primary);
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;
      }

      .content-type-select:focus {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      .editor-wrapper {
        border: 1px solid var(--sx-border);
        border-radius: var(--sx-radius-lg);
        overflow: hidden;
        min-height: 200px;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      .editor-wrapper:focus-within {
        border-color: var(--sx-accent);
        box-shadow: var(--sx-focus-ring);
      }

      .editor-wrapper .cm-editor {
        min-height: 200px;
      }

      .editor-wrapper .cm-editor.cm-focused {
        outline: none;
      }
    `,
  ];

  @property({ type: String })
  body = '';

  @property({ type: String, attribute: 'content-type' })
  contentType = 'application/json';

  private _view: EditorView | null = null;
  private _languageCompartment = new Compartment();
  private _updatingFromProp = false;

  private _getLanguageExtension() {
    if (this.contentType.includes('json')) return json();
    if (this.contentType.includes('xml')) return xml();
    return [];
  }

  override firstUpdated() {
    const wrapper = this.shadowRoot!.querySelector('.editor-wrapper');
    if (!wrapper) return;

    this._view = new EditorView({
      state: EditorState.create({
        doc: this.body,
        extensions: [
          lineNumbers(),
          keymap.of(defaultKeymap),
          this._languageCompartment.of(this._getLanguageExtension()),
          sxEditorTheme,
          sxSyntaxHighlighting,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !this._updatingFromProp) {
              const body = update.state.doc.toString();
              this.dispatchEvent(
                new CustomEvent('body-change', {
                  detail: { body },
                  bubbles: true,
                  composed: true,
                }),
              );
            }
          }),
        ],
      }),
      parent: wrapper,
    });
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('body') && this._view) {
      const currentDoc = this._view.state.doc.toString();
      if (currentDoc !== this.body) {
        this._updatingFromProp = true;
        this._view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: this.body },
        });
        this._updatingFromProp = false;
      }
    }

    if (changed.has('contentType') && this._view) {
      this._view.dispatch({
        effects: this._languageCompartment.reconfigure(this._getLanguageExtension()),
      });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._view?.destroy();
    this._view = null;
  }

  private _onContentTypeChange(e: Event) {
    const contentType = (e.target as HTMLSelectElement).value;
    this.dispatchEvent(
      new CustomEvent('content-type-change', {
        detail: { contentType },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <div class="content-type-row">
        <span class="content-type-label">Content-Type:</span>
        <select class="content-type-select" .value=${this.contentType} @change=${this._onContentTypeChange} aria-label="Content type">
          <option value="application/json">application/json</option>
          <option value="application/xml">application/xml</option>
          <option value="text/plain">text/plain</option>
          <option value="application/x-www-form-urlencoded">x-www-form-urlencoded</option>
          <option value="multipart/form-data">multipart/form-data</option>
        </select>
      </div>
      <div class="editor-wrapper" aria-label="Request body"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-body-editor': RunDocsBodyEditor;
  }
}
