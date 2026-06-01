import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/code/swaggerx-code-samples.js';
import type { SwaggerXCodeSamples } from '../../../../src/components/code/swaggerx-code-samples.js';
import type { Endpoint } from '../../../../src/core/types.js';

function makeEndpoint(): Endpoint {
  return {
    id: 'GET:/pets',
    method: 'get',
    path: '/pets',
    summary: 'List pets',
    description: '',
    tags: ['pets'],
    deprecated: false,
    parameters: [],
    responses: {},
    security: [],
  };
}

describe('swaggerx-code-samples', () => {
  it('renders nothing when no endpoint', async () => {
    const el = await fixture<SwaggerXCodeSamples>(
      html`<swaggerx-code-samples></swaggerx-code-samples>`,
    );
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeNull();
  });

  it('renders tabs when endpoint is provided', async () => {
    const ep = makeEndpoint();
    const el = await fixture<SwaggerXCodeSamples>(
      html`<swaggerx-code-samples .endpoint=${ep} base-url="https://api.example.com"></swaggerx-code-samples>`,
    );
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeTruthy();
  });

  it('renders a code block for the active tab', async () => {
    const ep = makeEndpoint();
    const el = await fixture<SwaggerXCodeSamples>(
      html`<swaggerx-code-samples .endpoint=${ep} base-url="https://api.example.com"></swaggerx-code-samples>`,
    );
    const codeBlock = el.shadowRoot!.querySelector('swaggerx-code-block');
    expect(codeBlock).toBeTruthy();
  });
});
