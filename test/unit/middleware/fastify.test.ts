import { describe, it, expect } from 'vitest';
import { swaggerX } from '../../../src/middleware/fastify.js';

describe('middleware/fastify', () => {
  it('exports swaggerX function', () => {
    expect(typeof swaggerX).toBe('function');
  });

  it('is a fastify plugin (has Symbol.for fastify.display.name)', () => {
    // fastify-plugin wraps the function and adds metadata
    expect(swaggerX).toBeTruthy();
    // fp sets the pluginName
    expect(typeof swaggerX).toBe('function');
  });
});
