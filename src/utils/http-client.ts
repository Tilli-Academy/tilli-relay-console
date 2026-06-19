import type { AuthConfig, ResponseState } from '../core/types.js';

export interface SendRequestOptions {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  auth: AuthConfig;
}

/**
 * Sends an HTTP request and returns a normalized ResponseState.
 * Adds auth headers based on the auth config.
 */
export async function sendRequest(options: SendRequestOptions): Promise<ResponseState> {
  const { method, url, headers, body, contentType, auth } = options;

  // Build final headers
  const finalHeaders: Record<string, string> = { ...headers };

  // Apply content-type for methods that have a body (matches code-gen behavior)
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  if (hasBody && contentType) {
    finalHeaders['Content-Type'] = contentType;
  }

  // Apply auth
  applyAuth(finalHeaders, auth);

  // Append API key to URL if auth type is apiKey with query location
  let finalUrl = url;
  if (auth.type === 'apiKey' && auth.apiKeyIn === 'query' && auth.apiKeyName && auth.apiKeyValue) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += `${separator}${encodeURIComponent(auth.apiKeyName)}=${encodeURIComponent(auth.apiKeyValue)}`;
  }

  const startTime = performance.now();

  try {
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: finalHeaders,
    };

    if (hasBody && body) {
      fetchOptions.body = body;
    }

    const response = await fetch(finalUrl, fetchOptions);
    const endTime = performance.now();

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const responseBody = await response.text();
    const responseContentType = response.headers.get('content-type') || 'text/plain';

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      contentType: responseContentType,
      time: Math.round(endTime - startTime),
      size: new Blob([responseBody]).size,
    };
  } catch (err) {
    const endTime = performance.now();
    const errorMessage =
      err instanceof TypeError && err.message.includes('fetch')
        ? 'Network error: The request failed. This may be a CORS issue. Ensure the API allows requests from this origin.'
        : err instanceof Error
          ? err.message
          : 'Request failed';

    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: errorMessage,
      contentType: 'text/plain',
      time: Math.round(endTime - startTime),
      size: 0,
    };
  }
}

function applyAuth(headers: Record<string, string>, auth: AuthConfig): void {
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
      if (auth.apiKeyName && auth.apiKeyValue) {
        if (auth.apiKeyIn === 'header') {
          headers[auth.apiKeyName] = auth.apiKeyValue;
        }
        // Query-based API keys are handled in URL builder
      }
      break;
    // 'none' and 'oauth2' — no automatic header
  }
}
