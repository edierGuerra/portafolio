/**
 * Tracker de analíticas del portafolio.
 *
 * Solo registra eventos cuando NO hay una sesión de admin activa
 * (se detecta por la presencia del access token en localStorage).
 */

import { http } from "../api/http";

const SESSION_ID_KEY = "analytics_session_id";
const ADMIN_TOKEN_KEY = "cms_access_token";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

function isAdminSession(): boolean {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export async function trackPageView(): Promise<void> {
  if (isAdminSession()) return;

  try {
    await http("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        event_type: "page_view",
        referrer: document.referrer,
        session_id: getSessionId(),
      }),
    });
  } catch {
    // Silently ignore — tracking must never break the portfolio
  }
}

export async function trackSectionView(section: string): Promise<void> {
  if (isAdminSession()) return;

  try {
    await http("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        event_type: "section_view",
        section,
        referrer: document.referrer,
        session_id: getSessionId(),
      }),
    });
  } catch {
    // Silently ignore
  }
}
