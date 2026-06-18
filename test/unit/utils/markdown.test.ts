import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../../../src/utils/markdown.js';

describe('markdownToHtml', () => {
  it('returns empty string for empty input', () => {
    expect(markdownToHtml('')).toBe('');
  });

  it('wraps plain text in paragraph tags', () => {
    expect(markdownToHtml('Hello world')).toContain('<p>Hello world</p>');
  });

  it('converts bold text', () => {
    const result = markdownToHtml('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('converts italic text', () => {
    const result = markdownToHtml('This is *italic* text');
    expect(result).toContain('<em>italic</em>');
  });

  it('converts inline code', () => {
    const result = markdownToHtml('Use `console.log()` here');
    expect(result).toContain('<code>console.log()</code>');
  });

  it('converts headings', () => {
    expect(markdownToHtml('# Heading 1')).toContain('<h1>Heading 1</h1>');
    expect(markdownToHtml('## Heading 2')).toContain('<h2>Heading 2</h2>');
    expect(markdownToHtml('### Heading 3')).toContain('<h3>Heading 3</h3>');
    expect(markdownToHtml('#### Heading 4')).toContain('<h4>Heading 4</h4>');
  });

  it('converts links', () => {
    const result = markdownToHtml('[Click here](https://example.com)');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Click here');
    expect(result).toContain('target="_blank"');
  });

  it('converts unordered lists', () => {
    const result = markdownToHtml('- Item 1\n- Item 2');
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
    expect(result).toContain('<ul>');
  });

  it('converts code blocks', () => {
    const result = markdownToHtml('```js\nconst x = 1;\n```');
    expect(result).toContain('<pre><code>');
    expect(result).toContain('const x = 1;');
  });

  it('escapes HTML entities', () => {
    const result = markdownToHtml('Use <script> tags');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('handles multiple paragraphs', () => {
    const result = markdownToHtml('First paragraph\n\nSecond paragraph');
    expect(result).toContain('<p>First paragraph</p>');
    expect(result).toContain('<p>Second paragraph</p>');
  });

  describe('link XSS prevention', () => {
    it('blocks javascript: protocol in links', () => {
      const result = markdownToHtml('[click](javascript:alert(1))');
      expect(result).not.toContain('href="javascript:');
      expect(result).toContain('href="#"');
    });

    it('blocks javascript: with mixed case', () => {
      const result = markdownToHtml('[click](JavaScript:alert(1))');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('href="#"');
    });

    it('blocks data: protocol in links', () => {
      const result = markdownToHtml('[click](data:text/html,<script>alert(1)</script>)');
      expect(result).toContain('href="#"');
    });

    it('blocks vbscript: protocol in links', () => {
      const result = markdownToHtml('[click](vbscript:MsgBox("xss"))');
      expect(result).toContain('href="#"');
    });

    it('blocks attribute breakout via double quotes', () => {
      const result = markdownToHtml('[hover](" onmouseover="alert(1))');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('href="#"');
    });

    it('escapes double quotes in otherwise safe URLs', () => {
      const result = markdownToHtml('[click](https://example.com/"test)');
      expect(result).not.toContain('href="https://example.com/"test"');
      expect(result).toContain('&quot;');
    });

    it('allows http:// links', () => {
      const result = markdownToHtml('[docs](http://example.com)');
      expect(result).toContain('href="http://example.com"');
    });

    it('allows https:// links', () => {
      const result = markdownToHtml('[docs](https://example.com)');
      expect(result).toContain('href="https://example.com"');
    });

    it('allows mailto: links', () => {
      const result = markdownToHtml('[email](mailto:user@example.com)');
      expect(result).toContain('href="mailto:user@example.com"');
    });

    it('allows anchor (#) links', () => {
      const result = markdownToHtml('[section](#overview)');
      expect(result).toContain('href="#overview"');
    });

    it('allows relative path links', () => {
      const result = markdownToHtml('[page](/docs/guide)');
      expect(result).toContain('href="/docs/guide"');
    });
  });
});
