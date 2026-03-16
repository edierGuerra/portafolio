import { http } from "./http";

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export function getFaqs(): Promise<Faq[]> {
  return http<Faq[]>("/api/faq");
}
