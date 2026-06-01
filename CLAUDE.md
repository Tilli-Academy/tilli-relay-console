# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwaggerX is a Swagger UI alternative with Postman-like UI/UX, built as an installable npm package using Lit web components. Developers point it at an OpenAPI spec (2.0/3.0/3.1) and get interactive API documentation with a built-in request builder, history, and environment variables.

## Key Features

- **API Documentation Viewer** — Loads OpenAPI 2.0/3.0/3.1 specs from URL or inline JSON/YAML, displays endpoints grouped by tags
- **Interactive Request Builder** — Method selector, URL input, path/query parameter editors, headers editor, request body editor (JSON/XML/plaintext)
- **Authentication Support** — Bearer token, Basic auth, API Key (header or query)
- **Response Viewer** — Color-coded status badges, response time/size, formatted JSON body, response headers table
- **Schema Documentation** — Expandable property tree with types, constraints, descriptions; generated JSON examples
- **Code Samples** — Dynamic snippets in cURL, JavaScript, Python, Node.js that reflect the user's auth config, custom headers, and request body from the request builder. Falls back to spec examples when no user input. Supports Bearer, Basic, API Key (header/query), and OAuth2 auth. Header merge order: auth headers → custom headers → Content-Type/Accept defaults.
- **Request History** — Stores up to 100 requests in localStorage with full response data including auth config, click to restore saved request/response/auth, selected item highlighting, delete individual or clear all. Old entries without auth reset to "No Auth" on restore.
- **Environment Variables** — Multiple environments (Dev, Staging, Prod), `{{variable}}` interpolation in URLs, headers, body, and auth fields (token, username, password, API key name/value). Auto-save indicator in env manager modal header (debounced 500ms).
- **Dark Mode** — Light/dark theme toggle, persisted to localStorage
- **Fuzzy Search** — Filter endpoints instantly via fuse.js
- **Resizable Split Pane** — Draggable sidebar/main divider, ratio persisted
- **Server Middleware** — Express middleware and Fastify plugin for mounting SwaggerX in Node.js apps, supports both `specUrl` and inline `spec` options, proxy-safe with relative asset paths and trailing slash redirect
- **Accessibility** — ARIA labels, keyboard navigation, semantic HTML, focus management

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Lit | 3.3.2 | Web component framework (Shadow DOM, reactivity) |
| @lit/context | 1.1.6 | State management via contexts |
| Tailwind CSS | 4.3.0 | Utility-first CSS framework |
| fuse.js | 7.3.0 | Fuzzy search for endpoints |
| zod | 4.4.3 | Runtime schema validation |
| Prism.js | 1.30.0 | Syntax highlighting for code samples and schema examples |
| CodeMirror 6 | ^6.43.0 | Code editor for request body (editable) and response body (read-only) — includes @codemirror/commands, lang-json, lang-xml, language, state, view |
| @lezer/highlight | ^1.2.3 | Syntax highlighting primitives (used by CodeMirror) |

### Spec Parsing
| Technology | Version | Purpose |
|---|---|---|
| @apidevtools/swagger-parser | 12.1.0 | OpenAPI parsing, validation, dereferencing |
| js-yaml | 4.1.1 | YAML spec parsing |

### Build Tools
| Technology | Version | Purpose |
|---|---|---|
| Vite | 8.0.12 | Frontend bundler (ES + UMD) |
| tsup | 8.5.1 | Middleware bundler (CJS + ESM) |
| TypeScript | 6.0.3 | Type checking (strict mode) |
| PostCSS + autoprefixer | 8.5.14 | CSS vendor prefixes |
| vite-plugin-node-polyfills | 0.26.0 | Browser polyfills for path, util, buffer, process |

### Testing
| Technology | Version | Purpose |
|---|---|---|
| Vitest | 4.1.6 | Unit test runner |
| happy-dom | 20.9.0 | Lightweight DOM for tests |
| @open-wc/testing | 4.0.0 | Web component testing utilities |
| @types/prismjs | 1.26.6 | TypeScript type declarations for Prism.js |

