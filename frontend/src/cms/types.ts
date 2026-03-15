export type AvailabilityStatus =
  | "available"
  | "not_available"
  | "busy"
  | "open_to_talk";

export interface CmsUser {
  id: number;
  email: string;
  name: string;
  professional_profile: string;
  about_me: string;
  profile_image: string;
  location: string;
  availability_status: AvailabilityStatus;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: CmsUser;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface MeResponse {
  user: CmsUser;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectState = "En desarrollo" | "Completado";

export interface ProjectTechnology {
  id: number;
  name: string;
  logo: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year: number;
  team: number;
  state: ProjectState;
  main: boolean;
  published: boolean;
  technologies?: ProjectTechnology[];
}

export interface ProjectCreate {
  title: string;
  description: string;
  image: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year: number;
  team: number;
  state: ProjectState;
  main: boolean;
  published: boolean;
  technology_ids: number[];
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  image?: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year?: number;
  team?: number;
  state?: ProjectState;
  main?: boolean;
  published?: boolean;
  technology_ids?: number[];
}

export interface Technology {
  id: number;
  name: string;
  logo: string;
}

export interface TechnologyCreate {
  name: string;
  logo: string;
}

export interface TechnologyUpdate {
  name?: string;
  logo?: string;
}

export interface FileUploadResponse {
  object_key: string;
  file_url: string;
  content_type: string;
  size_bytes: number;
}

export interface PresignedDownloadResponse {
  object_key: string;
  download_url: string;
  expires_in: number;
}
