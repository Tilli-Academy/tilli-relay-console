import type { Endpoint, RequestBodyDef, AuthConfig } from './types.js';
import { generateExample } from './schema-resolver.js';

export interface CodeGenOptions {
  auth?: AuthConfig;
  headers?: Record<string, string>;
  userBody?: string;
  /** Pre-resolved URL (path params substituted, env vars interpolated).
   *  When provided, baseUrl and endpoint.path are ignored for URL construction. */
  resolvedUrl?: string;
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

  let fullUrl: string;
  if (options.resolvedUrl) {
    fullUrl = options.resolvedUrl;
  } else {
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
    fullUrl = `${resolvedBase}${endpoint.path}`;
  }

  // Append API key to URL if auth type is apiKey with query location
  if (auth) {
    fullUrl = applyApiKeyToUrl(fullUrl, auth);
  }

  // Body: for POST/PUT/PATCH methods, always include a body in code samples
  // (even if empty) so curl shows -d.  Matches Swagger UI behaviour.
  const methodsWithBody = ['post', 'put', 'patch'];
  const body = methodsWithBody.includes(endpoint.method)
    ? (userBody || getExampleBody(endpoint.requestBody) || '')
    : null;

  // Build merged headers: auth headers first, then custom headers (can override)
  const mergedHeaders: Record<string, string> = {};
  if (auth) {
    Object.assign(mergedHeaders, buildAuthHeaders(auth));
  }
  if (customHeaders) {
    Object.assign(mergedHeaders, customHeaders);
  }

  const contentType = body !== null ? getContentType(endpoint.requestBody) : null;

