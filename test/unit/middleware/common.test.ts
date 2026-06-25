import { describe, it, expect } from 'vitest';
import { renderHTML, getDistDir } from '../../../src/middleware/common.js';

describe('middleware/common', () => {
  describe('renderHTML', () => {
    it('returns valid HTML with default title', () => {
      const html = renderHTML();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>RunDocs — API Documentation</title>');
      expect(html).toContain('<rundocs-app');
    });

    it('uses custom title', () => {
      const html = renderHTML({ title: 'My API Docs' });
      expect(html).toContain('<title>My API Docs</title>');
    });

    it('sets spec-url attribute when specUrl is provided', () => {
      const html = renderHTML({ specUrl: '/openapi.json' });
      expect(html).toContain('spec-url="/openapi.json"');
    });

    it('escapes spec-url attribute value', () => {
      const html = renderHTML({ specUrl: '/api?v=1&format="json"' });
      expect(html).toContain('spec-url="/api?v=1&amp;format=&quot;json&quot;"');
    });

    it('sets spec-url to ./spec.json when inline spec is provided', () => {
      const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0' } };
      const html = renderHTML({ spec });
      expect(html).toContain('spec-url="./spec.json"');
    });

    it('uses relative paths for assets regardless of routePrefix', () => {
      const html = renderHTML({ routePrefix: '/docs' });
      expect(html).toContain('href="./rundocs.css"');
      expect(html).toContain('src="./rundocs.js"');
    });

    it('uses relative paths for assets by default', () => {
      const html = renderHTML();
      expect(html).toContain('href="./rundocs.css"');
      expect(html).toContain('src="./rundocs.js"');
    });

    it('loads init script from external file', () => {
      const html = renderHTML();
      expect(html).toContain('src="./rundocs-init.js"');
    });

    it('escapes HTML in title', () => {
      const html = renderHTML({ title: '<script>alert("xss")</script>' });
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('includes rundocs-app element', () => {
      const html = renderHTML();
      expect(html).toContain('<rundocs-app');
      expect(html).toContain('</rundocs-app>');
    });

    it('does not embed inline spec in HTML (served via /spec.json instead)', () => {
      const spec = { info: { description: '</script><script>alert("xss")</script>' } };
      const html = renderHTML({ spec });
      // Spec is not embedded inline — no script injection vector
      expect(html).not.toContain('</script><script>alert');
      expect(html).not.toContain('window.__RUNDOCS_SPEC__');
      // Spec is referenced via spec-url attribute instead
      expect(html).toContain('spec-url="./spec.json"');
    });
  });

  describe('getDistDir', () => {
    it('returns a string path', () => {
      const dir = getDistDir();
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    });
  });
});
