import { http } from './http';

export type AvailabilityStatus = "available" | "not_available" | "busy" | "open_to_talk";

export interface PublicProfile {
  name: string;
  professional_profile: string;
  about_me: string;
  profile_image: string;
  location: string;
  cv_file?: string | null;
  availability_status: AvailabilityStatus;
}

export interface Technology {
  id: number;
  name: string;
  logo: string;
}

export function getPublicProfile(): Promise<PublicProfile> {
  return http<PublicProfile>('/api/auth/profile');
}

export function getTechnologies(): Promise<Technology[]> {
  return http<Technology[]>('/api/technologies');
}
