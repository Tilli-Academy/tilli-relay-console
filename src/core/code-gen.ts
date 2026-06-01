import type { Endpoint, RequestBodyDef, AuthConfig } from './types.js';
import { generateExample } from './schema-resolver.js';

export interface CodeGenOptions {
  auth?: AuthConfig;
  headers?: Record<string, string>;
  userBody?: string;
}

/**
 * Generates code samples for an endpoint in multiple languages.
 */
export function generateCodeSamples(
  endpoint: Endpoint,
  baseUrl: string,
  options: CodeGenOptions = {},
): Record<string, string> {
  const { auth, headers: customHeaders, userBody } = options;

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
  let fullUrl = `${resolvedBase}${endpoint.path}`;

  // Append API key to URL if auth type is apiKey with query location
  if (auth) {
    fullUrl = applyApiKeyToUrl(fullUrl, auth);
  }

  // Body: user body takes precedence, then spec example
  const body = userBody?.trim() ? userBody : getExampleBody(endpoint.requestBody);

  // Build merged headers: auth headers first, then custom headers (can override)
  const mergedHeaders: Record<string, string> = {};
  if (auth) {
    Object.assign(mergedHeaders, buildAuthHeaders(auth));
  }
  if (customHeaders) {
    Object.assign(mergedHeaders, customHeaders);
  }

  return {
    curl: generateCurl(endpoint, fullUrl, body, mergedHeaders),
    javascript: generateJavaScript(endpoint, fullUrl, body, mergedHeaders),
    python: generatePython(endpoint, fullUrl, body, mergedHeaders),
    nodejs: generateNodeJs(endpoint, fullUrl, body, mergedHeaders),
  };
}

function buildAuthHeaders(auth: AuthConfig): Record<string, string> {
  const headers: Record<string, string> = {};
  switch (auth.type) {
    case 'bearer':
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }
      break;
    case 'basic':
      if (auth.username) {
        const encoded = btoa(`${auth.username}:${auth.password || ''}`);
        headers['Authorization'] = `Basic ${encoded}`;
      }
      break;
    case 'apiKey':
      if (auth.apiKeyName && auth.apiKeyValue && auth.apiKeyIn === 'header') {
        headers[auth.apiKeyName] = auth.apiKeyValue;
      }
      break;
    case 'oauth2':
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }
      break;
  }
  return headers;
}

function applyApiKeyToUrl(url: string, auth: AuthConfig): string {
  if (auth.type === 'apiKey' && auth.apiKeyIn === 'query' && auth.apiKeyName && auth.apiKeyValue) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(auth.apiKeyName)}=${encodeURIComponent(auth.apiKeyValue)}`;
  }
  return url;
}

function getExampleBody(requestBody: RequestBodyDef | undefined): string | null {
  if (!requestBody?.content) return null;

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent?.schema) return null;

  const example = generateExample(jsonContent.schema);
  return JSON.stringify(example, null, 2);
}

function generateCurl(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>): string {
  const method = endpoint.method.toUpperCase();
  const lines: string[] = [`curl -X ${method} '${url}'`];

  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (body && !allHeaders['Content-Type']) {
    allHeaders['Content-Type'] = 'application/json';
  }
  if (!allHeaders['Accept']) {
    allHeaders['Accept'] = 'application/json';
  }

  for (const [key, value] of Object.entries(allHeaders)) {
    lines.push(`  -H '${key}: ${value}'`);
  }

  if (body) {
    lines.push(`  -d '${body}'`);
  }

  return lines.join(' \\\n');
}

function generateJavaScript(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>): string {
  const method = endpoint.method.toUpperCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';
  if (body && !allHeaders['Content-Type']) allHeaders['Content-Type'] = 'application/json';

  const lines: string[] = [];
  lines.push(`const response = await fetch('${url}', {`);
  lines.push(`  method: '${method}',`);
  lines.push(`  headers: {`);
  for (const [key, value] of Object.entries(allHeaders)) {
    lines.push(`    '${key}': '${value}',`);
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

function generatePython(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>): string {
  const method = endpoint.method.toLowerCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';

  const headerEntries = Object.entries(allHeaders)
    .map(([k, v]) => `'${k}': '${v}'`)
    .join(', ');

  const lines: string[] = [];
  lines.push(`import requests`);
  lines.push(``);

  if (body) {
    lines.push(`payload = ${body}`);
    lines.push(``);
    lines.push(`response = requests.${method}(`);
    lines.push(`    '${url}',`);
    lines.push(`    json=payload,`);
    lines.push(`    headers={${headerEntries}}`);
    lines.push(`)`);
  } else {
    lines.push(`response = requests.${method}(`);
    lines.push(`    '${url}',`);
    lines.push(`    headers={${headerEntries}}`);
    lines.push(`)`);
  }

  lines.push(``);
  lines.push(`print(response.json())`);

  return lines.join('\n');
}

function generateNodeJs(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>): string {
  const method = endpoint.method.toUpperCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';
  if (body && !allHeaders['Content-Type']) allHeaders['Content-Type'] = 'application/json';

  const lines: string[] = [];
  lines.push(`const axios = require('axios');`);
  lines.push(``);
  lines.push(`const { data } = await axios({`);
  lines.push(`  method: '${method}',`);
  lines.push(`  url: '${url}',`);
  lines.push(`  headers: {`);
  for (const [key, value] of Object.entries(allHeaders)) {
    lines.push(`    '${key}': '${value}',`);
  }
  lines.push(`  },`);
  if (body) {
    lines.push(`  data: ${body},`);
  }
  lines.push(`});`);
  lines.push(``);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}
