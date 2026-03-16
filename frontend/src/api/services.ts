import { http } from "./http";

export interface Service {
  id: number;
  service: string;
}

export function getServices(): Promise<Service[]> {
  return http<Service[]>("/api/services");
}
