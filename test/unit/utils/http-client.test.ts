import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AuthConfig } from '../../../src/core/types.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock performance.now
let timeNow = 0;
vi.stubGlobal('performance', { now: () => timeNow });

// Mock Blob
vi.stubGlobal(
  'Blob',
  class {
    size: number;
    constructor(parts: string[]) {
      this.size = parts[0]?.length ?? 0;
    }
  },
);

// Import after mocks are set up
const { sendRequest } = await import('../../../src/utils/http-client.js');

function mockResponse(
  body: string,
  status = 200,
  statusText = 'OK',
  headers: Record<string, string> = {},
) {
  const headersMap = new Map(Object.entries(headers));
  return {
    status,
    statusText,
    headers: {
      forEach: (cb: (value: string, key: string) => void) =>
        headersMap.forEach((v, k) => cb(v, k)),
      get: (key: string) => headersMap.get(key) ?? null,
    },
    text: () => Promise.resolve(body),
  };
}

function defaultOptions(overrides: Record<string, unknown> = {}) {
  return {
    method: 'GET',
    url: 'https://api.example.com/pets',
    headers: {} as Record<string, string>,
    body: '',
    contentType: 'application/json',
    auth: { type: 'none' } as AuthConfig,
    ...overrides,
  };
}

describe('sendRequest', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    timeNow = 0;
  });

  it('sends GET request with correct method and URL', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(defaultOptions());

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/pets');
    expect(init.method).toBe('GET');
  });

  it('does NOT attach body for GET requests', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(defaultOptions({ body: '{"ignored": true}' }));

    const [, init] = mockFetch.mock.calls[0];
    expect(init.body).toBeUndefined();
  });

  it('sends POST request with body and Content-Type', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        method: 'POST',
        body: '{"name":"Buddy"}',
        contentType: 'application/json',
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"name":"Buddy"}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('does NOT send Content-Type if body is empty', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        method: 'POST',
        body: '',
        contentType: 'application/json',
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('returns ResponseState with status, statusText, headers, body, time, size', async () => {
    timeNow = 100;
    mockFetch.mockImplementation(async () => {
      timeNow = 250;
      return mockResponse('{"id":1}', 200, 'OK', { 'content-type': 'application/json' });
    });

    const result = await sendRequest(defaultOptions());

    expect(result.status).toBe(200);
    expect(result.statusText).toBe('OK');
    expect(result.headers['content-type']).toBe('application/json');
    expect(result.body).toBe('{"id":1}');
    expect(result.time).toBe(150);
    expect(result.size).toBe(8);
  });

  it('applies Bearer auth header', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        auth: { type: 'bearer', token: 'my-token' } as AuthConfig,
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer my-token');
  });

  it('applies Basic auth header', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        auth: { type: 'basic', username: 'user', password: 'pass' } as AuthConfig,
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const expected = `Basic ${btoa('user:pass')}`;
    expect(init.headers['Authorization']).toBe(expected);
  });

  it('applies API Key in header', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        auth: {
          type: 'apiKey',
          apiKeyName: 'X-API-Key',
          apiKeyValue: 'secret123',
          apiKeyIn: 'header',
        } as AuthConfig,
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['X-API-Key']).toBe('secret123');
  });

  it('does not apply API Key in query (handled by url-builder)', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(
      defaultOptions({
        auth: {
          type: 'apiKey',
          apiKeyName: 'api_key',
          apiKeyValue: 'secret123',
          apiKeyIn: 'query',
        } as AuthConfig,
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['api_key']).toBeUndefined();
  });

  it('handles fetch TypeError (network/CORS error)', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await sendRequest(defaultOptions());

    expect(result.status).toBe(0);
    expect(result.statusText).toBe('Error');
    expect(result.body).toContain('Network error');
    expect(result.body).toContain('CORS');
  });

  it('handles generic errors', async () => {
    mockFetch.mockRejectedValue(new Error('Something went wrong'));

    const result = await sendRequest(defaultOptions());

    expect(result.status).toBe(0);
    expect(result.statusText).toBe('Error');
    expect(result.body).toBe('Something went wrong');
  });

  it('returns status 0 on fetch error', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await sendRequest(defaultOptions());

    expect(result.status).toBe(0);
  });

  it('calculates response time from performance.now difference', async () => {
    timeNow = 1000;
    mockFetch.mockImplementation(async () => {
      timeNow = 1350;
      return mockResponse('ok');
    });

    const result = await sendRequest(defaultOptions());

    expect(result.time).toBe(350);
  });

  it('does not add Authorization header for none auth type', async () => {
    mockFetch.mockResolvedValue(mockResponse(''));
    await sendRequest(defaultOptions());

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBeUndefined();
  });
});
