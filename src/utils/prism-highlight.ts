/**
 * Prism.js syntax highlighting wrapper.
 *
 * Replaces the regex-based syntax-highlight.ts with proper grammar-based
 * highlighting via Prism.js. Used for code samples and schema examples.
 *
 * Prism language component files are IIFEs that expect a global `Prism`.
 * Vite's module system can't resolve this, so we import them as raw text
 * via `?raw` and execute them with our Prism object in scope.
 *
 * After loading base grammars, we extend them with API-specific tokens
 * (fetch, console, axios, requests, flags, method calls) for richer
 * highlighting in code samples.
 */
import Prism from 'prismjs';

// Import component source as raw strings (Vite ?raw suffix)
// @ts-ignore — raw imports have no type declarations
import jsonSrc from 'prismjs/components/prism-json.js?raw';
// @ts-ignore
import bashSrc from 'prismjs/components/prism-bash.js?raw';
// @ts-ignore
import pythonSrc from 'prismjs/components/prism-python.js?raw';

// Execute each component file with Prism in scope.
// NOTE: `new Function()` is equivalent to eval() and will break under a
// strict Content Security Policy (CSP) that disallows 'unsafe-eval'.
// This is necessary because Prism grammar files are IIFEs that require a
// global `Prism` object, which Vite's ESM module system cannot provide.
// A future refactor should replace this with Prism's ESM-compatible imports.
[jsonSrc, bashSrc, pythonSrc].forEach((src: string) => {
  new Function('Prism', src)(Prism);
});

// javascript is built into Prism core — no registration needed

// --- Extend grammars with API-specific tokens ---

// Bash/cURL: color flags like -X, -H, -d, --header
Prism.languages.insertBefore('bash', 'variable', {
  'flag': /\s(-[A-Za-z]|--[a-z-]+)\b/,
  'http-method': /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/,
});

// JavaScript: color built-in objects and method calls
Prism.languages.insertBefore('javascript', 'keyword', {
  'builtin': /\b(fetch|console|JSON|require|axios|Response|Promise)\b/,
  'method-call': {
    pattern: /\.(log|stringify|json|parse|then|catch|get|post|put|patch|delete)\b/,
    inside: {
      'punctuation': /^\./,
      'function': /[\w]+/,
    },
  },
});

// Python: color built-in modules, functions, and method calls
Prism.languages.insertBefore('python', 'keyword', {
  'builtin': /\b(requests|response|print|len|range|type|str|int|float|list|dict|set|tuple|open|input)\b/,
  'method-call': {
    pattern: /\.(get|post|put|patch|delete|json|text|status_code|headers|content)\b/,
    inside: {
      'punctuation': /^\./,
      'function': /[\w]+/,
    },
  },
});

/**
 * Highlights JSON code using Prism.js.
 */
export function highlightJson(json: string): string {
  return Prism.highlight(json, Prism.languages.json, 'json');
}

/**
 * Highlights code based on language.
 * Returns highlighted HTML string, or null if unsupported.
 */
export function highlightCode(code: string, language: string): string | null {
  switch (language) {
    case 'json':
      return Prism.highlight(code, Prism.languages.json, 'json');
    case 'curl':
      return Prism.highlight(code, Prism.languages.bash, 'bash');
    case 'javascript':
    case 'nodejs':
      return Prism.highlight(code, Prism.languages.javascript, 'javascript');
    case 'python':
      return Prism.highlight(code, Prism.languages.python, 'python');
    default:
      return null;
  }
}
