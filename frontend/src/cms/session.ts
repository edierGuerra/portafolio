import { http, HttpError } from "../api/http";
import type { AuthTokenResponse, CmsUser } from "./types";

const ACCESS_KEY = "cms_access_token";
const REFRESH_KEY = "cms_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveSession(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// Singleton promise para evitar múltiples refreshes en paralelo
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new HttpError("Sin sesion activa", 401);

  const data = await http<AuthTokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  saveSession(data.access_token, data.refresh_token);
  return data.access_token;
}

export function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function httpWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new HttpError("No autenticado", 401);

  try {
    return await http<T>(path, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
    });
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      const newToken = await refreshSession();
      return http<T>(path, {
        ...options,
        headers: { Authorization: `Bearer ${newToken}`, ...(options.headers ?? {}) },
      });
    }
    throw err;
  }
}

export type { CmsUser };
