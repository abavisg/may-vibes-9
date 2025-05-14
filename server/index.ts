import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for API routes when in development mode
if (process.env.NODE_ENV === 'development') {
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const root = process.cwd();

  if (process.env.NODE_ENV === 'development') {
    // Use Vite's development server middleware with explicit server configuration
    const vite = await createViteServer({
      root,
      server: { 
        middlewareMode: true,
        hmr: {
          server: server,  // Use the HTTP server from registerRoutes
          protocol: 'ws',
          port: 5173,
          clientPort: 5173
        }
      },
      appType: 'custom',
    });

    // Apply Vite's middleware
    app.use(vite.middlewares);

    // Serve HTML with Vite's transformIndexHtml
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Exclude API routes from serving index.html
        if (url.startsWith('/api')) {
           return next();
        }

        let template = fs.readFileSync(path.resolve(root, 'client/index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

  } else {
    // Serve static files from the production build
    const clientDistPath = path.resolve(root, 'client/dist');
    app.use(express.static(clientDistPath));

    // Serve index.html for all other requests (client-side routing)
    app.get('*', (req, res) => {
       if (req.url.startsWith('/api')) return; // Don't serve index.html for API routes
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
