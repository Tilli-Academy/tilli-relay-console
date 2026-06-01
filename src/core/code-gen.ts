import type { Endpoint, RequestBodyDef } from './types.js';
import { generateExample } from './schema-resolver.js';

/**
 * Generates code samples for an endpoint in multiple languages.
 */
export function generateCodeSamples(
  endpoint: Endpoint,
  baseUrl: string,
): Record<string, string> {
  // If baseUrl is empty or relative, use the current page's origin
  // so code samples have a full, copy-paste-ready URL
  let resolvedBase = baseUrl;
  if (!resolvedBase || resolvedBase === '/' || !resolvedBase.startsWith('http')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      resolvedBase = window.location.origin;
    }
  }
  // Remove trailing slash to avoid double slashes
  resolvedBase = resolvedBase.replace(/\/$/, '');
  const fullUrl = `${resolvedBase}${endpoint.path}`;
  const body = getExampleBody(endpoint.requestBody);

  return {
    curl: generateCurl(endpoint, fullUrl, body),
    javascript: generateJavaScript(endpoint, fullUrl, body),
    python: generatePython(endpoint, fullUrl, body),
    nodejs: generateNodeJs(endpoint, fullUrl, body),
  };
}

function getExampleBody(requestBody: RequestBodyDef | undefined): string | null {
  if (!requestBody?.content) return null;

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent?.schema) return null;

  const example = generateExample(jsonContent.schema);
  return JSON.stringify(example, null, 2);
}

function generateCurl(endpoint: Endpoint, url: string, body: string | null): string {
  const method = endpoint.method.toUpperCase();
  const lines: string[] = [`curl -X ${method} '${url}'`];

  // Add content-type header if there's a body
  if (body) {
    lines.push(`  -H 'Content-Type: application/json'`);
  }

  // Add common headers
  lines.push(`  -H 'Accept: application/json'`);

  // Add body
  if (body) {
    lines.push(`  -d '${body}'`);
  }

  return lines.join(' \\\n');
}

function generateJavaScript(endpoint: Endpoint, url: string, body: string | null): string {
  const method = endpoint.method.toUpperCase();
  const lines: string[] = [];

  lines.push(`const response = await fetch('${url}', {`);
  lines.push(`  method: '${method}',`);
  lines.push(`  headers: {`);
  lines.push(`    'Accept': 'application/json',`);
  if (body) {
    lines.push(`    'Content-Type': 'application/json',`);
  }
  lines.push(`  },`);

  if (body) {
    lines.push(`  body: JSON.stringify(${body}),`);
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`const data = await response.json();`);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}

function generatePython(endpoint: Endpoint, url: string, body: string | null): string {
  const method = endpoint.method.toLowerCase();
  const lines: string[] = [];

  lines.push(`import requests`);
  lines.push(``);

  if (body) {
    lines.push(`payload = ${body}`);
    lines.push(``);
    lines.push(`response = requests.${method}(`);
    lines.push(`    '${url}',`);
    lines.push(`    json=payload,`);
    lines.push(`    headers={'Accept': 'application/json'}`);
    lines.push(`)`);
  } else {
    lines.push(`response = requests.${method}(`);
    lines.push(`    '${url}',`);
    lines.push(`    headers={'Accept': 'application/json'}`);
    lines.push(`)`);
  }

  lines.push(``);
  lines.push(`print(response.json())`);

  return lines.join('\n');
}

function generateNodeJs(endpoint: Endpoint, url: string, body: string | null): string {
  const method = endpoint.method.toUpperCase();
  const lines: string[] = [];

  lines.push(`const axios = require('axios');`);
  lines.push(``);

  if (body) {
    lines.push(`const { data } = await axios({`);
    lines.push(`  method: '${method}',`);
    lines.push(`  url: '${url}',`);
    lines.push(`  headers: {`);
    lines.push(`    'Accept': 'application/json',`);
    lines.push(`    'Content-Type': 'application/json',`);
    lines.push(`  },`);
    lines.push(`  data: ${body},`);
    lines.push(`});`);
  } else {
    lines.push(`const { data } = await axios({`);
    lines.push(`  method: '${method}',`);
    lines.push(`  url: '${url}',`);
    lines.push(`  headers: { 'Accept': 'application/json' },`);
    lines.push(`});`);
  }

  lines.push(``);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}
