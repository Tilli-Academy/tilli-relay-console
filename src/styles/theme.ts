import { css } from 'lit';

export const lightTheme = css`
  :host {
    --sx-surface-primary: #f7f8fa;
    --sx-surface-secondary: #f0f2f5;
    --sx-surface-tertiary: #edf0f5;
    --sx-surface-card: #ffffff;
    --sx-surface-card-hover: #f8f9fb;
    --sx-surface-group-header: #d8dee6;
    --sx-text-primary: #0f172a;
    --sx-text-secondary: #475569;
    --sx-text-muted: #8893a4;
    --sx-border: #d8dee6;
    --sx-border-subtle: #e8ecf1;
    --sx-accent: #3b82f6;
    --sx-accent-hover: #2563eb;
    --sx-accent-bg-subtle: #eff6ff;
    --sx-success: #22c55e;
    --sx-warning: #f59e0b;
    --sx-error: #ef4444;
    --sx-info: #3b82f6;

    /* Shadows */
    --sx-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
    --sx-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.09), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
    --sx-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.08);

    /* Border radius */
    --sx-radius-sm: 4px;
    --sx-radius-md: 6px;
    --sx-radius-lg: 8px;

    /* Focus ring */
    --sx-focus-ring: 0 0 0 2px #eff6ff, 0 0 0 4px #3b82f6;

    /* Syntax highlighting */
    --sx-syntax-key: #7c3aed;
    --sx-syntax-string: #16a34a;
    --sx-syntax-number: #d97706;
    --sx-syntax-boolean: #2563eb;
    --sx-syntax-null: #64748b;
    --sx-syntax-bracket: #475569;

    /* Status badge colors */
    --sx-status-success-bg: #dcfce7;
    --sx-status-success-text: #166534;
    --sx-status-redirect-bg: #dbeafe;
    --sx-status-redirect-text: #1e40af;
    --sx-status-client-error-bg: #fecaca;
    --sx-status-client-error-text: #991b1b;
    --sx-status-server-error-bg: #fef08a;
    --sx-status-server-error-text: #854d0e;

    /* Method badge colors */
    --sx-method-get-bg: #dcfce7;
    --sx-method-get-text: #166534;
    --sx-method-get-border: #86efac;
    --sx-method-post-bg: #dbeafe;
    --sx-method-post-text: #1e40af;
    --sx-method-post-border: #93c5fd;
    --sx-method-put-bg: #fef3c7;
    --sx-method-put-text: #92400e;
    --sx-method-put-border: #fcd34d;
    --sx-method-patch-bg: #f3e8ff;
    --sx-method-patch-text: #6b21a8;
    --sx-method-patch-border: #d8b4fe;
    --sx-method-delete-bg: #fecaca;
    --sx-method-delete-text: #991b1b;
    --sx-method-delete-border: #fca5a5;
    --sx-method-head-bg: #f3f4f6;
    --sx-method-head-text: #374151;
    --sx-method-head-border: #d1d5db;
    --sx-method-options-bg: #f3f4f6;
    --sx-method-options-text: #374151;
    --sx-method-options-border: #d1d5db;
  }
`;

export const darkTheme = css`
  :host([theme='dark']) {
    --sx-surface-primary: #0f172a;
    --sx-surface-secondary: #1e293b;
    --sx-surface-tertiary: #334155;
    --sx-surface-card: #1e293b;
    --sx-surface-card-hover: #253449;
    --sx-surface-group-header: #253449;
    --sx-text-primary: #f1f5f9;
    --sx-text-secondary: #94a3b8;
    --sx-text-muted: #64748b;
    --sx-border: #334155;
    --sx-border-subtle: #1e293b;
    --sx-accent: #60a5fa;
    --sx-accent-hover: #3b82f6;
    --sx-accent-bg-subtle: #172554;
    --sx-success: #4ade80;
    --sx-warning: #fbbf24;
    --sx-error: #f87171;
    --sx-info: #60a5fa;

    /* Shadows */
    --sx-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --sx-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --sx-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2);

    /* Border radius (same as light) */
    --sx-radius-sm: 4px;
    --sx-radius-md: 6px;
    --sx-radius-lg: 8px;

    /* Focus ring */
    --sx-focus-ring: 0 0 0 2px #172554, 0 0 0 4px #60a5fa;

    /* Syntax highlighting */
    --sx-syntax-key: #a78bfa;
    --sx-syntax-string: #4ade80;
    --sx-syntax-number: #fbbf24;
    --sx-syntax-boolean: #60a5fa;
    --sx-syntax-null: #64748b;
    --sx-syntax-bracket: #94a3b8;

    /* Status badge colors */
    --sx-status-success-bg: #052e16;
    --sx-status-success-text: #4ade80;
    --sx-status-redirect-bg: #172554;
    --sx-status-redirect-text: #60a5fa;
    --sx-status-client-error-bg: #450a0a;
    --sx-status-client-error-text: #f87171;
    --sx-status-server-error-bg: #422006;
    --sx-status-server-error-text: #fbbf24;

    /* Method badge colors */
    --sx-method-get-bg: #052e16;
    --sx-method-get-text: #4ade80;
    --sx-method-get-border: #166534;
    --sx-method-post-bg: #172554;
    --sx-method-post-text: #60a5fa;
    --sx-method-post-border: #1e40af;
    --sx-method-put-bg: #422006;
    --sx-method-put-text: #fbbf24;
    --sx-method-put-border: #92400e;
    --sx-method-patch-bg: #3b0764;
    --sx-method-patch-text: #c084fc;
    --sx-method-patch-border: #6b21a8;
    --sx-method-delete-bg: #450a0a;
    --sx-method-delete-text: #f87171;
    --sx-method-delete-border: #991b1b;
    --sx-method-head-bg: #1f2937;
    --sx-method-head-text: #9ca3af;
    --sx-method-head-border: #374151;
    --sx-method-options-bg: #1f2937;
    --sx-method-options-text: #9ca3af;
    --sx-method-options-border: #374151;
  }
`;

export const baseStyles = css`
  :host {
    display: block;
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
    color: var(--sx-text-primary);
    background: var(--sx-surface-primary);
    line-height: 1.6;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
