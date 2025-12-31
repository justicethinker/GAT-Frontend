import type { Express } from "express";

const API_BASE_URL = "https://gat-zm1r.onrender.com";

// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
// ADMIN CONFIGURATION
// ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
const ADMIN_ID = process.env.ADMIN_ID ?? "tradeproadmin2025"; 

async function proxyRequest(
  url: string,
  method: string,
  body?: any,
  headers?: Record<string, string>
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    };

    if (body && method !== "GET" && method !== "HEAD") {
      if (body instanceof URLSearchParams) {
        options.headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          ...headers,
        };
        options.body = body.toString();
      } else {
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

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error: any) {
    console.error("Proxy request error:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Express> {
  
  // --- AUTH ROUTES ---

  app.post("/auth/token", async (req, res) => {
    try {
      const { email, password, adminId } = req.body as { 
        email?: string; 
        password?: string; 
        adminId?: string 
      }; 
      
      if (!email || !password) {
        return res.status(400).json({ detail: "Missing email or password" });
      }

      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const result = await proxyRequest("/auth/token", "POST", formData);

      if (result.ok) {
        const responseData: any = { ...result.data };
        if (adminId && adminId === ADMIN_ID) {
          responseData.isAdmin = true;
        } else {
          responseData.isAdmin = false;
        }
        res.json(responseData);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Login route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/verify-admin-id", (req, res) => {
    const { adminId } = req.body as { adminId?: string };
    if (adminId && adminId === ADMIN_ID) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });

  app.post("/auth/create-user", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/create-user", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("Register route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/otp-resend", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/otp-resend", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("Send OTP route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/reset-password", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/reset-password", "POST", req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("Reset Password route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

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

  // --- DASHBOARD ROUTES ---

  app.get("/dash/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/stats?${queryString}` : "/dash/stats";
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/dash/transfer", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/transfer", "POST", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/notification", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/notification?${queryString}` : "/dash/notification";
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/recent-trades", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/recent-trades?${queryString}` : "/dash/recent-trades";
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/deposits", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/deposits", "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/dash/deposits", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/deposits", "POST", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/withdrawals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/withdrawals", "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/dash/withdrawals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/withdrawals", "POST", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/transactions/:tx_type/:tx_id", async (req, res) => {
    try {
      const { tx_type, tx_id } = req.params;
      const authHeader = req.headers.authorization;
      const result = await proxyRequest(`/dash/transactions/${tx_type}/${tx_id}`, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- ARBITRAGE ROUTES ---

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

  app.get("/arb/opportunity-scanner", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/arb/opportunity-scanner?${queryString}` : "/arb/opportunity-scanner";
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

  // --- ADMIN ROUTES (Fixed & Verified) ---

  // 1. Dashboard: Passes 'page' and 'suspended' query params
  app.get("/admini/dashboard", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/admini/dashboard?${queryString}` : "/admini/dashboard";
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. View User: Passes 'user_id' query param
  app.get("/admini/view-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `/admini/view-user?${queryString}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Edit User: Passes 'user_id' in query param, body data in request body
  app.patch("/admini/edit-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      // Extract user_id from query params to append to URL
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `/admini/edit-user?${queryString}`;
      
      // Forward the body (name, etc.) and the Authorization header
      const result = await proxyRequest(url, "PATCH", req.body, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Suspend User: Passes 'user_id' and 'action' query params
  app.get("/admini/suspend-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `/admini/suspend-user?${queryString}`;
      const result = await proxyRequest(url, "GET", undefined, { Authorization: authHeader || "" });
      res.status(result.status).json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}