import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../../../../src/components/endpoint/swaggerx-endpoint.js';
import type { SwaggerXEndpoint } from '../../../../src/components/endpoint/swaggerx-endpoint.js';
import type { Endpoint } from '../../../../src/core/types.js';

const sampleEndpoint: Endpoint = {
  id: 'GET:/pets/{petId}',
  method: 'get',
  path: '/pets/{petId}',
  summary: 'Get a pet by ID',
  description: 'Returns a single pet by its unique identifier.',
  tags: ['pets'],
  deprecated: false,
  operationId: 'getPet',
  parameters: [
    {
      name: 'petId',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: 'The pet ID',
    },
    {
      name: 'include',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: 'Fields to include',
    },
  ],
  responses: {
    '200': {
      description: 'A pet',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Buddy' },
            },
            required: ['id', 'name'],
          },
        },
      },
    },
    '404': {
      description: 'Pet not found',
    },
  },
  security: [],
};

describe('swaggerx-endpoint', () => {
  let el: SwaggerXEndpoint;

  beforeEach(async () => {
    el = await fixture<SwaggerXEndpoint>(html`
      <swaggerx-endpoint .endpoint=${sampleEndpoint}></swaggerx-endpoint>
    `);
  });

  it('renders the method badge', () => {
    const badge = el.shadowRoot!.querySelector('swaggerx-method-badge');
    expect(badge).toBeTruthy();
    expect(badge!.getAttribute('method')).toBe('get');
  });

  it('renders the path display', () => {
    const path = el.shadowRoot!.querySelector('swaggerx-path-display');
    expect(path).toBeTruthy();
    expect(path!.getAttribute('path')).toBe('/pets/{petId}');
  });

  it('renders the summary', () => {
    const summary = el.shadowRoot!.querySelector('.summary');
    expect(summary!.textContent).toBe('Get a pet by ID');
  });

  it('renders the operation ID', () => {
    const opId = el.shadowRoot!.querySelector('.operation-id');
    expect(opId!.textContent).toContain('getPet');
  });

  it('renders description', () => {
    const desc = el.shadowRoot!.querySelector('swaggerx-description');
    expect(desc).toBeTruthy();
  });

  it('renders parameters table', () => {
    const table = el.shadowRoot!.querySelector('.params-table');
    expect(table).toBeTruthy();

    const rows = table!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('renders parameter names', () => {
    const paramNames = el.shadowRoot!.querySelectorAll('.param-name');
    expect(paramNames.length).toBe(2);
    expect(paramNames[0].textContent).toBe('petId');
    expect(paramNames[1].textContent).toBe('include');
  });

  it('shows required indicator on required params', () => {
    const required = el.shadowRoot!.querySelectorAll('.param-required');
    expect(required.length).toBe(1); // petId is required
  });

  it('renders response sections in responses doc tab', async () => {
    // Switch to responses doc tab
    const tabs = el.shadowRoot!.querySelector('.docs-panel swaggerx-tabs') as HTMLElement;
    expect(tabs).toBeTruthy();
    const responsesTab = tabs.shadowRoot!.querySelector('button[aria-selected="false"]');
    // Find the "Responses" tab button
    const allTabBtns = tabs.shadowRoot!.querySelectorAll('button');
    const respBtn = Array.from(allTabBtns).find((b) => b.textContent?.includes('Responses'));
    expect(respBtn).toBeTruthy();
    respBtn!.click();
    await el.updateComplete;

    const responses = el.shadowRoot!.querySelectorAll('.response-item');
    expect(responses.length).toBe(2);
  });

  it('renders response status codes in responses doc tab', async () => {
    // Switch to responses doc tab
    const tabs = el.shadowRoot!.querySelector('.docs-panel swaggerx-tabs') as HTMLElement;
    const allTabBtns = tabs.shadowRoot!.querySelectorAll('button');
    const respBtn = Array.from(allTabBtns).find((b) => b.textContent?.includes('Responses'));
    respBtn!.click();
    await el.updateComplete;

    const codes = el.shadowRoot!.querySelectorAll('.response-code');
    expect(codes.length).toBe(2);
    expect(codes[0].textContent).toBe('200');
    expect(codes[1].textContent).toBe('404');
  });

  it('renders schema view for responses with content', async () => {
    // Switch to responses doc tab
    const tabs = el.shadowRoot!.querySelector('.docs-panel swaggerx-tabs') as HTMLElement;
    const allTabBtns = tabs.shadowRoot!.querySelectorAll('button');
    const respBtn = Array.from(allTabBtns).find((b) => b.textContent?.includes('Responses'));
    respBtn!.click();
    await el.updateComplete;

    const schemaViews = el.shadowRoot!.querySelectorAll('swaggerx-schema-view');
    // One for the 200 response (404 has no content)
    expect(schemaViews.length).toBeGreaterThanOrEqual(1);
  });

  it('renders tag badges in header', () => {
    const headerTags = el.shadowRoot!.querySelector('.header-tags');
    expect(headerTags).toBeTruthy();
    const badges = headerTags!.querySelectorAll('swaggerx-badge');
    const tagBadge = Array.from(badges).find((b) => b.textContent?.trim() === 'pets');
    expect(tagBadge).toBeTruthy();
  });

  it('renders nothing when endpoint is null', async () => {
    el = await fixture<SwaggerXEndpoint>(html`
      <swaggerx-endpoint></swaggerx-endpoint>
    `);
    const badge = el.shadowRoot!.querySelector('swaggerx-method-badge');
    expect(badge).toBeNull();
  });

  it('shows deprecated badge in header', async () => {
    const deprecatedEp = { ...sampleEndpoint, deprecated: true };
    el = await fixture<SwaggerXEndpoint>(html`
      <swaggerx-endpoint .endpoint=${deprecatedEp}></swaggerx-endpoint>
    `);
    const headerTags = el.shadowRoot!.querySelector('.header-tags');
    const badges = headerTags!.querySelectorAll('swaggerx-badge');
    const deprecatedBadge = Array.from(badges).find((b) => b.textContent?.trim() === 'Deprecated');
    expect(deprecatedBadge).toBeTruthy();
  });

  it('shows authenticated badge when security is set', async () => {
    const securedEp = { ...sampleEndpoint, security: [{ bearerAuth: [] }] };
    el = await fixture<SwaggerXEndpoint>(html`
      <swaggerx-endpoint .endpoint=${securedEp}></swaggerx-endpoint>
    `);
    const headerTags = el.shadowRoot!.querySelector('.header-tags');
    const badges = headerTags!.querySelectorAll('swaggerx-badge');
    const authBadge = Array.from(badges).find((b) => b.textContent?.trim() === 'Authenticated');
    expect(authBadge).toBeTruthy();
  });
});
