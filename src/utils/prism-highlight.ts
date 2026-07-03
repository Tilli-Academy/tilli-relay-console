/**
 * Prism.js syntax highlighting wrapper.
 *
 * Used for code samples and schema examples. Grammars are imported as
 * standard ES side-effect modules — CSP-safe (no eval/new Function).
 *
 * After loading base grammars, we extend them with API-specific tokens
 * (fetch, console, axios, requests, flags, method calls) for richer
 * highlighting in code samples.
 */
import Prism from 'prismjs';

// Import grammar components as side-effect modules — CSP-safe.
// prismjs sets window.Prism during its initialization, so these
// component IIFEs find the global Prism object and add their grammars.
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-python.js';

// javascript is built into Prism core — no registration needed

// --- Extend grammars with API-specific tokens ---

// Bash/cURL: color flags like -X, -H, -d, --header
if (Prism.languages.bash) {
  Prism.languages.insertBefore('bash', 'variable', {
    flag: /\s(-[A-Za-z]|--[a-z-]+)\b/,
    'http-method': /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/,
  });
}

// JavaScript: color built-in objects and method calls
if (Prism.languages.javascript) {
  Prism.languages.insertBefore('javascript', 'keyword', {
    builtin: /\b(fetch|console|JSON|require|axios|Response|Promise)\b/,
    'method-call': {
      pattern: /\.(log|stringify|json|parse|then|catch|get|post|put|patch|delete)\b/,
      inside: {
        punctuation: /^\./,
        function: /[\w]+/,
      },
    },
  });
}

// Python: color built-in modules, functions, and method calls
if (Prism.languages.python) {
  Prism.languages.insertBefore('python', 'keyword', {
    builtin:
      /\b(requests|response|print|len|range|type|str|int|float|list|dict|set|tuple|open|input)\b/,
    'method-call': {
      pattern: /\.(get|post|put|patch|delete|json|text|status_code|headers|content)\b/,
      inside: {
        punctuation: /^\./,
        function: /[\w]+/,
      },
    },
  });
}

/**
 * Highlights JSON code using Prism.js.
 */
export function highlightJson(json: string): string {
  if (!Prism.languages.json) return json;
  return Prism.highlight(json, Prism.languages.json, 'json');
}

/**
 * Highlights code based on language.
 * Returns highlighted HTML string, or null if unsupported.
 */
export function highlightCode(code: string, language: string): string | null {
  switch (language) {
    case 'json':
      return Prism.languages.json ? Prism.highlight(code, Prism.languages.json, 'json') : null;
    case 'curl':
      return Prism.languages.bash ? Prism.highlight(code, Prism.languages.bash, 'bash') : null;
    case 'javascript':
    case 'nodejs':
      return Prism.languages.javascript
        ? Prism.highlight(code, Prism.languages.javascript, 'javascript')
        : null;
    case 'python':
      return Prism.languages.python
        ? Prism.highlight(code, Prism.languages.python, 'python')
        : null;
    default:
      return null;
  }
}
