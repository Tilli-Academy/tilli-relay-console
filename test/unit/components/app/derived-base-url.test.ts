import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/app/rundocs-app.js';
import type { RunDocsApp } from '../../../../src/components/app/rundocs-app.js';

/**
 * Tests for the _derivedBaseUrl getter in rundocs-app.
 *
 * This getter determines the correct base URL for API requests,
 * handling reverse proxy setups where a path prefix (e.g., /proxy/3101)
 * must be preserved.
 *
 * 3-step logic:
 *   1. Spec has servers with absolute URL → use that
 *   2. routePrefix set → strip it from page URL to get base
 *   3. Fallback → window.location.origin
 */
describe('rundocs-app _derivedBaseUrl', () => {
  let originalHref: string;
  let originalOrigin: string;

  beforeEach(() => {
    originalHref = window.location.href;
    originalOrigin = window.location.origin;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: { href: originalHref, origin: originalOrigin },
      writable: true,
      configurable: true,
    });
  });

  function setWindowLocation(href: string, origin: string) {
    Object.defineProperty(window, 'location', {
      value: { href, origin },
      writable: true,
      configurable: true,
    });
  }

  it('Step 1: uses spec server URL when available', async () => {
    setWindowLocation(
      'https://proxy.example.com/proxy/3101/api/rundocs/',
      'https://proxy.example.com',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    // Set spec with servers
    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [{ url: 'https://api.production.com', description: 'Prod' }],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    expect(baseUrl).toBe('https://api.production.com');
  });

  it('Step 2: strips route prefix from page URL (proxy setup)', async () => {
    setWindowLocation(
      'https://10.10.0.36:8156/proxy/3101/api/rundocs/',
      'https://10.10.0.36:8156',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    // Set spec with no servers (empty array — like TQP-Backend)
    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    expect(baseUrl).toBe('https://10.10.0.36:8156/proxy/3101');
  });

  it('Step 2: strips query params and hash before matching prefix', async () => {
    setWindowLocation(
      'https://10.10.0.36:8156/proxy/3101/api/rundocs/?debug=true#section',
      'https://10.10.0.36:8156',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    expect(baseUrl).toBe('https://10.10.0.36:8156/proxy/3101');
  });

  it('Step 2: removes trailing slashes from derived base URL', async () => {
    setWindowLocation(
      'https://example.com/prefix//api/rundocs/',
      'https://example.com',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    expect(baseUrl).toBe('https://example.com/prefix');
  });

  it('Step 3: falls back to window.location.origin when no route prefix', async () => {
    setWindowLocation(
      'https://example.com/docs/',
      'https://example.com',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app></rundocs-app>
    `);

    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    expect(baseUrl).toBe('https://example.com');
  });

  it('Step 1 takes priority: spec server URL used even when route prefix is set', async () => {
    setWindowLocation(
      'https://10.10.0.36:8156/proxy/3101/api/rundocs/',
      'https://10.10.0.36:8156',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [{ url: 'https://api.company.com', description: 'Prod' }],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    // Spec server takes priority over route prefix
    expect(baseUrl).toBe('https://api.company.com');
  });

  it('ignores relative or slash-only spec server URL', async () => {
    setWindowLocation(
      'https://10.10.0.36:8156/proxy/3101/api/rundocs/',
      'https://10.10.0.36:8156',
    );

    const el = await fixture<RunDocsApp>(html`
      <rundocs-app route-prefix="/api/rundocs"></rundocs-app>
    `);

    (el as any)._spec = {
      info: { title: 'Test', version: '1.0' },
      servers: [{ url: '/' }],
      tags: [],
      endpoints: [],
    };

    const baseUrl = (el as any)._derivedBaseUrl;
    // '/' is not an absolute URL, so falls through to Step 2
    expect(baseUrl).toBe('https://10.10.0.36:8156/proxy/3101');
  });
});
