import { http } from "../api/http";
import { httpWithAuth } from "./session";
import type {
  AuthTokenResponse,
  FileUploadResponse,
  LoginPayload,
  MeResponse,
  PresignedDownloadResponse,
  Project,
  ProjectCreate,
  ProjectUpdate,
  RefreshTokenPayload,
  Technology,
  TechnologyCreate,
  TechnologyUpdate,
} from "./types";

export async function loginCms(
  payload: LoginPayload,
): Promise<AuthTokenResponse> {
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

export async function refreshCms(
  payload: RefreshTokenPayload,
): Promise<AuthTokenResponse> {
  return http<AuthTokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutCms(
  token: string,
  refreshToken?: string,
): Promise<void> {
  await http<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken ?? null }),
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return http<Project[]>("/api/projects");
}

export async function createProjectCms(
  payload: ProjectCreate,
): Promise<Project> {
  return httpWithAuth<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProjectCms(
  id: number,
  payload: ProjectUpdate,
): Promise<Project> {
  return httpWithAuth<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProjectCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

export async function setProjectPublishedCms(
  id: number,
  published: boolean,
): Promise<Project> {
  return httpWithAuth<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
}

export async function uploadProjectImageCms(
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "projects");

  return httpWithAuth<FileUploadResponse>("/api/files/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getPresignedDownloadUrlCms(
  objectKey: string,
  expiresIn = 900,
): Promise<PresignedDownloadResponse> {
  const objectKeyParam = encodeURIComponent(objectKey);
  return httpWithAuth<PresignedDownloadResponse>(
    `/api/files/presigned-download?object_key=${objectKeyParam}&expires_in=${expiresIn}`,
  );
}

// ─── Technologies ───────────────────────────────────────────────────────────

export async function getTechnologiesCms(): Promise<Technology[]> {
  return http<Technology[]>("/api/technologies");
}

export async function createTechnologyCms(
  payload: TechnologyCreate,
): Promise<Technology> {
  return httpWithAuth<Technology>("/api/technologies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTechnologyCms(
  id: number,
  payload: TechnologyUpdate,
): Promise<Technology> {
  return httpWithAuth<Technology>(`/api/technologies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTechnologyCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/technologies/${id}`, {
    method: "DELETE",
  });
}

export async function uploadTechnologyLogoCms(
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "technologies");

  return httpWithAuth<FileUploadResponse>("/api/files/upload", {
    method: "POST",
    body: formData,
  });
}
