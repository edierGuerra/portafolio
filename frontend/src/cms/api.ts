import { http } from "../api/http";
import type { AuthTokenResponse, LoginPayload, MeResponse, RefreshTokenPayload } from "./types";

export async function loginCms(payload: LoginPayload): Promise<AuthTokenResponse> {
  return http<AuthTokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(token: string): Promise<MeResponse> {
  return http<MeResponse>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function refreshCms(payload: RefreshTokenPayload): Promise<AuthTokenResponse> {
  return http<AuthTokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutCms(token: string, refreshToken?: string): Promise<void> {
  await http<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken ?? null }),
  });
}
