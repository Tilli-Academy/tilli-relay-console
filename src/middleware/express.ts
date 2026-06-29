import { createRequire } from 'module';
import type { RequestHandler, Router } from 'express';
import { getDistDir, renderHTML, type RunDocsOptions } from './common.js';

const _require = createRequire(
  typeof __filename !== 'undefined' ? __filename : import.meta.url,
);

export type { RunDocsOptions };

/**
 * Express middleware that serves the RunDocs UI.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { runDocs } from 'rundocs/express';
 *
 * const app = express();
 * app.use('/docs', runDocs({ specUrl: '/openapi.json' }));
 * ```
 */
export function runDocs(opts: RunDocsOptions = {}): Router {
  const express = _require('express') as typeof import('express');

  const router = express.Router();
  const distDir = getDistDir();

  // Serve the HTML page at the mount root
  const serveHTML: RequestHandler = (_req, res) => {
    const prefix = opts.routePrefix ?? _req.baseUrl ?? '';
    const htmlContent = renderHTML({ ...opts, routePrefix: prefix });
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  };

  // Serve the init script as an external file (CSP-safe, CORS-safe)
  router.get('/rundocs-init.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`RunDocs.defineRunDocs();\n`);
  });

  // Serve inline spec as a JSON endpoint (CSP-safe, avoids inline scripts)
  if (opts.spec) {
    router.get('/spec.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(opts.spec));
    });
  }

  // Redirect /docs to /docs/ so relative asset paths resolve correctly
  router.get(
    '/',
    (req, res, next) => {
      if (!req.originalUrl.endsWith('/')) {
        return res.redirect(301, req.originalUrl + '/');
      }
      next();
    },
    serveHTML,
  );

  // Serve built frontend assets (JS, CSS, etc.)
  router.use(express.static(distDir, { index: false }));

  return router;
}

export default runDocs;
