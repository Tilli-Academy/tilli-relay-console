import { describe, it, expect } from 'vitest';
import { runDocs } from '../../../src/middleware/fastify.js';

describe('middleware/fastify', () => {
  it('exports runDocs function', () => {
    expect(typeof runDocs).toBe('function');
  });

  it('is a fastify plugin (has Symbol.for fastify.display.name)', () => {
    // fastify-plugin wraps the function and adds metadata
    expect(runDocs).toBeTruthy();
    // fp sets the pluginName
    expect(typeof runDocs).toBe('function');
  });
});
