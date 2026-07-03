import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/rundocs-request-tabs.js';
import type { RunDocsRequestTabs } from '../../../../src/components/request/rundocs-request-tabs.js';

describe('rundocs-request-tabs', () => {
  it('renders tabs component', async () => {
    const el = await fixture<RunDocsRequestTabs>(
      html`<rundocs-request-tabs></rundocs-request-tabs>`,
    );
    const tabs = el.shadowRoot!.querySelector('rundocs-tabs');
    expect(tabs).toBeTruthy();
  });

  it('renders params editor by default', async () => {
    const el = await fixture<RunDocsRequestTabs>(
      html`<rundocs-request-tabs></rundocs-request-tabs>`,
    );
    const paramsEditor = el.shadowRoot!.querySelector('rundocs-params-editor');
    expect(paramsEditor).toBeTruthy();
  });

  it('does not show body tab when hasBody is false', async () => {
    const el = await fixture<RunDocsRequestTabs>(
      html`<rundocs-request-tabs></rundocs-request-tabs>`,
    );
    const bodyEditor = el.shadowRoot!.querySelector('rundocs-body-editor');
    expect(bodyEditor).toBeNull();
  });
});