### Code Quality
| Technology | Version | Purpose |
|---|---|---|
| ESLint | 10.3.0 | Code linting |
| Prettier | 3.8.3 | Code formatting |
| pnpm | 10.33.4 | Package manager |

### Server Frameworks (optional peer dependencies)
| Technology | Version | Purpose |
|---|---|---|
| Express | >=4.0.0 | HTTP framework (middleware target) |
| Fastify | >=4.0.0 | HTTP framework (plugin target) |

## Infrastructure

### Current State

| Area | Status |
|---|---|
| Source code (42 components) | Done |
| Dual build system (Vite + tsup) | Done |
| Unit tests (446 tests, 59 files) | Done |
| Accessibility audit + fixes | Done |
| TypeScript strict mode | Done |
| Dev server (Vite) | Done |
| CLAUDE.md | Done |
| README.md | Not created |
| Docker setup | Not created |
| CI/CD pipeline | Not created |
| npm publish workflow | Not created |
| Security policy (SECURITY.md) | Not created |
| Contributing guide (CONTRIBUTING.md) | Not created |
| Changelog (CHANGELOG.md) | Not created |
| License file (LICENSE) | Not created |
| Git repository | Initialized (main branch) |
| Performance benchmarks | Not created |

### Build Outputs

- **Frontend**: `dist/swaggerx.es.js` (ES module), `dist/swaggerx.js` (UMD bundle), `dist/swaggerx.css` — 272.5KB gzipped
- **Middleware**: `dist/middleware/{express,fastify}.{js,cjs}` with TypeScript declarations
- **Types**: `dist/middleware/{express,fastify}.d.ts` (middleware only — no `dist/index.d.ts` yet, needed before npm publish)

### Package Exports

```json
{
  ".":           { "types", "import" (ES), "require" (UMD) },
  "./express":   { "types", "import", "require" },
  "./fastify":   { "types", "import", "require" },
  "./style.css": "./dist/swaggerx.css"
}
```

## Architecture

### Dual Build System

The project produces two separate outputs:
- **Frontend** (Vite): Builds `dist/swaggerx.es.js` (code-split ES modules) and `dist/swaggerx.js` (single UMD bundle) for browser use
- **Middleware** (tsup): Builds `dist/middleware/{express,fastify}.{js,cjs}` for Node.js server integration

Middleware files use `require()` for framework imports (express, fastify-plugin) instead of top-level `import` to avoid Vite trying to resolve them during the frontend build. Type-only imports are used for TypeScript types from these frameworks.

### Component Architecture

All 42 UI components are Lit web components using Shadow DOM. They follow this pattern:
- `@customElement('swaggerx-*')` decorator for auto-registration
- Styles via Lit's `css` tag (not external CSS files) using `--sx-*` CSS custom properties for theming
- `@property()` for public reactive attributes, `@state()` for private state
- Events bubble up via `CustomEvent` with `{ bubbles: true, composed: true }`

### State Management

Uses `@lit/context` for downward data flow from `swaggerx-app` (root) to all descendants:
- **specContext** — parsed OpenAPI spec
- **historyContext** — request history entries
- **envContext** — environments + active environment ID
- **uiContext** — theme, sidebar state, endpoint selection, history selection

State stores (`src/state/`) are plain classes with `subscribe()`/`notify()` patterns and localStorage persistence. The root `swaggerx-app` component owns store instances and provides context values.

### Data Flow

```
Spec loading (two paths):
  spec-url attribute → parser.ts (swagger-parser) → normalizer.ts → specContext
  spec property (inline) → _loadInlineSpec() → parser.ts → normalizer.ts → specContext

Request flow:
  User builds request → RequestStore (per-endpoint)
  → interpolate env vars in URL, headers, body, and auth fields
  → http-client.ts (appends API key query param if needed) → response
  Response + auth config → history-store.ts → localStorage

History restore:
  Click history item → _onHistorySelect() → loads saved request + response + auth into RequestStore
  Old entries without auth → resets to { type: 'none' }

Environment vars → env-interpolator.ts → replaces {{var}} in URLs, headers, body, and auth fields
Code samples (dynamic):
  code-gen.ts generateCodeSamples(endpoint, baseUrl, { auth, headers, userBody })
  → buildAuthHeaders(auth) → mergedHeaders (auth → custom → Content-Type/Accept defaults)
  → applyApiKeyToUrl() for API key query params
  → userBody overrides spec example; empty userBody falls back to spec
  → generates cURL, JavaScript (fetch), Python (requests), Node.js (axios)
  → window.location.origin fallback when baseUrl is empty
```

