import { http } from "./http";

export interface Experience {
  id: number;
  position: string;
  company: string;
  start_date: string;
  end_date: string;
}

export interface Achievement {
  id: number;
  title: string;
  subtitle: string;
}

export interface Interest {
  id: number;
  interest: string;
}

export interface Philosophy {
  id: number;
  philosophy: string;
  image: string;
}

export function getExperience(): Promise<Experience[]> {
  return http<Experience[]>("/api/experience");
}

export function getAchievements(): Promise<Achievement[]> {
  return http<Achievement[]>("/api/achievements");
}

export function getInterests(): Promise<Interest[]> {
  return http<Interest[]>("/api/interests");
}

export function getPhilosophies(): Promise<Philosophy[]> {
  return http<Philosophy[]>("/api/philosophy");
}
