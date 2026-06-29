import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const distCjsExpress = resolve(__dirname, '../../../dist/middleware/express.cjs');
const distCjsFastify = resolve(__dirname, '../../../dist/middleware/fastify.cjs');

describe('CJS middleware build compatibility', () => {
  it('dist/middleware/express.cjs exists', () => {
    expect(existsSync(distCjsExpress)).toBe(true);
  });

  it('dist/middleware/fastify.cjs exists', () => {
    expect(existsSync(distCjsFastify)).toBe(true);
  });

  it('express.cjs can be required without crashing', () => {
    // This catches the createRequire(import.meta.url) bug —
    // in CJS, import.meta.url is undefined, so createRequire throws
    // ERR_INVALID_ARG_VALUE. The fix uses globalThis.require when available.
    const result = execSync(
      `node -e "require('${distCjsExpress.replace(/'/g, "\\'")}')"`,
      { encoding: 'utf-8', timeout: 10000 },
    );
    // If we get here without throwing, the require succeeded
    expect(result).toBeDefined();
  });

  it('fastify.cjs can be required without crashing', () => {
    const result = execSync(
      `node -e "require('${distCjsFastify.replace(/'/g, "\\'")}')"`,
      { encoding: 'utf-8', timeout: 10000 },
    );
    expect(result).toBeDefined();
  });
});
