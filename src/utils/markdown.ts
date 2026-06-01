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

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );

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
  result = result.replace(/<p>([^]*?)<\/p>/g, (_, content) =>
    `<p>${content.replace(/\n/g, '<br>')}</p>`,
  );

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
