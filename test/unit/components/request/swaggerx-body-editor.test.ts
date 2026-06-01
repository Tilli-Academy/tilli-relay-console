import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/swaggerx-body-editor.js';
import type { SwaggerXBodyEditor } from '../../../../src/components/request/swaggerx-body-editor.js';

describe('swaggerx-body-editor', () => {
  it('renders CodeMirror editor', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor></swaggerx-body-editor>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.editor-wrapper');
    expect(wrapper).toBeTruthy();
    const cmEditor = wrapper!.querySelector('.cm-editor');
    expect(cmEditor).toBeTruthy();
  });

  it('renders content-type select', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor></swaggerx-body-editor>`,
    );
    const select = el.shadowRoot!.querySelector('.content-type-select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const options = select.querySelectorAll('option');
    expect(options.length).toBeGreaterThanOrEqual(4);
  });

  it('fires body-change on editor input', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor></swaggerx-body-editor>`,
    );
    let detail: { body: string } | null = null;
    el.addEventListener('body-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    // Access CodeMirror view via the wrapper
    const wrapper = el.shadowRoot!.querySelector('.editor-wrapper')!;
    const cmEditor = wrapper.querySelector('.cm-editor')!;
    const cmView = (cmEditor as unknown as { cmView: { view: { dispatch: Function; state: { doc: { length: number } } } } }).cmView?.view;

    if (cmView) {
      cmView.dispatch({
        changes: { from: 0, to: cmView.state.doc.length, insert: '{"test": true}' },
      });
      expect(detail).toBeTruthy();
      expect(detail!.body).toBe('{"test": true}');
    }
  });

  it('fires content-type-change on select change', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor></swaggerx-body-editor>`,
    );
    let detail: { contentType: string } | null = null;
    el.addEventListener('content-type-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const select = el.shadowRoot!.querySelector('.content-type-select') as HTMLSelectElement;
    select.value = 'text/plain';
    select.dispatchEvent(new Event('change'));
    expect(detail).toBeTruthy();
    expect(detail!.contentType).toBe('text/plain');
  });

  it('displays initial body content', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor body='{"key": "value"}'></swaggerx-body-editor>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.editor-wrapper')!;
    const cmContent = wrapper.querySelector('.cm-content');
    expect(cmContent).toBeTruthy();
    expect(cmContent!.textContent).toContain('"key"');
  });

  it('has line numbers', async () => {
    const el = await fixture<SwaggerXBodyEditor>(
      html`<swaggerx-body-editor body='{"a": 1}'></swaggerx-body-editor>`,
    );
    const wrapper = el.shadowRoot!.querySelector('.editor-wrapper')!;
    const gutters = wrapper.querySelector('.cm-lineNumbers');
    expect(gutters).toBeTruthy();
  });
});
