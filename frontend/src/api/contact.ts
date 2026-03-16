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

export interface ContactMessagePayload {
  name: string;
  email: string;
  company: string;
  budget: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  company: string;
  budget: string;
  subject: string;
  message: string;
  created_at: string;
}

export function getContactInfo(): Promise<ContactInfo[]> {
  return http<ContactInfo[]>("/api/contact-info");
}

export function getSocialNetworks(): Promise<SocialNetwork[]> {
  return http<SocialNetwork[]>("/api/social-networks");
}

export function sendContactMessage(
  payload: ContactMessagePayload,
): Promise<ContactMessage> {
  return http<ContactMessage>("/api/contact-messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
