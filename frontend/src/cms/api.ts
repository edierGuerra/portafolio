import { http } from "../api/http";
import { httpWithAuth } from "./session";
import type {
  AnalyticsSummary,
  AvailableService,
  AvailableServiceCreate,
  AvailableServiceUpdate,
  Achievement,
  AchievementCreate,
  AchievementUpdate,
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
  ContactInfo,
  ContactInfoCreate,
  ContactInfoUpdate,
  ContactMessageCms,
  ContactMessageReplyPayload,
  FileUploadResponse,
  Interest,
  InterestCreate,
  InterestUpdate,
  LoginPayload,
  MeResponse,
  Philosophy,
  PhilosophyCreate,
  PhilosophyUpdate,
  PresignedDownloadResponse,
  Project,
  ProjectCreate,
  ProjectUpdate,
  RefreshTokenPayload,
  Experience,
  ExperienceCreate,
  ExperienceUpdate,
  FrequentlyAskedQuestion,
  FrequentlyAskedQuestionCreate,
  FrequentlyAskedQuestionUpdate,
  SocialNetwork,
  SocialNetworkCreate,
  SocialNetworkUpdate,
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

export async function getAnalyticsSummaryCms(): Promise<AnalyticsSummary> {
  return httpWithAuth<AnalyticsSummary>("/api/analytics/summary");
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
      | "cv_file"
    >
  > & {
    password?: string;
  },
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

export async function uploadAdminCvFileCms(
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "cv");

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

// ─── About / Sobre mi ───────────────────────────────────────────────────────

export async function getExperienceCms(): Promise<Experience[]> {
  return http<Experience[]>("/api/experience");
}

export async function createExperienceCms(
  payload: ExperienceCreate,
): Promise<Experience> {
  return httpWithAuth<Experience>("/api/experience", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExperienceCms(
  id: number,
  payload: ExperienceUpdate,
): Promise<Experience> {
  return httpWithAuth<Experience>(`/api/experience/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteExperienceCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/experience/${id}`, {
    method: "DELETE",
  });
}

export async function getAchievementsCms(): Promise<Achievement[]> {
  return http<Achievement[]>("/api/achievements");
}

export async function createAchievementCms(
  payload: AchievementCreate,
): Promise<Achievement> {
  return httpWithAuth<Achievement>("/api/achievements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAchievementCms(
  id: number,
  payload: AchievementUpdate,
): Promise<Achievement> {
  return httpWithAuth<Achievement>(`/api/achievements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAchievementCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/achievements/${id}`, {
    method: "DELETE",
  });
}

export async function getInterestsCms(): Promise<Interest[]> {
  return http<Interest[]>("/api/interests");
}

export async function createInterestCms(
  payload: InterestCreate,
): Promise<Interest> {
  return httpWithAuth<Interest>("/api/interests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateInterestCms(
  id: number,
  payload: InterestUpdate,
): Promise<Interest> {
  return httpWithAuth<Interest>(`/api/interests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteInterestCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/interests/${id}`, {
    method: "DELETE",
  });
}

export async function getPhilosophiesCms(): Promise<Philosophy[]> {
  return http<Philosophy[]>("/api/philosophy");
}

export async function createPhilosophyCms(
  payload: PhilosophyCreate,
): Promise<Philosophy> {
  return httpWithAuth<Philosophy>("/api/philosophy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePhilosophyCms(
  id: number,
  payload: PhilosophyUpdate,
): Promise<Philosophy> {
  return httpWithAuth<Philosophy>(`/api/philosophy/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deletePhilosophyCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/philosophy/${id}`, {
    method: "DELETE",
  });
}

// ─── Services ───────────────────────────────────────────────────────────────

export async function getServicesCms(): Promise<AvailableService[]> {
  return http<AvailableService[]>("/api/services");
}

export async function createServiceCms(
  payload: AvailableServiceCreate,
): Promise<AvailableService> {
  return httpWithAuth<AvailableService>("/api/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateServiceCms(
  id: number,
  payload: AvailableServiceUpdate,
): Promise<AvailableService> {
  return httpWithAuth<AvailableService>(`/api/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/services/${id}`, {
    method: "DELETE",
  });
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

export async function getFaqCms(): Promise<FrequentlyAskedQuestion[]> {
  return http<FrequentlyAskedQuestion[]>("/api/faq");
}

export async function createFaqCms(
  payload: FrequentlyAskedQuestionCreate,
): Promise<FrequentlyAskedQuestion> {
  return httpWithAuth<FrequentlyAskedQuestion>("/api/faq", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFaqCms(
  id: number,
  payload: FrequentlyAskedQuestionUpdate,
): Promise<FrequentlyAskedQuestion> {
  return httpWithAuth<FrequentlyAskedQuestion>(`/api/faq/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteFaqCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/faq/${id}`, {
    method: "DELETE",
  });
}

// ─── Contact ────────────────────────────────────────────────────────────────

export async function getContactInfoCms(): Promise<ContactInfo[]> {
  return http<ContactInfo[]>("/api/contact-info");
}

export async function getContactMessagesCms(
  limit = 20,
  pendingOnly = false,
): Promise<ContactMessageCms[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (pendingOnly) {
    params.set("pending_only", "true");
  }

  return httpWithAuth<ContactMessageCms[]>(
    `/api/contact-messages?${params.toString()}`,
  );
}

export async function replyContactMessageCms(
  messageId: number,
  payload: ContactMessageReplyPayload,
): Promise<ContactMessageCms> {
  return httpWithAuth<ContactMessageCms>(
    `/api/contact-messages/${messageId}/reply`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteContactMessageCms(
  messageId: number,
): Promise<void> {
  return httpWithAuth<void>(`/api/contact-messages/${messageId}`, {
    method: "DELETE",
  });
}

export async function createContactInfoCms(
  payload: ContactInfoCreate,
): Promise<ContactInfo> {
  return httpWithAuth<ContactInfo>("/api/contact-info", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContactInfoCms(
  id: number,
  payload: ContactInfoUpdate,
): Promise<ContactInfo> {
  return httpWithAuth<ContactInfo>(`/api/contact-info/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteContactInfoCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/contact-info/${id}`, {
    method: "DELETE",
  });
}

export async function getSocialNetworksCms(): Promise<SocialNetwork[]> {
  return http<SocialNetwork[]>("/api/social-networks");
}

export async function createSocialNetworkCms(
  payload: SocialNetworkCreate,
): Promise<SocialNetwork> {
  return httpWithAuth<SocialNetwork>("/api/social-networks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSocialNetworkCms(
  id: number,
  payload: SocialNetworkUpdate,
): Promise<SocialNetwork> {
  return httpWithAuth<SocialNetwork>(`/api/social-networks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSocialNetworkCms(id: number): Promise<void> {
  return httpWithAuth<void>(`/api/social-networks/${id}`, {
    method: "DELETE",
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
