// vite-dev-server.js
// This is a standalone Vite development server that runs separately from the main server

import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startViteDevServer() {
  const vite = await createServer({
    root: path.resolve(__dirname, '../client'),
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        port: 5173,
        clientPort: 5173
      },
      proxy: {
        // Proxy API requests to the backend server
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    logLevel: 'info'
  });

  await vite.listen();
  console.log(`Vite dev server running at http://localhost:5173`);
  console.log(`API requests will be proxied to http://localhost:8080`);
}

startViteDevServer().catch(err => {
  console.error('Error starting Vite dev server:', err);
  process.exit(1);
}); 