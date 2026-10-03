import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const DEFAULT_PORT = 3000;

/**
 * Start the local web server. Exported so it can be reused programmatically
 * while keeping the module importable without side effects (tests, tooling).
 */
export function startServer({ port = Number(process.env.PORT) || DEFAULT_PORT } = {}) {
  const app = createApp();
  const server = app.listen(port, () => {
    const { port: boundPort } = server.address();
    console.log(`Servidor UAFE disponible en http://localhost:${boundPort}`);
  });
  return server;
}

const isEntryPoint =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  startServer();
}
