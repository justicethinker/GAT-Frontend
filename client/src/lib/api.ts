/**
 * api.ts - Centralized API configuration for GAT Frontend
 */

// Use backend URL directly in both dev and production
const runtimeOverride = typeof window !== "undefined" ? (window as any).__BACKEND_URL : undefined;

export const API_BASE = import.meta.env.VITE_BACKEND_URL || runtimeOverride || "";

/**
 * Builds a full URL for API requests.
 * @param path The endpoint path (e.g., "/auth/token" or "dash/stats")
 */
export function buildUrl(path: string) {
  // Ensure path starts with a slash
  const normalized = path.startsWith("/") ? path : `/${path}`;
  
  // Critical check for production deployments
  if (!API_BASE && import.meta.env.PROD) {
    console.warn(
      `⚠️ VITE_BACKEND_URL is not set! API calls will fail in production.`,
      `This means the frontend is trying to call its own host instead of the backend.`
    );
  }

  // Remove trailing slash from API_BASE to avoid double slashes
  const baseUrl = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  return baseUrl ? `${baseUrl}${normalized}` : normalized;
}