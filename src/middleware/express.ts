import type { RequestHandler, Router } from 'express';
import { getDistDir, renderHTML, type SwaggerXOptions } from './common.js';

export type { SwaggerXOptions };

/**
 * Express middleware that serves the SwaggerX UI.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { swaggerX } from 'swaggerx/express';
 *
 * const app = express();
 * app.use('/docs', swaggerX({ specUrl: '/openapi.json' }));
 * ```
 */
export function swaggerX(opts: SwaggerXOptions = {}): Router {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express') as typeof import('express');

  const router = express.Router();
  const distDir = getDistDir();

  // Serve the HTML page at the mount root
  const serveHTML: RequestHandler = (_req, res) => {
    const prefix = opts.routePrefix ?? _req.baseUrl ?? '';
    const htmlContent = renderHTML({ ...opts, routePrefix: prefix });
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  };

  // Redirect /docs to /docs/ so relative asset paths resolve correctly
  router.get('/', (req, res, next) => {
    if (!req.originalUrl.endsWith('/')) {
      return res.redirect(301, req.originalUrl + '/');
    }
    next();
  }, serveHTML);

  // Serve built frontend assets (JS, CSS, etc.)
  router.use(express.static(distDir, { index: false }));

  return router;
}

export default swaggerX;