Each endpoint gets its own `RequestStore` instance, lazily created and tracked in a `Map<string, RequestStore>` in `swaggerx-app`.

### Syntax Highlighting Architecture

Two separate systems handle code highlighting, each for different use cases:

- **CodeMirror 6** (`@codemirror/*` packages) — powers the request body editor (editable, JSON/XML) and response body viewer (read-only, JSON). These are interactive editor instances with full cursor, selection, and scrolling support. Theme is in `src/utils/codemirror-theme.ts` using `--sx-syntax-*` CSS variables.
- **Prism.js** (`src/utils/prism-highlight.ts`) — powers code samples (cURL, JavaScript, Python, Node.js) and schema JSON examples. These are static `<pre><code>` blocks with highlighted HTML spans. Prism grammars are extended with API-specific tokens (flags, HTTP methods, builtins, method calls) via `Prism.languages.insertBefore()`.

Both systems share the same `--sx-syntax-*` CSS variables from `src/styles/theme.ts` for consistent colors across light/dark mode.

**Prism.js + Vite compatibility**: Prism component files (`prism-json.js`, `prism-bash.js`, `prism-python.js`) are IIFEs that expect a global `Prism` object. Vite's ESM module system can't provide this, so the components are imported as raw text via Vite's `?raw` suffix and executed with `new Function('Prism', src)(Prism)`. See `src/utils/prism-highlight.ts`.

### Middleware Architecture

The Express and Fastify middleware serve SwaggerX as a self-contained UI at a mount path (e.g., `/docs`). Key design decisions:

- **Relative asset paths** — HTML references CSS/JS as `./swaggerx.css` and `./swaggerx.es.js` (not absolute paths like `/docs/swaggerx.css`). This ensures the UI works correctly behind reverse proxies and remote dev environments where the server may be accessed via a different host/path.
- **Trailing slash redirect** — Requests to `/docs` are redirected (301) to `/docs/`. Without the trailing slash, the browser resolves relative paths against the wrong directory (e.g., `./swaggerx.css` becomes `/swaggerx.css` instead of `/docs/swaggerx.css`).
- **`defineSwaggerX()` in HTML** — The HTML template includes an inline ES module that imports and calls `defineSwaggerX()` to register all 42 custom elements. Without this, only `<swaggerx-app>` would be registered and child components would render as empty tags.
- **`customElements.whenDefined()`** — The inline spec is set on the `<swaggerx-app>` element only after `customElements.whenDefined('swaggerx-app')` resolves. This ensures the Lit component class is registered and the `spec` property setter triggers reactivity correctly.
- **Inline spec support** — The middleware accepts a `spec` option (parsed OpenAPI object) which is embedded as `window.__SWAGGERX_SPEC__` in the HTML. This avoids a separate browser request for the spec file, which can fail behind proxies. The `specUrl` option is also supported for fetching specs via URL.

### Key Conventions

- **Import paths**: Always use `.js` extension in imports (TypeScript compiles but runtime needs `.js`)
- **Component naming**: `swaggerx-*` prefix, kebab-case. Class name: `SwaggerX*`, PascalCase
- **Event naming**: kebab-case matching the action (`history-select`, `env-add`, `theme-toggle`)
- **No sibling communication**: Components never talk directly. Child fires event → parent updates context → sibling re-renders
- **Middleware imports**: Server framework dependencies (express, fastify) use `require()` at runtime, never top-level `import`, since users provide these packages themselves

## Project Structure

