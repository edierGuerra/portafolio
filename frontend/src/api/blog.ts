import { http } from "./http";

export interface PublicBlogCategory {
  id: number;
  name: string;
}

export interface PublicBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string | null;
  image: string;
  date: string;
  status: "draft" | "published" | "scheduled" | "archived";
  is_featured: boolean;
  published_at?: string | null;
  read_time_minutes: number;
  seo_title?: string | null;
  seo_description?: string | null;
  category_id: number;
  category?: PublicBlogCategory | null;
  tags?: Array<{ id: number; name: string; slug: string }>;
  content_images?: Array<{ id: number; image_url: string; position: number }>;
}

export async function getPublicBlogs(): Promise<PublicBlogPost[]> {
  return http<PublicBlogPost[]>("/api/blog");
}

export async function getPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  return http<PublicBlogCategory[]>("/api/blog-categories");
}
