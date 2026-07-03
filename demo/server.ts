/**
 * RunDocs Demo — Express Server
 *
 * Run:
 *   npx pnpm run build          # must build first so dist/ assets exist
 *   npx tsx demo/server.ts
 *
 * Then open http://localhost:3000/docs
 */
import express from 'express';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runDocs } from '../src/middleware/express.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Load the bundled spec (same-origin, no CORS issues)
const spec = JSON.parse(
  readFileSync(resolve(__dirname, '../public/fakerest-spec.json'), 'utf-8'),
);

// Serve RunDocs UI at /docs
app.use(
  '/docs',
  runDocs({
    spec,
    title: 'RunDocs Demo',
  }),
);

// Sample API endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`RunDocs demo running at http://localhost:${PORT}/docs`);
});
