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
      name: 'RunDocs',
      fileName: (format) => {
        if (format === 'es') return 'rundocs.es.js';
        if (format === 'umd') return 'rundocs.js';
        return `rundocs.${format}.js`;
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
