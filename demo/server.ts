/**
 * RunDocs Demo — Express Server
 *
 * Run:
 *   npx tsx demo/server.ts
 *
 * Then open http://localhost:3000/docs
 */
import express from 'express';
import { runDocs } from '../src/middleware/express.js';

const app = express();
const PORT = 3000;

// Serve RunDocs UI at /docs
app.use(
  '/docs',
  runDocs({
    specUrl: 'https://petstore3.swagger.io/api/v3/openapi.json',
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