```
swaggerx/
├── src/
│   ├── components/
│   │   ├── app/
│   │   │   └── swaggerx-app.ts              # Root component — owns contexts, parses spec (specUrl or inline spec property)
│   │   ├── code/
│   │   │   ├── swaggerx-code-block.ts        # Single code snippet display
│   │   │   └── swaggerx-code-samples.ts      # Multi-language code sample tabs
│   │   ├── endpoint/
│   │   │   ├── swaggerx-endpoint.ts          # Full endpoint view with doc tabs (Request Body, Responses, Code)
│   │   │   ├── swaggerx-method-badge.ts      # Colored HTTP method label
│   │   │   ├── swaggerx-path-display.ts      # Path with highlighted parameters
│   │   │   └── swaggerx-description.ts       # Markdown description renderer
│   │   ├── env/
│   │   │   ├── swaggerx-env-manager.ts       # Environment editor modal (auto-save indicator in header, debounced)
│   │   │   └── swaggerx-env-selector.ts      # Active environment dropdown
│   │   ├── history/
│   │   │   ├── swaggerx-history-list.ts      # Request history panel (selectedId for highlight)
│   │   │   └── swaggerx-history-item.ts      # Single history entry (selected state with accent border)
│   │   ├── layout/
│   │   │   ├── swaggerx-header.ts            # Top navigation bar
│   │   │   ├── swaggerx-sidebar.ts           # Left sidebar container
│   │   │   ├── swaggerx-main.ts              # Right content area
│   │   │   └── swaggerx-split-pane.ts        # Resizable pane divider
│   │   ├── navigation/
│   │   │   ├── swaggerx-toc.ts               # API overview / table of contents
│   │   │   ├── swaggerx-search.ts            # Fuzzy endpoint search
│   │   │   ├── swaggerx-tag-group.ts         # Collapsible endpoint group
│   │   │   └── swaggerx-endpoint-item.ts     # Single endpoint list item
│   │   ├── request/
│   │   │   ├── swaggerx-request-bar.ts       # Method dropdown + URL input + Send
│   │   │   ├── swaggerx-request-tabs.ts      # Params/Headers/Auth/Body tabs
│   │   │   ├── swaggerx-params-editor.ts     # Path and query parameter editor
│   │   │   ├── swaggerx-headers-editor.ts    # Request header key-value editor
│   │   │   ├── swaggerx-auth-editor.ts       # Auth config (Bearer/Basic/API Key)
│   │   │   ├── swaggerx-body-editor.ts       # Request body editor
│   │   │   └── swaggerx-send-button.ts       # Send button with loading state
│   │   ├── response/
│   │   │   ├── swaggerx-response.ts          # Response container with tabs
│   │   │   ├── swaggerx-response-meta.ts     # Status code, time, size
│   │   │   ├── swaggerx-response-headers.ts  # Response headers table
│   │   │   ├── swaggerx-response-body.ts     # Formatted response body
│   │   │   └── swaggerx-status-badge.ts      # Color-coded status badge
│   │   ├── schema/
│   │   │   ├── swaggerx-schema-view.ts       # Schema tree + example tabs
│   │   │   └── swaggerx-schema-property.ts   # Single schema property (recursive)
│   │   └── shared/
│   │       ├── swaggerx-icon.ts              # SVG icon component (17 icons)
│   │       ├── swaggerx-tabs.ts              # Reusable tab switcher
│   │       ├── swaggerx-modal.ts             # Modal dialog (uses `heading` prop, not `title` — avoids browser tooltip)
│   │       ├── swaggerx-tooltip.ts           # Hover tooltip
│   │       ├── swaggerx-copy-button.ts       # Copy-to-clipboard button
│   │       ├── swaggerx-badge.ts             # Generic colored badge
│   │       ├── swaggerx-loading.ts           # Loading spinner
│   │       ├── swaggerx-empty-state.ts       # Empty state placeholder
│   │       └── swaggerx-key-value-editor.ts  # Reusable key-value pair editor
│   ├── core/
│   │   ├── types.ts                          # TypeScript interfaces
│   │   ├── parser.ts                         # OpenAPI spec fetching and parsing
│   │   ├── normalizer.ts                     # Raw spec → SwaggerXSpec transformation
│   │   ├── schema-resolver.ts                # $ref dereferencing + example generation
│   │   └── code-gen.ts                       # Dynamic code sample generation (4 languages, auth/headers/body from request builder, spec example fallback, window.location.origin fallback)
│   ├── middleware/
│   │   ├── express.ts                        # Express router middleware (trailing slash redirect)
│   │   ├── fastify.ts                        # Fastify plugin (trailing slash redirect)
│   │   └── common.ts                         # Shared HTML renderer (relative paths, defineSwaggerX, inline spec)
│   ├── state/
│   │   ├── contexts.ts                       # Lit context definitions
│   │   ├── spec-store.ts                     # Parsed spec state
│   │   ├── request-store.ts                  # Per-endpoint request state
│   │   ├── history-store.ts                  # Request history (localStorage, max 100)
│   │   ├── env-store.ts                      # Environments + variables (localStorage)
│   │   └── ui-store.ts                       # Theme, sidebar, layout state, history selection
│   ├── styles/
│   │   ├── theme.ts                          # Light/dark theme CSS variables
│   │   ├── global.css                        # Base reset + font imports
│   │   ├── tailwind.global.css               # Tailwind directives
│   │   ├── method-colors.ts                  # HTTP method → color mapping
│   │   └── tailwind-mixin.ts                 # Tailwind utility mixin
│   ├── utils/
│   │   ├── http-client.ts                    # Fetch wrapper with auth header injection + API key query param append
│   │   ├── url-builder.ts                    # URL construction from parts
│   │   ├── env-interpolator.ts               # {{variable}} substitution
│   │   ├── prism-highlight.ts                # Prism.js syntax highlighting (code samples + schema)
│   │   ├── codemirror-theme.ts               # CodeMirror editor theme (maps --sx-syntax-* vars)
│   │   ├── local-storage.ts                  # JSON get/set/remove helpers
│   │   └── markdown.ts                       # Markdown → HTML conversion
│   ├── index.ts                              # Package entry point + CSS import
│   ├── define.ts                             # Component auto-registration
│   └── vite-env.d.ts                         # Vite environment type declarations
│
├── test/
│   ├── unit/
│   │   ├── components/                       # 42 component test files (swaggerx-app covered by E2E)
│   │   │   ├── app/                          # (no unit test — swaggerx-app tested via Playwright E2E)
│   │   │   ├── code/                         # code-block, code-samples tests
│   │   │   ├── endpoint/                     # endpoint, method-badge, path-display, description tests
│   │   │   ├── env/                          # env-manager, env-selector tests
│   │   │   ├── history/                      # history-list, history-item tests
│   │   │   ├── layout/                       # header, main, sidebar, split-pane tests
│   │   │   ├── navigation/                   # toc, search, tag-group, endpoint-item tests
│   │   │   ├── request/                      # request-bar, tabs, params, headers, auth, body, send tests
│   │   │   ├── response/                     # response, meta, headers, body, status-badge tests
│   │   │   ├── schema/                       # schema-view, schema-property tests
│   │   │   └── shared/                       # icon, tabs, modal, tooltip, copy, badge, loading, empty, kv-editor tests
│   │   ├── core/                             # parser, normalizer, schema-resolver, code-gen tests (4 files)
│   │   ├── state/                            # env-store, history-store, request-store, spec-store, ui-store tests
│   │   ├── middleware/                        # express, fastify, common tests
│   │   └── utils/                            # http-client, url-builder, env-interpolator, local-storage, markdown tests
│   └── fixtures/
│       └── minimal-spec.json                 # Minimal valid OpenAPI spec for unit tests
│
├── demo/
│   ├── server.ts                             # Express demo server (mount at /docs)
│   └── standalone.html                       # CDN/standalone HTML demo page
│
├── dist/                                     # Build output (generated)
│
├── vite.config.ts                            # Vite frontend build config
├── tsup.config.ts                            # tsup middleware build config
├── tsconfig.json                             # TypeScript compiler config
├── vitest.config.ts                          # Vitest test runner config
├── tailwind.config.ts                        # Tailwind CSS theme + colors
├── postcss.config.js                         # PostCSS with autoprefixer
├── .eslintrc.cjs                             # ESLint rules
├── .prettierrc                               # Prettier formatting rules
├── .gitignore                                # Git ignore patterns
├── package.json                              # Project manifest + scripts
├── pnpm-lock.yaml                            # Dependency lock file
├── index.html                                # Dev server entry page
└── CLAUDE.md                                 # This file
```

