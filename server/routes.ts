import type { Express, Request, Response } from "express";
import FormData from "form-data";
import multer from "multer";

// Configure multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

const API_BASE_URL = "https://gat-zm1r.onrender.com";
const ADMIN_ID = process.env.ADMIN_ID ?? "tradeproadmin2025";

/**
 * Robust Proxy Request Handler
 * Supports: JSON, URLSearchParams (x-www-form-urlencoded), and FormData (multipart)
 */
async function proxyRequest(
  url: string,
  method: string,
  body?: any,
  headers?: Record<string, string>
) {
  try {
    const options: RequestInit = {
      method,
      headers: { ...headers },
    };

    // BODY HANDLING
    if (body && method !== "GET" && method !== "HEAD") {
      if (body instanceof URLSearchParams) {
        // Handle x-www-form-urlencoded (e.g., Login)
        options.headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          ...headers,
        };
        options.body = body.toString();
      } else if (body instanceof FormData) {
        // Handle multipart/form-data (e.g., Deposits)
        // Note: When using 'form-data' lib, let it set the boundary header automatically
        // We merge other headers but EXCLUDE Content-Type to allow boundary generation
        const formHeaders = body.getHeaders();
        options.headers = {
          ...headers,
          ...formHeaders,
        };
        options.body = body as any; // Cast to any to satisfy fetch types compatible with Node streams
      } else {
        // Default to JSON
        options.headers = {
          "Content-Type": "application/json",
          ...headers,
        };
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Pass through failure details from backend even if status is 4xx/5xx
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error: any) {
    console.error(`[Proxy Error] ${method} ${url}:`, error);
    throw error;
  }
}

/**
 * Helper to correctly serialize query params, especially arrays for FastAPI
 * e.g., converts { a: [1, 2] } to "a=1&a=2" instead of "a=1,2"
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

export async function registerRoutes(app: Express): Promise<Express> {

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // AUTH ROUTES
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  // POST /auth/token (Login)
  // Backend expects: application/x-www-form-urlencoded
  app.post("/auth/token", async (req: Request, res: Response) => {
    try {
      const { email, password, adminId } = req.body;

      if (!email || !password) {
        return res.status(400).json({ detail: "Missing email or password" });
      }

      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      // Optional fields from docs: scope, client_id, client_secret
      if (req.body.scope) formData.append("scope", req.body.scope);
      if (req.body.client_id) formData.append("client_id", req.body.client_id);

      const result = await proxyRequest("/auth/token", "POST", formData);

      if (result.ok) {
        const responseData: any = { ...result.data };
        
        // Use backend role if available, fallback to adminId check
        if (responseData.user_role === "admin" || (adminId && adminId === ADMIN_ID)) {
          responseData.isAdmin = true;
        } else {
          responseData.isAdmin = false;
        }
        res.json(responseData);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/create-user
  app.post("/auth/create-user", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/create-user", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/otp-resend
  app.post("/auth/otp-resend", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/otp-resend", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/reset-password
  app.post("/auth/reset-password", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/reset-password", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /auth/user-info
  app.get("/auth/user-info", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/auth/user-info", "GET", undefined, {
        Authorization: authHeader || "",
      });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper for admin verification (Client logic)
  app.post("/auth/verify-admin-id", (req, res) => {
    const { adminId } = req.body;
    if (adminId && adminId === ADMIN_ID) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });


  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // DASHBOARD ROUTES
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  // POST /dash/transfer
  app.post("/dash/transfer", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/transfer", "POST", req.body, { 
        Authorization: authHeader || "" 
      });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /dash/notification
  app.get("/dash/notification", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const url = `/dash/notification${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /dash/recent-trades
  // Query: status (PENDING, COMPLETED, ACTIVE)
  app.get("/dash/recent-trades", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const url = `/dash/recent-trades${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /dash/deposits
  app.get("/dash/deposits", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/deposits", "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /dash/deposits (Multipart/Form-Data)
  // Uses 'multer' to intercept the file, then reconstructs FormData for the backend
  app.post("/dash/deposits", upload.single("receipt"), async (req: any, res: Response) => {
    try {
      const authHeader = req.headers.authorization;

      if (!req.file) {
        return res.status(400).json({ detail: "Receipt file is required" });
      }

      // Reconstruct FormData for the external API
      const form = new FormData();
      form.append("currency", req.body.currency);
      form.append("amount", req.body.amount);
      form.append("receipt", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const result = await proxyRequest("/dash/deposits", "POST", form, { 
        Authorization: authHeader || "" 
      });
      
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("Deposit Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /dash/withdrawals
  app.get("/dash/withdrawals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/withdrawals", "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /dash/withdrawals
  app.post("/dash/withdrawals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/withdrawals", "POST", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /dash/transactions/:tx_type/:tx_id
  app.get("/dash/transactions/:tx_type/:tx_id", async (req, res) => {
    try {
      const { tx_type, tx_id } = req.params;
      const authHeader = req.headers.authorization;
      
      // Validation to match Enum in docs
      if (!['deposit', 'withdraw'].includes(tx_type)) {
         return res.status(400).json({ detail: "Invalid transaction type" });
      }

      const result = await proxyRequest(`/dash/transactions/${tx_type}/${tx_id}`, "GET", undefined, { 
        Authorization: authHeader || "" 
      });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // ARBITRAGE ROUTES
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  app.get("/arb/arbitrage-exc", async (req, res) => {
    try {
      const result = await proxyRequest("/arb/arbitrage-exc", "GET");
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/arb/arbitrage-symbol", async (req, res) => {
    try {
      const result = await proxyRequest("/arb/arbitrage-symbol", "GET");
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /arb/opportunity-scanner
  // Query: exchanges (array), symbols (array), min_profit
  app.get("/arb/opportunity-scanner", async (req, res) => {
    try {
      // Use helper to ensure arrays are formatted correctly (e.g. ?exchanges=A&exchanges=B)
      const url = `/arb/opportunity-scanner${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET");
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/arb/perform-arb-trade", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/arb/perform-arb-trade", "POST", req.body, { 
        Authorization: authHeader || "" 
      });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/arb/user-arb", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/arb/user-arb", "GET", undefined, { 
        Authorization: authHeader || "" 
      });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // ADMIN ROUTES
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  app.get("/admini/dashboard", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const url = `/admini/dashboard${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/admini/view-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const url = `/admini/view-user${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/admini/edit-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      // Extract user_id for the query string, keep body for the payload
      const queryParams = { user_id: req.query.user_id };
      const url = `/admini/edit-user${buildQueryString(queryParams)}`;
      
      const result = await proxyRequest(url, "PATCH", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/admini/suspend-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const url = `/admini/suspend-user${buildQueryString(req.query)}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}