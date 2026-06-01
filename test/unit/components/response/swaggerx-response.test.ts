import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/response/swaggerx-response.js';
import type { SwaggerXResponse } from '../../../../src/components/response/swaggerx-response.js';
import type { ResponseState } from '../../../../src/core/types.js';

function makeResponse(overrides: Partial<ResponseState> = {}): ResponseState {
  return {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    body: '{"id":1}',
    contentType: 'application/json',
    time: 150,
    size: 8,
    ...overrides,
  };
}

describe('swaggerx-response', () => {
  it('renders nothing when no response', async () => {
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response></swaggerx-response>`,
    );
    const container = el.shadowRoot!.querySelector('.response-container');
    expect(container).toBeNull();
  });

  it('renders response container when response is provided', async () => {
    const resp = makeResponse();
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const container = el.shadowRoot!.querySelector('.response-container');
    expect(container).toBeTruthy();
  });

  it('shows response meta (status badge)', async () => {
    const resp = makeResponse();
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const meta = el.shadowRoot!.querySelector('swaggerx-response-meta');
    expect(meta).toBeTruthy();
  });

  it('shows tabs for Body and Headers', async () => {
    const resp = makeResponse();
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeTruthy();
  });

  it('shows response body by default', async () => {
    const resp = makeResponse();
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const body = el.shadowRoot!.querySelector('swaggerx-response-body');
    expect(body).toBeTruthy();
  });

  it('shows error body for status 0 (network error)', async () => {
    const resp = makeResponse({ status: 0, statusText: 'Error', body: 'Network error: CORS issue' });
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const errorBody = el.shadowRoot!.querySelector('.error-body');
    expect(errorBody).toBeTruthy();
    expect(errorBody!.textContent).toContain('Network error');
    // Should NOT show tabs for error responses
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeNull();
  });

  it('renders "Response" title', async () => {
    const resp = makeResponse();
    const el = await fixture<SwaggerXResponse>(
      html`<swaggerx-response .response=${resp}></swaggerx-response>`,
    );
    const title = el.shadowRoot!.querySelector('.response-title');
    expect(title).toBeTruthy();
    expect(title!.textContent).toContain('Response');
  });
});
