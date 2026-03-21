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
  name_en?: string | null;
  name_en_reviewed?: boolean;
  professional_profile: string;
  professional_profile_en?: string | null;
  professional_profile_en_reviewed?: boolean;
  about_me: string;
  about_me_en?: string | null;
  about_me_en_reviewed?: boolean;
  profile_image: string;
  location: string;
  location_en?: string | null;
  location_en_reviewed?: boolean;
  cv_file?: string | null;
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
  name_en?: string | null;
  logo: string;
}

export interface Project {
  id: number;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  image: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year: number;
  team: number;
  state: ProjectState;
  state_en?: string | null;
  main: boolean;
  published: boolean;
  technologies?: ProjectTechnology[];
}

export interface ProjectCreate {
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  image: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year: number;
  team: number;
  state: ProjectState;
  state_en?: string | null;
  main: boolean;
  published: boolean;
  technology_ids: number[];
  title_en_reviewed?: boolean;
  description_en_reviewed?: boolean;
  state_en_reviewed?: boolean;
}

export interface ProjectUpdate {
  title?: string;
  title_en?: string | null;
  description?: string;
  description_en?: string | null;
  image?: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year?: number;
  team?: number;
  state?: ProjectState;
  state_en?: string | null;
  main?: boolean;
  published?: boolean;
  technology_ids?: number[];
  title_en_reviewed?: boolean;
  description_en_reviewed?: boolean;
  state_en_reviewed?: boolean;
}

export interface Technology {
  id: number;
  name: string;
  name_en?: string | null;
  logo: string;
}

export interface TechnologyCreate {
  name: string;
  name_en?: string | null;
  logo: string;
  name_en_reviewed?: boolean;
}

export interface TechnologyUpdate {
  name?: string;
  name_en?: string | null;
  logo?: string;
  name_en_reviewed?: boolean;
}

// ─── About / Sobre mi ───────────────────────────────────────────────────────

export interface Experience {
  id: number;
  position: string;
  position_en?: string | null;
  position_en_reviewed?: boolean;
  company: string;
  company_en?: string | null;
  company_en_reviewed?: boolean;
  start_date: string;
  end_date: string;
}

export interface ExperienceCreate {
  position: string;
  position_en?: string | null;
  company: string;
  company_en?: string | null;
  start_date: string;
  end_date: string;
  position_en_reviewed?: boolean;
  company_en_reviewed?: boolean;
}

export interface ExperienceUpdate {
  position?: string;
  position_en?: string | null;
  company?: string;
  company_en?: string | null;
  start_date?: string;
  end_date?: string;
  position_en_reviewed?: boolean;
  company_en_reviewed?: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  title_en?: string | null;
  title_en_reviewed?: boolean;
  subtitle: string;
  subtitle_en?: string | null;
  subtitle_en_reviewed?: boolean;
}

export interface AchievementCreate {
  title: string;
  title_en?: string | null;
  subtitle: string;
  subtitle_en?: string | null;
}

export interface AchievementUpdate {
  title?: string;
  title_en?: string | null;
  subtitle?: string;
  subtitle_en?: string | null;
}

export interface Interest {
  id: number;
  interest: string;
  interest_en?: string | null;
  interest_en_reviewed?: boolean;
}

export interface InterestCreate {
  interest: string;
  interest_en?: string | null;
}

export interface InterestUpdate {
  interest?: string;
  interest_en?: string | null;
}
export interface Philosophy {
  id: number;
  philosophy: string;
  philosophy_en?: string | null;
  philosophy_en_reviewed?: boolean;
  image: string;
}

export interface PhilosophyCreate {
  philosophy: string;
  philosophy_en?: string | null;
  image: string;
}

export interface PhilosophyUpdate {
  philosophy?: string;
  philosophy_en?: string | null;
  image?: string;
  philosophy_en_reviewed?: boolean;
}

// ─── Services ───────────────────────────────────────────────────────────────

export interface AvailableService {
  id: number;
  service: string;
  service_en?: string | null;
}

export interface AvailableServiceCreate {
  service: string;
  service_en?: string | null;
}

