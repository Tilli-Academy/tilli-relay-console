/**
 * Lightweight markdown-to-HTML converter.
 * Handles the subset of markdown commonly used in OpenAPI descriptions:
 * headings, bold, italic, code, links, lists, and paragraphs.
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';

  let result = escapeHtml(md);

  // Code blocks (``` ... ```)
  result = result.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  result = result.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  result = result.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold + italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links [text](url) — sanitize href to prevent XSS
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    const href = sanitizeUrl(url);
    return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  });

  // Unordered lists
  result = result.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
  result = result.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs (double newlines)
  result = result
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul')) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  // Single newlines -> <br> within paragraphs
  result = result.replace(
    /<p>([^]*?)<\/p>/g,
    (_, content) => `<p>${content.replace(/\n/g, '<br>')}</p>`,
  );

  return result;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Allowlist safe URL schemes and escape quotes to prevent XSS via href injection. */
function sanitizeUrl(url: string): string {
  // Decode HTML entities so we can inspect the real URL
  const decoded = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  const trimmed = decoded.trim().toLowerCase();

  // Allow only safe schemes + relative/anchor URLs
  const isSafe =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/');

  if (!isSafe) return '#';

  // Escape double quotes to prevent attribute breakout
  return url.replace(/"/g, '&quot;');
}
