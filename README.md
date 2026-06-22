# RunDocs

An OpenAPI 3.x documentation UI with Postman-like UX — installable as an npm package.

RunDocs takes an OpenAPI 3.0 or 3.1 spec and gives you interactive API documentation with a built-in request builder, history, environment variables, and code samples.

## Features

- **Interactive Request Builder** — method selector, URL input, path/query params, headers, auth, and body editor
- **Authentication** — Bearer token, Basic auth, API Key (header or query)
- **Code Samples** — dynamic cURL, JavaScript, Python, and Node.js snippets that reflect your actual request configuration
- **Request History** — stores up to 100 requests with full response data, auth secrets redacted on disk
- **Environment Variables** — multiple environments with `{{variable}}` interpolation in URLs, headers, body, and auth fields
- **Schema Documentation** — expandable property tree with types, constraints, descriptions, and generated JSON examples
- **Dark Mode** — light/dark theme toggle, persisted to localStorage
- **Fuzzy Search** — filter endpoints instantly
- **Server Middleware** — Express and Fastify plugins for mounting in Node.js apps
- **Accessibility** — labeled form inputs, `aria-pressed` on toggles, `role="alert"` on errors, keyboard navigation

## Quick Start

```bash
npm install rundocs
```

### Express Middleware

```javascript
const express = require('express');
const { runDocs } = require('rundocs/express');

const app = express();

app.use('/docs', runDocs({
  specUrl: 'https://petstore3.swagger.io/api/v3/openapi.json',
  title: 'My API Docs',
}));

// Or with an inline spec object:
app.use('/docs', runDocs({
  spec: require('./openapi.json'),
  title: 'My API Docs',
}));

app.listen(3000);
```

Visit `http://localhost:3000/docs/` to see the documentation.

### Fastify Plugin

```javascript
const fastify = require('fastify')();
const { runDocs } = require('rundocs/fastify');

fastify.register(runDocs, {
  prefix: '/docs',
  specUrl: 'https://petstore3.swagger.io/api/v3/openapi.json',
  title: 'My API Docs',
});

fastify.listen({ port: 3000 });
```

### Standalone HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>API Docs</title>
  <link rel="stylesheet" href="node_modules/rundocs/dist/rundocs.css" />
</head>
<body>
  <rundocs-app spec-url="https://petstore3.swagger.io/api/v3/openapi.json"></rundocs-app>
  <script type="module">
    import { defineRunDocs } from 'node_modules/rundocs/dist/rundocs.es.js';
    defineRunDocs();
  </script>
</body>
</html>
```

## Configuration

### Attributes

| Attribute | Description |
|-----------|-------------|
| `spec-url` | URL to an OpenAPI 3.x JSON or YAML spec |
| `theme` | `light` or `dark` (default: `light`) |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `spec` | `object` | Inline OpenAPI spec object (alternative to `spec-url`) |

### Middleware Options

| Option | Type | Description |
|--------|------|-------------|
| `specUrl` | `string` | URL to fetch the OpenAPI spec from |
| `spec` | `object` | Inline OpenAPI spec object |
| `title` | `string` | Page title (default: `"RunDocs"`) |

## Environment Variables

Create multiple environments (Dev, Staging, Prod) and use `{{variable}}` placeholders in URLs, headers, body, and auth fields. Variable names can include dots and hyphens (`{{api.host}}`, `{{auth-token}}`).

Variable values are kept in memory only — not persisted to localStorage for security.

## OpenAPI Support

- OpenAPI 3.0 and 3.1 specs (JSON and YAML)
- Server variable substitution (`{variable}` defaults resolved)
- Parameter deduplication (operation-level overrides path-level)
- Global security fallback
- Tag ordering from `doc.tags` array
- `nullable` type labels and OAS 3.1 array type (`type: ["string", "null"]`)
- `allOf` deep merge with constraint preservation
- Swagger 2.0 specs are **not supported** — a conversion link is shown

## Browser Support

Modern browsers with ES2021 support (Chrome, Firefox, Safari, Edge).

**Note:** `crypto.randomUUID()` is used for ID generation when available (secure contexts: HTTPS or localhost). A fallback is provided for plain HTTP on non-localhost origins (e.g., LAN IP access).

## Development

### Prerequisites

- Node.js >= 18
- pnpm (use `npx pnpm` if not on PATH)

### Setup

```bash
git clone <repo-url>
cd rundocs
npx pnpm install
npx pnpm dev          # Start dev server
npx pnpm run typecheck # Type checking
npx pnpm test          # Run tests
npx pnpm run build     # Production build
```

## License

MIT
