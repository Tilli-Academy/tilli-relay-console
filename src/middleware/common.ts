import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface RunDocsOptions {
  /** URL or path to an OpenAPI JSON/YAML spec. */
  specUrl?: string;
  /** Inline OpenAPI spec object (JSON-serialisable). */
  spec?: Record<string, unknown>;
  /** Page title shown in the browser tab. */
  title?: string;
  /** Base path where RunDocs UI is served (used internally). */
  routePrefix?: string;
}

/**
 * Resolves the absolute path to the `dist` directory that contains the
 * built frontend assets (rundocs.es.js, rundocs.css).
 */
export function getDistDir(): string {
  // Works for both CJS (__dirname) and ESM (import.meta.url)
  const dir =
    typeof __dirname !== 'undefined'
      ? __dirname
      : dirname(fileURLToPath(import.meta.url));

  // When built with tsup the middleware lives at dist/middleware/
  // so the frontend assets are one level up in dist/
  // When running from source (src/middleware/) go up to project root then into dist/
  if (dir.replace(/\\/g, '/').endsWith('src/middleware')) {
    return resolve(dir, '..', '..', 'dist');
  }
  return resolve(dir, '..');
}

/**
 * Generates the full HTML page that bootstraps RunDocs.
 */
export function renderHTML(opts: RunDocsOptions = {}): string {
  const title = opts.title ?? 'RunDocs — API Documentation';

  let specAttr = '';
  if (opts.specUrl) {
    specAttr = ` spec-url="${escapeAttr(opts.specUrl)}"`;
  }

  let specScript = '';
  if (opts.spec) {
    specScript = `
    <script>
      window.__RUNDOCS_SPEC__ = ${JSON.stringify(opts.spec).replace(/</g, '\\u003c')};
      customElements.whenDefined('rundocs-app').then(() => {
        const app = document.querySelector('rundocs-app');
        if (app) app.spec = window.__RUNDOCS_SPEC__;
      });
    </script>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
  <link rel="stylesheet" href="./rundocs.css" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    rundocs-app { display: block; height: 100vh; }
  </style>
</head>
<body>
  <rundocs-app${specAttr}></rundocs-app>
  <script type="module">
    import { defineRunDocs } from './rundocs.es.js';
    defineRunDocs();
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
