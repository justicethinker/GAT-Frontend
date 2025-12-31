import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

const app = express();

// Extend IncomingMessage to support rawBody
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// 1. Security & Parsing Middleware
// CRITICAL FIX: Set origin to "*" or your specific frontend URL. 
// "false" blocks all cross-origin requests in production, which breaks your frontend connection.
app.use(cors({
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON and Raw Body
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// 2. Logging Middleware
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
    if (path.startsWith("/api") || path.startsWith("/auth") || path.startsWith("/dash") || path.startsWith("/admini")) {
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
  // 3. Create Server
  const server = createServer(app);

  // 4. Register Routes
  // This attaches all your /auth, /dash, /arb, /admini endpoints
  await registerRoutes(app);

  // 5. Health Check Endpoint (CRITICAL FOR RENDER)
  // Render pings this to know your app is alive.
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // 6. Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[Error] ${status}: ${message}`);
    if (status === 500) console.error(err);
    res.status(status).json({ message });
  });

  // 7. Setup Frontend Serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 8. Start Server (Render-Compatible)
  // Render assigns a dynamic port via process.env.PORT. We must use it.
  const PORT = parseInt(process.env.PORT || "5000", 10);
  
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
})();