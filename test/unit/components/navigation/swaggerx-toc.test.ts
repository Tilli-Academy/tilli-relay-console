import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/navigation/swaggerx-toc.js';
import type { SwaggerXToc } from '../../../../src/components/navigation/swaggerx-toc.js';
import type { ApiInfo, ServerInfo } from '../../../../src/core/types.js';

const sampleInfo: ApiInfo = {
  title: 'Petstore API',
  version: '1.0.0',
  description: 'A sample API for managing pets',
  contact: {
    name: 'API Support',
    email: 'support@petstore.com',
  },
  license: {
    name: 'MIT',
  },
};

const sampleServers: ServerInfo[] = [
  { url: 'https://api.petstore.com/v1', description: 'Production' },
  { url: 'https://staging.petstore.com/v1', description: 'Staging' },
];

describe('swaggerx-toc', () => {
  let el: SwaggerXToc;

  beforeEach(async () => {
    el = await fixture<SwaggerXToc>(html`
      <swaggerx-toc .info=${sampleInfo} .servers=${sampleServers}></swaggerx-toc>
    `);
  });

  it('renders the API description', () => {
    const desc = el.shadowRoot!.querySelector('.description');
    expect(desc!.textContent).toBe('A sample API for managing pets');
  });

  it('renders server URLs', () => {
    const serverUrls = el.shadowRoot!.querySelectorAll('.server-url');
    expect(serverUrls.length).toBe(2);
    expect(serverUrls[0].textContent).toBe('https://api.petstore.com/v1');
    expect(serverUrls[1].textContent).toBe('https://staging.petstore.com/v1');
  });

  it('renders server descriptions', () => {
    const descs = el.shadowRoot!.querySelectorAll('.server-desc');
    expect(descs.length).toBe(2);
    expect(descs[0].textContent).toBe('(Production)');
  });

  it('renders contact email', () => {
    const email = el.shadowRoot!.querySelector('.meta-link[href^="mailto"]');
    expect(email).toBeTruthy();
    expect(email!.textContent).toBe('support@petstore.com');
  });

  it('renders license name', () => {
    const meta = el.shadowRoot!.querySelectorAll('.meta-item');
    const licenseItem = Array.from(meta).find((m) => m.textContent?.includes('MIT'));
    expect(licenseItem).toBeTruthy();
  });

  it('renders nothing when info is null', async () => {
    el = await fixture<SwaggerXToc>(html`<swaggerx-toc></swaggerx-toc>`);
    expect(el.shadowRoot!.querySelector('.description')).toBeNull();
    expect(el.shadowRoot!.querySelector('.servers')).toBeNull();
  });

  it('renders without servers', async () => {
    el = await fixture<SwaggerXToc>(html`
      <swaggerx-toc .info=${sampleInfo} .servers=${[]}></swaggerx-toc>
    `);
    expect(el.shadowRoot!.querySelector('.servers')).toBeNull();
    expect(el.shadowRoot!.querySelector('.description')).toBeTruthy();
  });
});
