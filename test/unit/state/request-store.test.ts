import { describe, it, expect, vi } from 'vitest';
import { RequestStore } from '../../../src/state/request-store.js';

describe('RequestStore', () => {
  it('initializes with default state', () => {
    const store = new RequestStore();

    expect(store.state.method).toBe('get');
    expect(store.state.url).toBe('');
    expect(store.state.pathParams).toEqual({});
    expect(store.state.queryParams).toEqual({});
    expect(store.state.headers).toEqual({});
    expect(store.state.body).toBe('');
    expect(store.state.contentType).toBe('application/json');
    expect(store.state.auth.type).toBe('none');
    expect(store.state.response).toBeNull();
    expect(store.state.loading).toBe(false);
  });

  it('initializes with custom method and url', () => {
    const store = new RequestStore('post', 'https://api.example.com/pets');

    expect(store.state.method).toBe('post');
    expect(store.state.url).toBe('https://api.example.com/pets');
  });

  it('sets method', () => {
    const store = new RequestStore();
    store.setMethod('post');
    expect(store.state.method).toBe('post');
  });

  it('sets url', () => {
    const store = new RequestStore();
    store.setUrl('https://api.example.com');
    expect(store.state.url).toBe('https://api.example.com');
  });

  it('sets path param', () => {
    const store = new RequestStore();
    store.setPathParam('petId', '123');
    expect(store.state.pathParams).toEqual({ petId: '123' });
  });

  it('sets query param', () => {
    const store = new RequestStore();
    store.setQueryParam('limit', '10');
    expect(store.state.queryParams).toEqual({ limit: '10' });
  });

  it('sets header', () => {
    const store = new RequestStore();
    store.setHeader('Authorization', 'Bearer token');
    expect(store.state.headers).toEqual({ Authorization: 'Bearer token' });
  });

  it('removes header', () => {
    const store = new RequestStore();
    store.setHeader('Authorization', 'Bearer token');
    store.setHeader('Accept', 'application/json');
    store.removeHeader('Authorization');

    expect(store.state.headers).toEqual({ Accept: 'application/json' });
  });

  it('sets body', () => {
    const store = new RequestStore();
    store.setBody('{"name": "Buddy"}');
    expect(store.state.body).toBe('{"name": "Buddy"}');
  });

  it('sets content type', () => {
    const store = new RequestStore();
    store.setContentType('text/xml');
    expect(store.state.contentType).toBe('text/xml');
  });

  it('sets auth config', () => {
    const store = new RequestStore();
    store.setAuth({ type: 'bearer', token: 'my-token' });
    expect(store.state.auth).toEqual({ type: 'bearer', token: 'my-token' });
  });

  it('sets loading state', () => {
    const store = new RequestStore();
    store.setLoading(true);
    expect(store.state.loading).toBe(true);
  });

  it('sets response and clears loading', () => {
    const store = new RequestStore();
    store.setLoading(true);

    const response = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: '{"id": 1}',
      contentType: 'application/json',
      time: 150,
      size: 10,
    };
    store.setResponse(response);

    expect(store.state.response).toEqual(response);
    expect(store.state.loading).toBe(false);
  });

  it('resets to initial state preserving method and url', () => {
    const store = new RequestStore('post', 'https://api.example.com');
    store.setHeader('Authorization', 'Bearer token');
    store.setBody('{"name": "Buddy"}');
    store.setLoading(true);

    store.reset();

    expect(store.state.method).toBe('post');
    expect(store.state.url).toBe('https://api.example.com');
    expect(store.state.headers).toEqual({});
    expect(store.state.body).toBe('');
    expect(store.state.loading).toBe(false);
    expect(store.state.response).toBeNull();
  });

  it('notifies listeners on state change', () => {
    const store = new RequestStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.setMethod('post');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listener', () => {
    const store = new RequestStore();
    const listener = vi.fn();

    const unsub = store.subscribe(listener);
    unsub();
    store.setMethod('post');

    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies multiple listeners', () => {
    const store = new RequestStore();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    store.subscribe(listener1);
    store.subscribe(listener2);
    store.setUrl('https://test.com');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
