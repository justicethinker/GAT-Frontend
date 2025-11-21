import type { Express } from "express";

const API_BASE_URL = "https://gat-zm1r.onrender.com";

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
      const formData = new URLSearchParams();
      const body = req.body as { email?: string, password?: string }; 
      
      if (body.email) formData.append("email", body.email);
      if (body.password) formData.append("password", body.password);

      if (!formData.get('email') || !formData.get('password')) {
        return res.status(400).json({ detail: "Missing email or password" });
      }

      const result = await proxyRequest("/auth/token", "POST", formData);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Login route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/create-user", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/create-user", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Register route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/otp-resend", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/otp-resend", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Send OTP route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/auth/reset-password", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/reset-password", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
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

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("User Info route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- DASHBOARD ROUTES ---

  app.get("/dash/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/stats?${queryString}` : "/dash/stats";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Dashboard Stats route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/dash/transfer", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const result = await proxyRequest("/dash/transfer", "POST", req.body, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Transfer route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/notification", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/notification?${queryString}` : "/dash/notification";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Notification route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/dash/recent-trades", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/dash/recent-trades?${queryString}` : "/dash/recent-trades";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Recent Trades route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- ARBITRAGE ROUTES ---

  app.get("/arb/exchanges", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/arb/exchanges?${queryString}` : "/arb/exchanges";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Arbitrage Exchanges route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/arb/symbols", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/arb/symbols?${queryString}` : "/arb/symbols";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Arbitrage Symbols route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/arb/opportunities", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = queryString ? `/arb/opportunities?${queryString}` : "/arb/opportunities";
      
      const result = await proxyRequest(url, "GET", undefined, {
        Authorization: authHeader || "",
      });

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      console.error("Arbitrage Opportunities route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}