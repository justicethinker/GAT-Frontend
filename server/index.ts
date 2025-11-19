import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Required to pass raw body data (used for webhooks/signature verification usually)
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// CORS middleware is highly recommended for cross-origin local development
import cors from "cors";
app.use(cors({
    origin: '*', // Allows all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Body Parsers: CRITICAL - Ensure these run BEFORE the routes are registered.
// Your original implementation is correct but we ensure the import is present
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true })); // Use extended: true for better compatibility

// Custom Logging Middleware (copied from your original)
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
    if (path.startsWith("/")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});


(async () => {
  // 1. Register ALL API Routes on the Express app instance
  // registerRoutes now returns the modified 'app' instance
  const appWithRoutes = await registerRoutes(app); 

  // 2. Create the HTTP server from the app instance
  const server = createServer(appWithRoutes); 

  // 3. Error Handler: This must be registered BEFORE Vite setup/static serving 
  // to catch errors from the API routes.
  appWithRoutes.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (status === 404) {
      // Log 404s before they are potentially re-routed by the Vite handler
      log(`[WARN] 404: ${message} at ${_req.path}`);
    } else {
      console.error(`[ERROR] ${status}: ${message}`);
      console.error(err);
    }

    // Only send JSON response if it's an API route or the error is critical
    if (_req.path.startsWith('/')) {
      res.status(status).json({ message });
    } else {
      // For non-API routes, let the next handler (Vite or static serve) try
      res.status(status).send(`Error ${status}: ${message}`);
    }
  });

  // 4. Vite Setup: This must be after all API routes and error handlers
  // so that API requests are handled by Express first, and static files
  // are served as a fallback.
  if (appWithRoutes.get("env") === "development") {
    await setupVite(appWithRoutes, server);
    log("Vite development middleware setup complete.");
  } else {
    serveStatic(appWithRoutes);
    log("Serving static production files.");
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on http://0.0.0.0:${port}`);
    log("-----------------------------------------");
    log("Auth Proxy Target: https://gat-zm1r.onrender.com");
  });
})();