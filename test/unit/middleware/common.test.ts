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

    it('injects inline spec as script when spec is provided', () => {
      const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0' } };
      const html = renderHTML({ spec });
      expect(html).toContain('window.__RUNDOCS_SPEC__');
      expect(html).toContain('"openapi":"3.0.0"');
    });

    it('uses relative paths for assets regardless of routePrefix', () => {
      const html = renderHTML({ routePrefix: '/docs' });
      expect(html).toContain('href="./rundocs.css"');
      expect(html).toContain("from './rundocs.es.js'");
    });

    it('uses relative paths for assets by default', () => {
      const html = renderHTML();
      expect(html).toContain('href="./rundocs.css"');
      expect(html).toContain("from './rundocs.es.js'");
    });

    it('calls defineRunDocs to register all components', () => {
      const html = renderHTML();
      expect(html).toContain('defineRunDocs()');
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
  });

  describe('getDistDir', () => {
    it('returns a string path', () => {
      const dir = getDistDir();
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    });
  });
});
