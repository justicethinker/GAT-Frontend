export const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "";

export function buildUrl(path: string) {
  // Ensure path starts with a slash
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}
