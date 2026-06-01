import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { getDistDir, renderHTML, type SwaggerXOptions } from './common.js';

export type { SwaggerXOptions };

const swaggerXPlugin: FastifyPluginCallback<SwaggerXOptions> = (
  fastify: FastifyInstance,
  opts: SwaggerXOptions,
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
 * Fastify plugin that serves the SwaggerX UI.
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { swaggerX } from 'swaggerx/fastify';
 *
 * const app = Fastify();
 * app.register(swaggerX, { prefix: '/docs', specUrl: '/openapi.json' });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require('fastify-plugin') as typeof import('fastify-plugin')['default'];

export const swaggerX = fp(swaggerXPlugin, {
  name: 'swaggerx',
  fastify: '>=4.0.0',
});

export default swaggerX;
