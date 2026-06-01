import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    tailwindcss(),
    nodePolyfills({
      include: ['path', 'util', 'buffer', 'process'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SwaggerX',
      fileName: (format) => {
        if (format === 'es') return 'swaggerx.es.js';
        if (format === 'umd') return 'swaggerx.js';
        return `swaggerx.${format}.js`;
      },
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        // Server frameworks (users provide these)
        'express', 'fastify', 'fastify-plugin', '@fastify/static',
      ],
    },
    outDir: 'dist',
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
