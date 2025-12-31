import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      // Try to parse useful error message from body, fallback to status text
      errorText = (await res.text()) || res.statusText;
    } catch (e) {
      // ignore parsing errors
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = {};

  // 1. Handle Content-Type Logic
  // We explicitly do NOT set Content-Type if data is FormData (browser sets boundary)
  const isFormData = data instanceof FormData;
  const isSearchParams = data instanceof URLSearchParams;

  if (data && !isFormData && !isSearchParams && typeof data !== "string") {
    headers["Content-Type"] = "application/json";
  }

  if (typeof data === "string" || isSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  // 2. Auth Injection
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 3. Body Parsing
  const body =
    isFormData || isSearchParams || typeof data === "string"
      ? (data as BodyInit)
      : data
      ? JSON.stringify(data)
      : undefined;

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  // 4. Response Parsing
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  
  // Return text if not JSON, cast to T
  return (await res.text()) as unknown as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = sessionStorage.getItem("token");
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const baseUrl = queryKey[0] as string;
    const params = queryKey[1] as Record<string, any> | undefined;

    let url = baseUrl;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(","));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${baseUrl}?${queryString}`;
      }
    }

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes stale time for better performance
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});