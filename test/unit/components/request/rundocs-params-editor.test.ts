import { fixture, html } from '@open-wc/testing';
import { describe, it, expect } from 'vitest';
import '../../../../src/components/request/rundocs-params-editor.js';
import type { RunDocsParamsEditor } from '../../../../src/components/request/rundocs-params-editor.js';
import type { Parameter } from '../../../../src/core/types.js';

describe('rundocs-params-editor', () => {
  it('shows empty state when no parameters', async () => {
    const el = await fixture<RunDocsParamsEditor>(
      html`<rundocs-params-editor></rundocs-params-editor>`,
    );
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toContain('No parameters');
  });

  it('renders path parameters section', async () => {
    const params: Parameter[] = [
      { name: 'petId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID of pet' },
    ];
    const el = await fixture<RunDocsParamsEditor>(
      html`<rundocs-params-editor .parameters=${params}></rundocs-params-editor>`,
    );
    const labels = el.shadowRoot!.querySelectorAll('.section-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toContain('Path Parameters');
    const paramLabels = el.shadowRoot!.querySelectorAll('.param-label');
    expect(paramLabels.length).toBe(1);
    expect(paramLabels[0].textContent).toContain('petId');
  });

  it('renders query parameters section', async () => {
    const params: Parameter[] = [
      { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
      { name: 'offset', in: 'query', required: false, schema: { type: 'integer' } },
    ];
    const el = await fixture<RunDocsParamsEditor>(
      html`<rundocs-params-editor .parameters=${params}></rundocs-params-editor>`,
    );
    const labels = el.shadowRoot!.querySelectorAll('.section-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toContain('Query Parameters');
    const rows = el.shadowRoot!.querySelectorAll('.param-row');
    expect(rows.length).toBe(2);
  });

  it('renders both path and query parameter sections', async () => {
    const params: Parameter[] = [
      { name: 'petId', in: 'path', required: true, schema: { type: 'integer' } },
      { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
    ];
    const el = await fixture<RunDocsParamsEditor>(
      html`<rundocs-params-editor .parameters=${params}></rundocs-params-editor>`,
    );
    const labels = el.shadowRoot!.querySelectorAll('.section-label');
    expect(labels.length).toBe(2);
  });

  it('fires param-change on input', async () => {
    const params: Parameter[] = [
      { name: 'petId', in: 'path', required: true, schema: { type: 'integer' } },
    ];
    const el = await fixture<RunDocsParamsEditor>(
      html`<rundocs-params-editor .parameters=${params}></rundocs-params-editor>`,
    );
    let detail: { name: string; value: string; paramIn: string } | null = null;
    el.addEventListener('param-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new InputEvent('input'));
    expect(detail).toBeTruthy();
    expect(detail!.name).toBe('petId');
    expect(detail!.value).toBe('42');
    expect(detail!.paramIn).toBe('path');
  });
});