## Development Setup

### Prerequisites

- **Node.js** >= 18
- **pnpm** (invoked via `npx pnpm` as it may not be on the system PATH)

### Manual Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd swaggerx

# 2. Install dependencies
npx pnpm install

# 3. Start the dev server
npx pnpm dev
# Opens at http://localhost:5173 (or next available port)
# Loads the Petstore sample API spec for testing

# 4. Verify TypeScript compiles
npx pnpm run typecheck

# 5. Run tests
npx pnpm test

# 6. Build for production
npx pnpm run build
```

### Common Commands

```bash
# Development
npx pnpm dev                    # Start Vite dev server (loads Petstore spec)
npx pnpm run typecheck          # TypeScript type checking (strict, noUnusedLocals/Params)

# Testing
npx pnpm test                   # Run all 446 tests once
npx pnpm run test:watch         # Run tests in watch mode
npx vitest run test/unit/core/  # Run tests in a specific directory
npx vitest run -t "parseSpec"   # Run tests matching a name pattern

# Building
npx pnpm run build              # Full build (frontend via Vite + middleware via tsup)
npx pnpm run build:frontend     # Vite library build only (ES + UMD)
npx pnpm run build:middleware   # tsup build only (Express/Fastify middleware)

# Code quality
npx pnpm run lint               # ESLint on src/
npx pnpm run format             # Prettier auto-format src/
npx pnpm run format:check       # Check formatting without fixing

