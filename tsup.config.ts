import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'middleware/express': 'src/middleware/express.ts',
    'middleware/fastify': 'src/middleware/fastify.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  external: [
    'express',
    'fastify',
    '@fastify/static',
    'fastify-plugin',
    // Node.js built-ins
    'path',
    'url',
    'fs',
  ],
  outDir: 'dist',
  clean: false,
});
