import { describe, it, expect } from 'vitest';
import { swaggerX } from '../../../src/middleware/express.js';

describe('middleware/express', () => {
  it('exports swaggerX function', () => {
    expect(typeof swaggerX).toBe('function');
  });

  it('returns a router with GET / handler', () => {
    const router = swaggerX({ specUrl: '/openapi.json' });
    expect(router).toBeTruthy();
    // Express Router has a stack of layers
    expect(router.stack).toBeDefined();
    expect(router.stack.length).toBeGreaterThan(0);
  });

  it('accepts empty options', () => {
    const router = swaggerX();
    expect(router).toBeTruthy();
  });
});