# E2E Testing
npx pnpm run test:e2e           # Run Playwright end-to-end tests

# Utility
npx pnpm run clean              # Delete dist/ folder
```

## Testing

### Overview

- **446 tests** across **59 test files**
- **Test runner**: Vitest with happy-dom environment
- **Component testing**: @open-wc/testing for Lit component fixtures
- **All tests pass** with TypeScript compiling cleanly

### Test Structure

| Category | Files | What is tested |
|---|---|---|
| Components | 42 | 41 of 42 UI components — rendering, events, properties, user interaction (swaggerx-app covered by E2E tests) |
| Core | 4 | Spec parsing (JSON/YAML), normalization, schema resolution, code generation |
| State | 5 | All stores — env, history, request, spec, UI state management |
| Middleware | 3 | Express middleware, Fastify plugin, shared HTML renderer |
| Utils | 5 | HTTP client, URL builder, env interpolator, localStorage helpers, markdown parser |

### Test Patterns

```typescript
// Component test pattern
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/shared/swaggerx-tabs.js';  // side-effect import registers element

const el = await fixture<SwaggerXTabs>(html`<swaggerx-tabs .tabs=${tabs}></swaggerx-tabs>`);
const result = el.shadowRoot!.querySelector('.tab-btn');
```

- Components are tested through their Shadow DOM (`el.shadowRoot!.querySelector()`)
- Events are tested by adding listeners before triggering clicks
- Properties are passed via Lit's `.prop=${value}` syntax in test fixtures
- Mocking uses `vi.mock()` and `vi.stubGlobal()` from Vitest
- Test fixtures are in `test/fixtures/` (e.g., `minimal-spec.json` — smallest valid OpenAPI spec)

### Running Specific Tests

```bash
npx pnpm test                                # All tests
npx vitest run test/unit/core/               # Core logic only
npx vitest run test/unit/components/request/  # Request components only
npx vitest run -t "parseSpec"                # Tests matching name pattern
npx pnpm run test:watch                      # Watch mode for development
```

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `pnpm: command not found` | pnpm not on system PATH | Use `npx pnpm` instead of `pnpm` |
| Blank page in browser | Node.js polyfills missing for swagger-parser | `vite-plugin-node-polyfills` is configured in vite.config.ts |
| "Module externalized for browser compatibility" warnings | swagger-parser uses Node built-ins (path, util) | Polyfills handle this; warnings are expected in dev mode |
| Can't access dev server from network | Vite binds to localhost by default | `server: { host: '0.0.0.0' }` is set in vite.config.ts |
| `types` condition not used in exports | `types` field placed after `import`/`require` in package.json | Put `types` first in each exports entry |
| TS5101 baseUrl deprecated | TypeScript 6+ deprecation | `ignoreDeprecations: "6.0"` is set in tsconfig.json |
| PostCSS/Tailwind conflict | Both `@tailwindcss/vite` and `tailwindcss` in postcss.config.js | Only `autoprefixer` should be in postcss.config.js |
| Vite can't resolve express/fastify | Framework packages imported at top level | Middleware uses `require()` at runtime, not ES `import` |
| "Lit is in dev mode" warning | Development build | Normal in dev; goes away in production build |
| "The language 'bash' has no grammar" | Prism.js components need global `Prism`, Vite ESM can't provide it | Use `?raw` imports + `new Function('Prism', src)(Prism)` — see `prism-highlight.ts` |
| Blank page when served via middleware behind proxy | Absolute asset paths lose proxy prefix | Middleware uses relative paths (`./swaggerx.css`) — already fixed |
| CSS/JS 404 when accessing `/docs` (no trailing slash) | Browser resolves `./swaggerx.css` against wrong directory | Middleware redirects `/docs` → `/docs/` (301) — already fixed |
| "No API Specification" with inline spec | `spec` property set before custom element is defined | Middleware uses `customElements.whenDefined()` before setting `spec` — already fixed |
| Code samples show URLs without server address | `baseUrl` is empty or relative | `code-gen.ts` falls back to `window.location.origin` — already fixed |
| `specUrl` fails behind proxy | Browser fetches spec from wrong host | Use inline `spec` option instead of `specUrl` in middleware config |
| Modal shows tooltip on hover | Using `title` property (native HTML tooltip) | Use `heading` property instead — already renamed |
| API Key query param not sent | Comment said "handled in URL builder" but nobody did it | Fixed: `http-client.ts` appends query param to URL before fetch |
| Auth fields not interpolated with env vars | `swaggerx-app.ts` passed `auth: state.auth` without interpolation | Fixed: all auth fields (token, username, password, apiKeyName, apiKeyValue) are now interpolated |
| History doesn't save/restore auth | Auth config was not included in history entries | Fixed: auth saved in history, restored on click, old entries reset to "No Auth" |
| Code samples missing auth/headers/body | Code samples were static, generated only from spec | Fixed: `generateCodeSamples()` now accepts `CodeGenOptions { auth, headers, userBody }` — code samples dynamically reflect request builder state |

## TypeScript Strictness

`tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` enabled. Unused parameters must be prefixed with `_` (e.g., `_e: Event`). The `ignoreDeprecations: "6.0"` flag is set for TS 6 compatibility with tsup's DTS generation.

## Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Frontend build — library mode (ES + UMD), Tailwind plugin, node polyfills, dev server host |
| `tsup.config.ts` | Middleware build — Express + Fastify entry points, CJS + ESM, type declarations |
| `tsconfig.json` | TypeScript — strict mode, ES2021 target, bundler resolution, declaration files |
| `vitest.config.ts` | Test runner — happy-dom environment, coverage via v8, path aliases |
| `tailwind.config.ts` | Tailwind — dark mode (class-based), HTTP method colors, custom fonts, `--sx-*` variables |
| `postcss.config.js` | CSS — autoprefixer only (Tailwind handled by Vite plugin) |
| `.eslintrc.cjs` | Linting — eslint:recommended + prettier integration |
| `.prettierrc` | Formatting — semicolons, single quotes, trailing commas, 100 char width |