export interface AvailableServiceUpdate {
  service?: string;
  service_en?: string | null;
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

export interface FrequentlyAskedQuestion {
  id: number;
  question: string;
  question_en?: string | null;
  answer: string;
  answer_en?: string | null;
}

export interface FrequentlyAskedQuestionCreate {
  question: string;
  question_en?: string | null;
  answer: string;
  answer_en?: string | null;
}

export interface FrequentlyAskedQuestionUpdate {
  question?: string;
  question_en?: string | null;
  answer?: string;
  answer_en?: string | null;
}

// ─── Contact ────────────────────────────────────────────────────────────────

export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  location: string;
  location_en?: string | null;
  availability: string;
  availability_en?: string | null;
}

export interface ContactInfoCreate {
  email: string;
  phone: string;
  location: string;
  location_en?: string | null;
  availability: string;
  availability_en?: string | null;
}

export interface ContactInfoUpdate {
  email?: string;
  phone?: string;
  location?: string;
  location_en?: string | null;
  availability?: string;
  availability_en?: string | null;
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
  name_en?: string | null;
  url: string;
  icon: string;
}

export interface SocialNetworkCreate {
  name: string;
  name_en?: string | null;
  url: string;
  icon: string;
}

export interface SocialNetworkUpdate {
  name?: string;
  name_en?: string | null;
  url?: string;
  icon?: string;
}

// ─── Blog ───────────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: number;
  name: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
}

export interface BlogCategoryCreate {
  name: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
}

export interface BlogCategoryUpdate {
  name?: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
}

export interface BlogTag {
  id: number;
  name: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
  slug: string;
}

export interface BlogTagCreate {
  name: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
  slug: string;
}

export interface BlogTagUpdate {
  name?: string;
  name_en?: string | null;
  name_en_reviewed?: boolean;
  slug?: string;
}

export type BlogStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogPost {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt: string;
  excerpt_en?: string | null;
  content?: string | null;
  content_en?: string | null;
  image: string;
  date: string;
  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  read_time_minutes: number;
  seo_title?: string | null;
  seo_title_en?: string | null;
  seo_description?: string | null;
  seo_description_en?: string | null;
  title_en_reviewed?: boolean;
  excerpt_en_reviewed?: boolean;
  content_en_reviewed?: boolean;
  seo_title_en_reviewed?: boolean;
  seo_description_en_reviewed?: boolean;
  category_id: number;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  content_images?: Array<{ id: number; image_url: string; position: number }>;
}

export interface BlogPostCreate {
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt: string;
  excerpt_en?: string | null;
  content?: string | null;
  content_en?: string | null;
  image: string;
  date: string;
  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  read_time_minutes: number;
  seo_title?: string | null;
  seo_title_en?: string | null;
  seo_description?: string | null;
  seo_description_en?: string | null;
  title_en_reviewed?: boolean;
  excerpt_en_reviewed?: boolean;
  content_en_reviewed?: boolean;
  seo_title_en_reviewed?: boolean;
  seo_description_en_reviewed?: boolean;
  category_id: number;
  tag_ids: number[];
}

export interface BlogPostUpdate {
  title?: string;
  title_en?: string | null;
  slug?: string;
  excerpt?: string;
  excerpt_en?: string | null;
  content?: string | null;
  content_en?: string | null;
  image?: string;
  date?: string;
  status?: BlogStatus;
  is_featured?: boolean;
  published_at?: string | null;
  read_time_minutes?: number;
  seo_title?: string | null;
  seo_title_en?: string | null;
  seo_description?: string | null;
  seo_description_en?: string | null;
  title_en_reviewed?: boolean;
  excerpt_en_reviewed?: boolean;
  content_en_reviewed?: boolean;
  seo_title_en_reviewed?: boolean;
  seo_description_en_reviewed?: boolean;
  category_id?: number;
  tag_ids?: number[];
}

export interface TranslationRequest {
  text: string;
}

export interface TranslationResult {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
  is_draft: boolean;
  status: "success" | "error";
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
