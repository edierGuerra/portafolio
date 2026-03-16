import { http } from "./http";

export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  location: string;
  availability: string;
}

export interface SocialNetwork {
  id: number;
  name: string;
  url: string;
  icon: string;
}

export function getContactInfo(): Promise<ContactInfo[]> {
  return http<ContactInfo[]>("/api/contact-info");
}

export function getSocialNetworks(): Promise<SocialNetwork[]> {
  return http<SocialNetwork[]>("/api/social-networks");
}
