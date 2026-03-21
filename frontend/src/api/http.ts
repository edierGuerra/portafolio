const API_URL = (
  import.meta.env.VITE_API_URL || window.location.origin
).replace(/\/$/, "");

export class HttpError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

function getRequestLanguage(): "es" | "en" {
  const htmlLang = (document?.documentElement?.lang || "").toLowerCase();
  if (htmlLang === "es" || htmlLang === "en") {
    return htmlLang;
  }

  const stored = localStorage.getItem("language");
  if (stored === "es" || stored === "en") {
    return stored;
  }

  return "es";
}

export async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const language = getRequestLanguage();
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", language);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : `Error HTTP ${response.status}`;
    throw new HttpError(detail, response.status, payload);
  }

  return payload as T;
}