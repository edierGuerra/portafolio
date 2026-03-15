import { http } from "../api/http";
import { httpWithAuth } from "./session";
import type {
  AuthTokenResponse,
  BlogCategory,
  BlogCategoryCreate,
  BlogCategoryUpdate,
  BlogPost,
  BlogPostCreate,
  BlogPostUpdate,
  BlogTag,
  BlogTagCreate,
  BlogTagUpdate,
  CmsUser,
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

export async function updateMeCms(
  payload: Partial<
    Pick<
      CmsUser,
      | "name"
      | "email"
      | "professional_profile"
      | "location"
      | "about_me"
      | "profile_image"
    >
  >,
): Promise<MeResponse> {
  return httpWithAuth<MeResponse>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
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

export async function uploadAdminProfileImageCms(
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "admin-profile");

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

// ─── Blog ───────────────────────────────────────────────────────────────────

export async function getBlogsCms(): Promise<BlogPost[]> {
  return httpWithAuth<BlogPost[]>("/api/blog/cms");
}

export async function createBlogCms(
  payload: BlogPostCreate,
): Promise<BlogPost> {
  return httpWithAuth<BlogPost>("/api/blog", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBlogCms(
  id: number,
  payload: BlogPostUpdate,
): Promise<BlogPost> {
  return httpWithAuth<BlogPost>(`/api/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBlogCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/blog/${id}`, {
    method: "DELETE",
  });
}

export async function getBlogCategoriesCms(): Promise<BlogCategory[]> {
  return http<BlogCategory[]>("/api/blog-categories");
}

export async function createBlogCategoryCms(
  payload: BlogCategoryCreate,
): Promise<BlogCategory> {
  return httpWithAuth<BlogCategory>("/api/blog-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBlogCategoryCms(
  id: number,
  payload: BlogCategoryUpdate,
): Promise<BlogCategory> {
  return httpWithAuth<BlogCategory>(`/api/blog-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBlogCategoryCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/blog-categories/${id}`, {
    method: "DELETE",
  });
}

export async function getBlogTagsCms(): Promise<BlogTag[]> {
  return http<BlogTag[]>("/api/blog-tags");
}

export async function createBlogTagCms(
  payload: BlogTagCreate,
): Promise<BlogTag> {
  return httpWithAuth<BlogTag>("/api/blog-tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBlogTagCms(
  id: number,
  payload: BlogTagUpdate,
): Promise<BlogTag> {
  return httpWithAuth<BlogTag>(`/api/blog-tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBlogTagCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/blog-tags/${id}`, {
    method: "DELETE",
  });
}

export async function uploadBlogImageCms(
  file: File,
  variant: "cover" | "content" = "cover",
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "folder",
    variant === "content" ? "blog/content" : "blog/cover",
  );
  formData.append("image_variant", variant);

  return httpWithAuth<FileUploadResponse>("/api/files/upload", {
    method: "POST",
    body: formData,
  });
}
