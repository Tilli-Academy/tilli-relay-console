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
  // Silence "import.meta is not available with cjs" warning.
  // The CJS path uses __dirname; import.meta.url is only reached in ESM.
  esbuildOptions(options, context) {
    if (context.format === 'cjs') {
      options.logOverride = {
        ...options.logOverride,
        'empty-import-meta': 'silent',
      };
    }
  },
});
