/**
 * Shared CodeMirror 6 theme and syntax highlighting.
 *
 * Uses --sx-* CSS custom properties so light/dark mode works automatically
 * without any theme switching logic.
 */
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/** Editor chrome theme — background, gutters, cursor, selection. */
export const sxEditorTheme = EditorView.theme({
  '&': {
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    backgroundColor: 'var(--sx-surface-tertiary)',
    color: 'var(--sx-text-primary)',
  },
  '.cm-content': {
    caretColor: 'var(--sx-text-primary)',
    lineHeight: '1.6',
    padding: '8px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--sx-text-primary)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'var(--sx-accent-bg-subtle)',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--sx-surface-secondary)',
    color: 'var(--sx-text-muted)',
    border: 'none',
    borderRight: '1px solid var(--sx-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 12px',
    minWidth: '32px',
    fontSize: '0.75rem',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

/** Syntax highlighting style using --sx-syntax-* variables. */
const sxHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--sx-syntax-key)' },
  { tag: tags.string, color: 'var(--sx-syntax-string)' },
  { tag: tags.number, color: 'var(--sx-syntax-number)' },
  { tag: tags.bool, color: 'var(--sx-syntax-boolean)' },
  { tag: tags.null, color: 'var(--sx-syntax-null)' },
  { tag: tags.keyword, color: 'var(--sx-syntax-key)' },
  { tag: tags.paren, color: 'var(--sx-syntax-bracket)' },
  { tag: tags.brace, color: 'var(--sx-syntax-bracket)' },
  { tag: tags.squareBracket, color: 'var(--sx-syntax-bracket)' },
  { tag: tags.punctuation, color: 'var(--sx-syntax-bracket)' },
  { tag: tags.angleBracket, color: 'var(--sx-syntax-bracket)' },
  { tag: tags.tagName, color: 'var(--sx-syntax-key)' },
  { tag: tags.attributeName, color: 'var(--sx-syntax-number)' },
  { tag: tags.attributeValue, color: 'var(--sx-syntax-string)' },
  { tag: tags.comment, color: 'var(--sx-syntax-null)' },
]);

/** Syntax highlighting extension — use in EditorState.create extensions array. */
export const sxSyntaxHighlighting = syntaxHighlighting(sxHighlightStyle);
