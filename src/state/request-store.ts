import type { RequestState, HttpMethod, AuthConfig, ResponseState } from '../core/types.js';

/**
 * Manages the state for a single API request being built.
 * Each endpoint gets its own RequestStore instance.
 */
export class RequestStore {
  private _state: RequestState;
  private _listeners = new Set<() => void>();

  constructor(method: HttpMethod = 'get', url = '') {
    this._state = {
      method,
      url,
      pathParams: {},
      queryParams: {},
      headers: {},
      body: '',
      contentType: 'application/json',
      auth: { type: 'none' },
      response: null,
      loading: false,
    };
  }

  get state(): RequestState {
    return this._state;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }

  setMethod(method: HttpMethod): void {
    this._state = { ...this._state, method };
    this._notify();
  }

  setUrl(url: string): void {
    this._state = { ...this._state, url };
    this._notify();
  }

  setPathParam(name: string, value: string): void {
    this._state = {
      ...this._state,
      pathParams: { ...this._state.pathParams, [name]: value },
    };
    this._notify();
  }

  setQueryParam(name: string, value: string): void {
    this._state = {
      ...this._state,
      queryParams: { ...this._state.queryParams, [name]: value },
    };
    this._notify();
  }

  setHeader(name: string, value: string): void {
    this._state = {
      ...this._state,
      headers: { ...this._state.headers, [name]: value },
    };
    this._notify();
  }

  removeHeader(name: string): void {
    const headers = { ...this._state.headers };
    delete headers[name];
    this._state = { ...this._state, headers };
    this._notify();
  }

  setBody(body: string): void {
    this._state = { ...this._state, body };
    this._notify();
  }

  setContentType(contentType: string): void {
    this._state = { ...this._state, contentType };
    this._notify();
  }

  setAuth(auth: AuthConfig): void {
    this._state = { ...this._state, auth };
    this._notify();
  }

  setLoading(loading: boolean): void {
    this._state = { ...this._state, loading };
    this._notify();
  }

  setResponse(response: ResponseState | null): void {
    this._state = { ...this._state, response, loading: false };
    this._notify();
  }

  reset(): void {
    this._state = {
      ...this._state,
      pathParams: {},
      queryParams: {},
      headers: {},
      body: '',
      auth: { type: 'none' },
      response: null,
      loading: false,
    };
    this._notify();
  }
}
