import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { runDocs } from '../../../src/middleware/fastify.js';

describe('middleware/fastify', () => {
  it('exports runDocs function', () => {
    expect(typeof runDocs).toBe('function');
  });

  it('serves HTML at the root route', async () => {
    const app = Fastify();
    await app.register(runDocs, { specUrl: '/openapi.json' });
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('<rundocs-app');
    expect(res.body).toContain('src="./rundocs-init.js"');

    await app.close();
  });

  it('includes specUrl in the rendered HTML', async () => {
    const app = Fastify();
    await app.register(runDocs, { specUrl: '/api/spec.json' });
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.body).toContain('/api/spec.json');

    await app.close();
  });

  it('serves inline spec via spec-url attribute', async () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0' }, paths: {} };
    const app = Fastify();
    await app.register(runDocs, { spec });
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.body).toContain('spec-url="./spec.json"');
    expect(res.body).not.toContain('__RUNDOCS_SPEC__');

    await app.close();
  });

  it('includes custom title in the rendered HTML', async () => {
    const app = Fastify();
    await app.register(runDocs, { title: 'My API Docs' });
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.body).toContain('My API Docs');

    await app.close();
  });
});
