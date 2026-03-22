/**
 * CBT URLs for frontend use.
 * - CBT_BASE: Next.js route base for the CBT section.
 * - getCbtLoginApiUrl(): Backend (Laravel) login endpoint. POST {API_BASE_URL}/api/cbt/login with JSON body (email, password, role).
 */

export const CBT_BASE = "/cbt";

/** API base URL (Laravel). Set NEXT_PUBLIC_BACKEND_URL in .env.local (e.g. http://localhost:8000). */
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  return url.replace(/\/$/, "");
}

/** Full URL for CBT login API. Use with POST and JSON body { email, password, role }. */
export function getCbtLoginApiUrl(): string {
  return `${getApiBaseUrl()}/api/cbt/login`;
}

/** GET: List exams available to the student (optional ?subject_id=). */
export function getCbtExamsAvailableUrl(subjectId?: number): string {
  const base = `${getApiBaseUrl()}/api/cbt/exams/available`;
  return subjectId != null ? `${base}?subject_id=${subjectId}` : base;
}

/** GET: Resume in-progress attempt; returns attempt_id, remaining_seconds, questions. */
export function getCbtAttemptResumeUrl(attemptId: number): string {
  return `${getApiBaseUrl()}/api/cbt/attempts/${attemptId}/resume`;
}

/** GET: List student's attempts (optional ?status=in_progress for ongoing only). */
export function getCbtAttemptsUrl(status?: "in_progress"): string {
  const base = `${getApiBaseUrl()}/api/cbt/attempts`;
  return status ? `${base}?status=${status}` : base;
}
