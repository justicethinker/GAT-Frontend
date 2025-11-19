import type { Express } from "express";
import { createServer, type Server } from "http";

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

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", req.body.email);
      formData.append("password", req.body.password);

      const result = await proxyRequest("/auth/login", "POST", formData);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/register", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/send-otp", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const result = await proxyRequest("/auth/reset-password", "POST", req.body);

      if (result.ok) {
        res.json(result.data);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/user-info", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dash/stats", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/dash/transfer", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dash/notification", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dash/recent-trades", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/arb/exchanges", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/arb/symbols", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/arb/opportunities", async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
