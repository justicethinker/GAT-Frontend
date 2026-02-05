export const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export function buildUrl(path: string) {
  // Ensure path starts with a slash
  const normalized = path.startsWith("/") ? path : `/${path}`;
  
  // Critical: If API_BASE is empty, log a warning in production
  if (!API_BASE && import.meta.env.PROD) {
    console.warn(
      `⚠️ VITE_BACKEND_URL is not set! API calls will fail.`,
      `Current value: "${API_BASE}"`,
      `This means the frontend is configured to call itself instead of the backend.`
    );
  }
  
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

