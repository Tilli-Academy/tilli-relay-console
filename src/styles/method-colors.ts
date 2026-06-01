import { css } from 'lit';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  get: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  post: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  put: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  patch: { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' },
  delete: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  head: { bg: '#f3f4f6', text: '#374151', border: '#6b7280' },
  options: { bg: '#f3f4f6', text: '#374151', border: '#6b7280' },
};

export const METHOD_COLORS_DARK: Record<HttpMethod, { bg: string; text: string; border: string }> =
  {
    get: { bg: '#052e16', text: '#4ade80', border: '#22c55e' },
    post: { bg: '#172554', text: '#93c5fd', border: '#3b82f6' },
    put: { bg: '#451a03', text: '#fcd34d', border: '#f59e0b' },
    patch: { bg: '#3b0764', text: '#d8b4fe', border: '#a855f7' },
    delete: { bg: '#450a0a', text: '#fca5a5', border: '#ef4444' },
    head: { bg: '#1f2937', text: '#d1d5db', border: '#6b7280' },
    options: { bg: '#1f2937', text: '#d1d5db', border: '#6b7280' },
  };

export const methodBadgeStyles = css`
  .method-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    letter-spacing: 0.025em;
    min-width: 56px;
  }
`;
