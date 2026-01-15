import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();

// ──────────────────────────────────────────────────────────────
// 1. CRITICAL FIX: TRUST PROXY (Required for Codespaces/Render)
// ──────────────────────────────────────────────────────────────
// This fixes the "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR" error.
// We trust the load balancer/proxy that sits in front of the app.
app.set('trust proxy', 1);

// Extend IncomingMessage to support rawBody
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ──────────────────────────────────────────────────────────────
// 2. SECURITY & PERFORMANCE
// ──────────────────────────────────────────────────────────────

// A. Security Headers
// CRITICAL FIX: We disable Content Security Policy (CSP) completely for now.
// The previous errors showed CSP was blocking Google Fonts and Inline Styles.
app.use(helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// B. Compression
app.use(compression());

// C. CORS
app.use(cors({
  origin: true, // Allow any origin in development/codespaces
  credentials: true
}));

// D. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,
  // Fix for proxy environments: disable strict IP checking validation if needed
  validate: { xForwardedForHeader: false } 
});

app.use("/api", limiter);
app.use("/auth", limiter);

// ──────────────────────────────────────────────────────────────
// 3. PARSING
// ──────────────────────────────────────────────────────────────

app.use(express.json({
  limit: '10mb', 
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ──────────────────────────────────────────────────────────────
// 4. LOGGING
// ──────────────────────────────────────────────────────────────
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
    if (path.startsWith("/api") || path.startsWith("/auth") || path.startsWith("/dash")) {
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

// ──────────────────────────────────────────────────────────────
// 5. SERVER SETUP
// ──────────────────────────────────────────────────────────────

(async () => {
  const server = createServer(app);

  await registerRoutes(app);

  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[Error] ${status}: ${message}`);
    if (status === 500) console.error(err);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || "5000", 10);
  
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
    log(`Proxy Trust: Enabled`);
  });
})();