  return {
    curl: generateCurl(endpoint, fullUrl, body, mergedHeaders, contentType),
    javascript: generateJavaScript(endpoint, fullUrl, body, mergedHeaders, contentType),
    python: generatePython(endpoint, fullUrl, body, mergedHeaders, contentType),
    nodejs: generateNodeJs(endpoint, fullUrl, body, mergedHeaders, contentType),
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

/** Determines the primary content type from the endpoint's requestBody. */
function getContentType(requestBody: RequestBodyDef | undefined): string {
  if (!requestBody?.content) return 'application/json';
  const types = Object.keys(requestBody.content);
  if (types.includes('application/json')) return 'application/json';
  if (types.includes('multipart/form-data')) return 'multipart/form-data';
  if (types.includes('application/x-www-form-urlencoded')) return 'application/x-www-form-urlencoded';
  return types[0] || 'application/json';
}

/** Escapes a string for embedding inside single-quoted shell arguments. */
function escapeShellSingleQuote(str: string): string {
  return str.replace(/'/g, "'\\''");
}

/** Escapes a string for embedding inside single-quoted JS/Python string literals. */
function escapeJsString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function generateCurl(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>, contentType: string | null): string {
  const method = endpoint.method.toUpperCase();
  const lines: string[] = [`curl -X ${method} '${escapeShellSingleQuote(url)}'`];

  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (body !== null && contentType && !allHeaders['Content-Type']) {
    if (contentType !== 'multipart/form-data') {
      allHeaders['Content-Type'] = contentType;
    }
  }
  if (!allHeaders['Accept']) {
    allHeaders['Accept'] = 'application/json';
  }

  for (const [key, value] of Object.entries(allHeaders)) {
    lines.push(`  -H '${escapeShellSingleQuote(key)}: ${escapeShellSingleQuote(value)}'`);
  }

  if (body !== null) {
    if (contentType === 'multipart/form-data') {
      lines.push(`  -F 'file=@/path/to/file'`);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      lines.push(`  --data-urlencode '${escapeShellSingleQuote(body)}'`);
    } else {
      lines.push(`  -d '${escapeShellSingleQuote(body)}'`);
    }
  }

  return lines.join(' \\\n');
}

function generateJavaScript(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>, contentType: string | null): string {
  const method = endpoint.method.toUpperCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';
  if (body !== null && contentType && !allHeaders['Content-Type']) {
    if (contentType !== 'multipart/form-data') {
      allHeaders['Content-Type'] = contentType;
    }
  }

  const lines: string[] = [];

  if (contentType === 'multipart/form-data' && body !== null) {
    lines.push(`const formData = new FormData();`);
    lines.push(`formData.append('file', fileInput.files[0]);`);
    lines.push(``);
  }

  lines.push(`const response = await fetch('${escapeJsString(url)}', {`);
  lines.push(`  method: '${method}',`);
  lines.push(`  headers: {`);
  for (const [key, value] of Object.entries(allHeaders)) {
    lines.push(`    '${escapeJsString(key)}': '${escapeJsString(value)}',`);
  }
  lines.push(`  },`);

  if (body !== null) {
    if (contentType === 'multipart/form-data') {
      lines.push(`  body: formData,`);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      lines.push(`  body: new URLSearchParams(${body}),`);
    } else {
      lines.push(`  body: JSON.stringify(${body}),`);
    }
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`const data = await response.json();`);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}

function generatePython(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>, contentType: string | null): string {
  const method = endpoint.method.toLowerCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';

  const headerEntries = Object.entries(allHeaders)
    .map(([k, v]) => `'${escapeJsString(k)}': '${escapeJsString(v)}'`)
    .join(', ');

  const lines: string[] = [];
  lines.push(`import requests`);
  lines.push(``);

  if (body !== null) {
    if (contentType === 'multipart/form-data') {
      lines.push(`files = {'file': open('/path/to/file', 'rb')}`);
      lines.push(``);
      lines.push(`response = requests.${method}(`);
      lines.push(`    '${escapeJsString(url)}',`);
      lines.push(`    files=files,`);
      lines.push(`    headers={${headerEntries}}`);
      lines.push(`)`);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      lines.push(`payload = ${body}`);
      lines.push(``);
      lines.push(`response = requests.${method}(`);
      lines.push(`    '${escapeJsString(url)}',`);
      lines.push(`    data=payload,`);
      lines.push(`    headers={${headerEntries}}`);
      lines.push(`)`);
    } else {
      lines.push(`payload = ${body}`);
      lines.push(``);
      lines.push(`response = requests.${method}(`);
      lines.push(`    '${escapeJsString(url)}',`);
      lines.push(`    json=payload,`);
      lines.push(`    headers={${headerEntries}}`);
      lines.push(`)`);
    }
  } else {
    lines.push(`response = requests.${method}(`);
    lines.push(`    '${escapeJsString(url)}',`);
    lines.push(`    headers={${headerEntries}}`);
    lines.push(`)`);
  }

  lines.push(``);
  lines.push(`print(response.json())`);

  return lines.join('\n');
}

function generateNodeJs(endpoint: Endpoint, url: string, body: string | null, extraHeaders: Record<string, string>, contentType: string | null): string {
  const method = endpoint.method.toUpperCase();
  const allHeaders: Record<string, string> = { ...extraHeaders };
  if (!allHeaders['Accept']) allHeaders['Accept'] = 'application/json';
  if (body !== null && contentType && !allHeaders['Content-Type']) {
    if (contentType !== 'multipart/form-data') {
      allHeaders['Content-Type'] = contentType;
    }
  }

  const lines: string[] = [];

  if (contentType === 'multipart/form-data' && body !== null) {
    lines.push(`const axios = require('axios');`);
    lines.push(`const FormData = require('form-data');`);
    lines.push(`const fs = require('fs');`);
    lines.push(``);
    lines.push(`const form = new FormData();`);
    lines.push(`form.append('file', fs.createReadStream('/path/to/file'));`);
    lines.push(``);
    lines.push(`const { data } = await axios({`);
    lines.push(`  method: '${method}',`);
    lines.push(`  url: '${escapeJsString(url)}',`);
    lines.push(`  headers: {`);
    for (const [key, value] of Object.entries(allHeaders)) {
      lines.push(`    '${escapeJsString(key)}': '${escapeJsString(value)}',`);
    }
    lines.push(`    ...form.getHeaders(),`);
    lines.push(`  },`);
    lines.push(`  data: form,`);
  } else {
    lines.push(`const axios = require('axios');`);
    lines.push(``);
    lines.push(`const { data } = await axios({`);
    lines.push(`  method: '${method}',`);
    lines.push(`  url: '${escapeJsString(url)}',`);
    lines.push(`  headers: {`);
    for (const [key, value] of Object.entries(allHeaders)) {
      lines.push(`    '${escapeJsString(key)}': '${escapeJsString(value)}',`);
    }
    lines.push(`  },`);
    if (body !== null) {
      lines.push(`  data: ${body},`);
    }
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}
