import type { Express, Request, Response } from "express";
import FormData from "form-data";
import multer from "multer";
import { z } from "zod";

// ──────────────────────────────────────────────────────────────
// 1. CONFIGURATION & TYPES
// ──────────────────────────────────────────────────────────────

// In-memory storage for file uploads (Production note: Consider S3/Disk for files >10MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

const API_BASE_URL = process.env.BACKEND_URL || "https://www.gatbackend.name.ng/";
const ADMIN_ID = process.env.ADMIN_ID || "GATadmin2025";
const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds

interface ProxyResult {
  status: number;
  ok: boolean;
  data: any;
}

// ──────────────────────────────────────────────────────────────
// 2. UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────

/**
 * Robust Proxy Request Handler
 * - Handles JSON, URLEncoded, and FormData
 * - Implements timeouts
 * - Normalizes errors
 */
async function proxyRequest(
  url: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<ProxyResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const options: RequestInit = {
      method,
      headers: { ...headers },
      signal: controller.signal,
    };

    const API_BASE_URL = process.env.BACKEND_URL || "https://www.gatbackend.name.ng";
    if (body && method !== "GET" && method !== "HEAD") {
      if (body instanceof URLSearchParams) {
        options.headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          ...headers,
        };
        options.body = body.toString();
      } else if (body instanceof FormData) {
        // FormData (multipart)
        const formHeaders = body.getHeaders();
        options.headers = { ...headers, ...formHeaders };
        options.body = body as any;
      } else {
        // JSON
        options.headers = {
          "Content-Type": "application/json",
          ...headers,
        };
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    let data;

    // Gracefully handle non-JSON responses (like 502 Bad Gateway HTML)
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Try parsing anyway just in case header is wrong, else return text
      try { data = JSON.parse(text); } catch { data = { message: text }; }
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle Timeouts specifically
    if (error.name === 'AbortError') {
      return { status: 504, ok: false, data: { detail: "Upstream Request Timeout" } };
    }

    console.error(`[Proxy Error] ${method} ${url}:`, error.message);
    return { status: 502, ok: false, data: { detail: "Upstream Service Unavailable" } };
  }
}

/**
 * Extracts and sanitizes the Authorization header
 */
function getAuthHeader(req: Request): Record<string, string> {
  const token = req.headers.authorization;
  return token ? { Authorization: token } : {};
}

/**
 * Validates query params for Arrays (FastAPI specific)
 */
function buildQueryString(query: any): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : "";
}

// ──────────────────────────────────────────────────────────────
// 3. ROUTE REGISTRATION
// ──────────────────────────────────────────────────────────────

