import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/swaggerx-request-tabs.js';
import type { SwaggerXRequestTabs } from '../../../../src/components/request/swaggerx-request-tabs.js';

describe('swaggerx-request-tabs', () => {
  it('renders tabs component', async () => {
    const el = await fixture<SwaggerXRequestTabs>(
      html`<swaggerx-request-tabs></swaggerx-request-tabs>`,
    );
    const tabs = el.shadowRoot!.querySelector('swaggerx-tabs');
    expect(tabs).toBeTruthy();
  });

  it('renders params editor by default', async () => {
    const el = await fixture<SwaggerXRequestTabs>(
      html`<swaggerx-request-tabs></swaggerx-request-tabs>`,
    );
    const paramsEditor = el.shadowRoot!.querySelector('swaggerx-params-editor');
    expect(paramsEditor).toBeTruthy();
  });

  it('does not show body tab when hasBody is false', async () => {
    const el = await fixture<SwaggerXRequestTabs>(
      html`<swaggerx-request-tabs></swaggerx-request-tabs>`,
    );
    const bodyEditor = el.shadowRoot!.querySelector('swaggerx-body-editor');
    expect(bodyEditor).toBeNull();
  });
});
