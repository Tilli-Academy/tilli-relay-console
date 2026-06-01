import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface SwaggerXOptions {
  /** URL or path to an OpenAPI JSON/YAML spec. */
  specUrl?: string;
  /** Inline OpenAPI spec object (JSON-serialisable). */
  spec?: Record<string, unknown>;
  /** Page title shown in the browser tab. */
  title?: string;
  /** Base path where SwaggerX UI is served (used internally). */
  routePrefix?: string;
}

/**
 * Resolves the absolute path to the `dist` directory that contains the
 * built frontend assets (swaggerx.es.js, swaggerx.css).
 */
export function getDistDir(): string {
  // Works for both CJS (__dirname) and ESM (import.meta.url)
  const dir =
    typeof __dirname !== 'undefined'
      ? __dirname
      : dirname(fileURLToPath(import.meta.url));

  // When built with tsup the middleware lives at dist/middleware/
  // so the frontend assets are one level up in dist/
  return resolve(dir, '..');
}

/**
 * Generates the full HTML page that bootstraps SwaggerX.
 */
export function renderHTML(opts: SwaggerXOptions = {}): string {
  const title = opts.title ?? 'SwaggerX — API Documentation';

  let specAttr = '';
  if (opts.specUrl) {
    specAttr = ` spec-url="${escapeAttr(opts.specUrl)}"`;
  }

  let specScript = '';
  if (opts.spec) {
    specScript = `
    <script>
      window.__SWAGGERX_SPEC__ = ${JSON.stringify(opts.spec)};
      customElements.whenDefined('swaggerx-app').then(() => {
        const app = document.querySelector('swaggerx-app');
        if (app) app.spec = window.__SWAGGERX_SPEC__;
      });
    </script>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
  <link rel="stylesheet" href="./swaggerx.css" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    swaggerx-app { display: block; height: 100vh; }
  </style>
</head>
<body>
  <swaggerx-app${specAttr}></swaggerx-app>
  <script type="module">
    import { defineSwaggerX } from './swaggerx.es.js';
    defineSwaggerX();
  </script>${specScript}
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
