import { supabase } from "./supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Authenticated fetch wrapper for the Express microservice.
 * Automatically attaches the Supabase JWT as a Bearer token.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session. Please sign in.");
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ?? `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new Error("API returned unsuccessful response");
  }

  return json.data;
}
