export type AvailabilityStatus =
  | "available"
  | "not_available"
  | "busy"
  | "open_to_talk";

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DayTrend {
  day: string;
  visits: number;
  unique: number;
}

export interface SectionClicks {
  section: string;
  clicks: number;
}

export interface TrafficSource {
  source: string;
  value: number;
  fill: string;
}

export interface HourActivity {
  hour: string;
  activity: number;
}

export interface AnalyticsSummary {
  visit_trend: DayTrend[];
  section_clicks: SectionClicks[];
  traffic_sources: TrafficSource[];
  hourly_activity: HourActivity[];
  total_visits_today: number;
  total_visits_week: number;
  total_unique_week: number;
  total_section_clicks: number;
  avg_ctr: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── About / Sobre mi ───────────────────────────────────────────────────────

export interface Experience {
  id: number;
  position: string;
  company: string;
  start_date: string;
  end_date: string;
}

export interface ExperienceCreate {
  position: string;
  company: string;
  start_date: string;
  end_date: string;
}

export interface ExperienceUpdate {
  position?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
}

export interface Achievement {
  id: number;
  title: string;
  subtitle: string;
}

export interface AchievementCreate {
  title: string;
  subtitle: string;
}

export interface AchievementUpdate {
  title?: string;
  subtitle?: string;
}

export interface Interest {
  id: number;
  interest: string;
}

export interface InterestCreate {
  interest: string;
}

export interface InterestUpdate {
  interest?: string;
}

export interface Philosophy {
  id: number;
  philosophy: string;
  image: string;
}

export interface PhilosophyCreate {
  philosophy: string;
  image: string;
}

export interface PhilosophyUpdate {
  philosophy?: string;
  image?: string;
}

// ─── Services ───────────────────────────────────────────────────────────────

export interface AvailableService {
  id: number;
  service: string;
}

export interface AvailableServiceCreate {
  service: string;
}

export interface AvailableServiceUpdate {
  service?: string;
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

export interface FrequentlyAskedQuestion {
  id: number;
  question: string;
  answer: string;
}

export interface FrequentlyAskedQuestionCreate {
  question: string;
  answer: string;
}

export interface FrequentlyAskedQuestionUpdate {
  question?: string;
  answer?: string;
}

// ─── Contact ────────────────────────────────────────────────────────────────

export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  location: string;
  availability: string;
}

export interface ContactInfoCreate {
  email: string;
  phone: string;
  location: string;
  availability: string;
}

export interface ContactInfoUpdate {
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
}

export interface ContactMessageCms {
  id: number;
  name: string;
  email: string;
  company: string;
  budget: string;
  subject: string;
  message: string;
  responded: boolean;
  responded_at?: string | null;
  response_subject: string;
  response_message: string;
  created_at: string;
}

export interface ContactMessageReplyPayload {
  subject: string;
  message: string;
}

export interface SocialNetwork {
  id: number;
  name: string;
  url: string;
  icon: string;
}

export interface SocialNetworkCreate {
  name: string;
  url: string;
  icon: string;
}

export interface SocialNetworkUpdate {
  name?: string;
  url?: string;
  icon?: string;
}

// ─── Blog ───────────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: number;
  name: string;
}

export interface BlogCategoryCreate {
  name: string;
}

export interface BlogCategoryUpdate {
  name?: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogTagCreate {
  name: string;
  slug: string;
}

export interface BlogTagUpdate {
  name?: string;
  slug?: string;
}

export type BlogStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string | null;
  image: string;
  date: string;
  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  read_time_minutes: number;
  seo_title?: string | null;
  seo_description?: string | null;
  category_id: number;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  content_images?: Array<{ id: number; image_url: string; position: number }>;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  excerpt: string;
  content?: string | null;
  image: string;
  date: string;
  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  read_time_minutes: number;
  seo_title?: string | null;
  seo_description?: string | null;
  category_id: number;
  tag_ids: number[];
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string | null;
  image?: string;
  date?: string;
  status?: BlogStatus;
  is_featured?: boolean;
  published_at?: string | null;
  read_time_minutes?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  category_id?: number;
  tag_ids?: number[];
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
