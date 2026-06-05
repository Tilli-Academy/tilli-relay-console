import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/code/rundocs-code-samples.js';
import type { RunDocsCodeSamples } from '../../../../src/components/code/rundocs-code-samples.js';
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

describe('rundocs-code-samples', () => {
  it('renders nothing when no endpoint', async () => {
    const el = await fixture<RunDocsCodeSamples>(
      html`<rundocs-code-samples></rundocs-code-samples>`,
    );
    const tabs = el.shadowRoot!.querySelector('rundocs-tabs');
    expect(tabs).toBeNull();
  });

  it('renders tabs when endpoint is provided', async () => {
    const ep = makeEndpoint();
    const el = await fixture<RunDocsCodeSamples>(
      html`<rundocs-code-samples .endpoint=${ep} base-url="https://api.example.com"></rundocs-code-samples>`,
    );
    const tabs = el.shadowRoot!.querySelector('rundocs-tabs');
    expect(tabs).toBeTruthy();
  });

  it('renders a code block for the active tab', async () => {
    const ep = makeEndpoint();
    const el = await fixture<RunDocsCodeSamples>(
      html`<rundocs-code-samples .endpoint=${ep} base-url="https://api.example.com"></rundocs-code-samples>`,
    );
    const codeBlock = el.shadowRoot!.querySelector('rundocs-code-block');
    expect(codeBlock).toBeTruthy();
  });
});
