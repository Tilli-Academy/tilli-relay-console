import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { getDistDir, renderHTML, type RunDocsOptions } from './common.js';

export type { RunDocsOptions };

const runDocsPlugin: FastifyPluginCallback<RunDocsOptions> = (
  fastify: FastifyInstance,
  opts: RunDocsOptions,
  done: (err?: Error) => void,
) => {
  const distDir = getDistDir();
  const prefix = opts.routePrefix ?? '';

  // Redirect /docs to /docs/ so relative asset paths resolve correctly
  fastify.get('/', (request, reply) => {
    if (!request.url.endsWith('/')) {
      return reply.status(301).redirect(request.url + '/');
    }
    const htmlContent = renderHTML({ ...opts, routePrefix: prefix });
    void reply.type('text/html').send(htmlContent);
  });

  // Serve built frontend assets using @fastify/static
  void fastify.register(import('@fastify/static'), {
    root: distDir,
    prefix: '/',
    decorateReply: false,
  });

  done();
};

/**
 * Fastify plugin that serves the RunDocs UI.
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { runDocs } from 'rundocs/fastify';
 *
 * const app = Fastify();
 * app.register(runDocs, { prefix: '/docs', specUrl: '/openapi.json' });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require('fastify-plugin') as typeof import('fastify-plugin')['default'];

export const runDocs = fp(runDocsPlugin, {
  name: 'rundocs',
  fastify: '>=4.0.0',
});

export default runDocs;
