import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API base URL from environment or default to relative URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const json = await res.json();
      const message = json.message || res.statusText;
      const error: any = new Error(message);
      error.status = res.status;
      error.statusText = res.statusText;
      throw error;
    } catch (parseError) {
      const text = res.statusText || `Request failed with status ${res.status}`;
      const error: any = new Error(text);
      error.status = res.status;
      error.statusText = res.statusText;
      throw error;
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log(`API Request: ${method} ${fullUrl}`, data ? { data } : {});

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`API Response: ${method} ${fullUrl} - Status: ${res.status}`);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = `${API_BASE_URL}${queryKey.join("/")}`;
    console.log(`Query: ${url}`);

    const res = await fetch(url, {
      credentials: "include",
    });

    console.log(`Query Response: ${url} - Status: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log("Returning null for 401 response");
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`Query Data: ${url}`, data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