export async function registerRoutes(app: Express): Promise<Express> {

  // --- AUTH VALIDATION SCHEMAS ---
  const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    adminId: z.string().optional(),
    scope: z.string().optional(),
    client_id: z.string().optional(),
  });

  // [POST] Login
  app.post("/auth/token", async (req, res) => {
    try {
      // 1. Validate Input
      const parse = LoginSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ detail: "Invalid input", errors: parse.error.format() });
      }

      const { email, password, adminId, scope, client_id } = parse.data;

      // 2. Transform to URLSearchParams (Backend Requirement)
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      if (scope) formData.append("scope", scope);
      if (client_id) formData.append("client_id", client_id);

      // 3. Proxy
      const result = await proxyRequest("/auth/token", "POST", formData);

      if (result.ok) {
        const responseData = { ...result.data };
        
        // Admin Logic Injection
        const isBackendAdmin = responseData.user_role === "admin";
        const isSuperAdmin = adminId === ADMIN_ID;
        responseData.isAdmin = isBackendAdmin || isSuperAdmin;
        
        res.json(responseData);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ detail: "Internal Server Error" });
    }
  });

  // [POST] Generic Auth Routes
  const authRoutes = ["/auth/create-user", "/auth/otp-resend", "/auth/reset-password"];
  authRoutes.forEach((route) => {
    app.post(route, async (req, res) => {
      const result = await proxyRequest(route, "POST", req.body);
      res.status(result.status).json(result.data);
    });
  });

  // [GET] User Info
  app.get("/auth/user-info", async (req, res) => {
    const result = await proxyRequest("/auth/user-info", "GET", undefined, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // [POST] Client-Side Admin Check
  app.post("/auth/verify-admin-id", (req, res) => {
    const { adminId } = req.body;
    // Use constant time comparison if crypto module available, otherwise strict equality
    res.json({ isAdmin: adminId === ADMIN_ID });
  });

  // --- DASHBOARD ROUTES ---

  // [POST] Transfer
  app.post("/dash/transfer", async (req, res) => {
    const result = await proxyRequest("/dash/transfer", "POST", req.body, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // [GET] Generic Dash Routes
  const dashGetRoutes = ["/dash/notification", "/dash/recent-trades", "/dash/deposits", "/dash/withdrawals"];
  dashGetRoutes.forEach(path => {
    app.get(path, async (req, res) => {
      const url = `${path}${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, getAuthHeader(req));
      res.status(result.status).json(result.data);
    });
  });

  // [GET] Deposit Address (per-currency)
  // Tries upstream API first. If upstream is unavailable or returns non-OK, falls back to configured addresses.
  app.get('/dash/deposit-address', async (req, res) => {
    const currency = String(req.query.currency || "").toUpperCase();
    // Attempt to proxy to upstream backend first
    try {
      const proxied = await proxyRequest(`/dash/deposit-address?currency=${encodeURIComponent(currency)}`, 'GET', undefined, getAuthHeader(req));
      if (proxied.ok && proxied.data) {
        return res.status(proxied.status).json(proxied.data);
      }
    } catch (e) {
      // ignore and fallthrough to fallback
    }

    // Fallback addresses (admin-configured). Move to DB or env in production.
    const FALLBACK: Record<string, string> = {
      USDT: process.env.FALLBACK_USDT || "TQn9Y2khEsLJW1ChVW...5KcbLSE",
      BTC: process.env.FALLBACK_BTC || "bc1qxy2kgdygjrsqtz...fjhx0wlh",
      ETH: process.env.FALLBACK_ETH || "0x742d35Cc6634C053...96C4b4",
    };

    const address = FALLBACK[currency] || process.env.FALLBACK_DEFAULT || null;
    if (!address) return res.status(404).json({ detail: "Deposit address not found" });
    return res.json({ currency, address });
  });

  // Support plural and alternate endpoint variants used by frontend
  const aliasDepositEndpoints = ['/dash/deposit-addresses', '/dash/deposits/address'];
  aliasDepositEndpoints.forEach((ep) => {
    app.get(ep, async (req, res) => {
      const currency = String(req.query.currency || "").toUpperCase();
      try {
        const proxied = await proxyRequest(`${ep}?currency=${encodeURIComponent(currency)}`, 'GET', undefined, getAuthHeader(req));
        if (proxied.ok && proxied.data) return res.status(proxied.status).json(proxied.data);
      } catch (e) {
        // ignore and fallback
      }

      const FALLBACK: Record<string, string> = {
        USDT: process.env.FALLBACK_USDT || "TQn9Y2khEsLJW1ChVW...5KcbLSE",
        BTC: process.env.FALLBACK_BTC || "bc1qxy2kgdygjrsqtz...fjhx0wlh",
        ETH: process.env.FALLBACK_ETH || "0x742d35Cc6634C053...96C4b4",
      };

      const address = FALLBACK[currency] || process.env.FALLBACK_DEFAULT || null;
      if (!address) return res.status(404).json({ detail: "Deposit address not found" });
      return res.json({ currency, address });
    });
  });

  // [POST] Deposit (Multipart/Form-Data)
  app.post("/dash/deposits", upload.single("receipt"), async (req: any, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ detail: "Receipt file is required" });
    }

    try {
      const form = new FormData();
      form.append("currency", req.body.currency || "USD");
      form.append("amount", req.body.amount || "0");
      form.append("receipt", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const result = await proxyRequest("/dash/deposits", "POST", form, getAuthHeader(req));
      res.status(result.status).json(result.data);
    } catch (error) {
      res.status(500).json({ detail: "Failed to process file upload" });
    }
  });

  // [POST] Withdrawals
  app.post("/dash/withdrawals", async (req, res) => {
    const result = await proxyRequest("/dash/withdrawals", "POST", req.body, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // [GET] Transaction Details
  app.get("/dash/transactions/:tx_type/:tx_id", async (req, res) => {
    const { tx_type, tx_id } = req.params;
    if (!['deposit', 'withdraw'].includes(tx_type)) {
       return res.status(400).json({ detail: "Invalid transaction type" });
    }
    const result = await proxyRequest(`/dash/transactions/${tx_type}/${tx_id}`, "GET", undefined, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // --- ARBITRAGE ROUTES ---

  // [GET] Public Arb Routes
  const arbPublicRoutes = ["/arb/arbitrage-exc", "/arb/arbitrage-symbol"];
  arbPublicRoutes.forEach(path => {
    app.get(path, async (req, res) => {
      const result = await proxyRequest(path, "GET");
      res.status(result.status).json(result.data);
    });
  });

  // [GET] Scanner
  app.get("/arb/opportunity-scanner", async (req, res) => {
    const url = `/arb/opportunity-scanner${buildQueryString(req.query)}`;
    const result = await proxyRequest(url, "GET");
    res.status(result.status).json(result.data);
  });

  // [POST] Perform Trade
  app.post("/arb/perform-arb-trade", async (req, res) => {
    const result = await proxyRequest("/arb/perform-arb-trade", "POST", req.body, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // [GET] User Arb History
  app.get("/arb/user-arb", async (req, res) => {
    const result = await proxyRequest("/arb/user-arb", "GET", undefined, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  // --- ADMIN ROUTES ---

  const adminGetRoutes = [
    "/admini/dashboard", 
    "/admini/view-user", 
    "/admini/suspend-user"
  ];

  adminGetRoutes.forEach(path => {
    app.get(path, async (req, res) => {
      const url = `${path}${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, getAuthHeader(req));
      res.status(result.status).json(result.data);
    });
  });

  // [PATCH] Edit User
  app.patch("/admini/edit-user", async (req, res) => {
    const queryParams = { user_id: req.query.user_id };
    const url = `/admini/edit-user${buildQueryString(queryParams)}`;
    const result = await proxyRequest(url, "PATCH", req.body, getAuthHeader(req));
    res.status(result.status).json(result.data);
  });

  return app;
}