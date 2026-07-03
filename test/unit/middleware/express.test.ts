import { describe, it, expect } from 'vitest';
import { runDocs } from '../../../src/middleware/express.js';

describe('middleware/express', () => {
  it('exports runDocs function', () => {
    expect(typeof runDocs).toBe('function');
  });

  it('returns a router with GET / handler', () => {
    const router = runDocs({ specUrl: '/openapi.json' });
    expect(router).toBeTruthy();
    // Express Router has a stack of layers
    expect(router.stack).toBeDefined();
    expect(router.stack.length).toBeGreaterThan(0);
  });

  it('accepts empty options', () => {
    const router = runDocs();
    expect(router).toBeTruthy();
  });
});
