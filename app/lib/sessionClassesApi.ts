import api from "@/app/lib/api";

/** Class row for session-scoped class lists (promote, filters, etc.) */
export interface SessionClassRow {
  class_id: number;
  class_name: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function coerceClassRows(raw: unknown): SessionClassRow[] {
  if (!Array.isArray(raw)) return [];
  const out: SessionClassRow[] = [];
  for (const item of raw) {
    const o = asRecord(item);
    if (!o) continue;
    const idRaw = o.class_id ?? o.id;
    const nameRaw = o.class_name ?? o.name;
    const id = typeof idRaw === "number" ? idRaw : parseInt(String(idRaw), 10);
    const name = nameRaw != null ? String(nameRaw).trim() : "";
    if (Number.isFinite(id) && name) {
      out.push({ class_id: id, class_name: name });
    }
  }
  return out;
}

/** Extract classes array from various API envelope shapes. */
export function parseSessionClassesPayload(data: unknown): SessionClassRow[] | null {
  if (data == null) return null;
  if (Array.isArray(data)) {
    const rows = coerceClassRows(data);
    return rows;
  }
  const top = asRecord(data);
  if (!top) return null;

  const nested = asRecord(top.data);
  const fromClasses = top.classes ?? nested?.classes ?? nested?.data;
  const fromData = top.data;

  if (Array.isArray(fromClasses)) {
    return coerceClassRows(fromClasses);
  }
  if (Array.isArray(fromData)) {
    return coerceClassRows(fromData);
  }
  return null;
}

const SESSION_CLASS_PATHS = (sessionId: number) => [
  `/sessions/${sessionId}/classes`,
  `/admin/sessions/${sessionId}/classes`,
  `/session/${sessionId}/classes`,
  `/academic-sessions/${sessionId}/classes`,
];

type SessionClassRequest = () => Promise<unknown>;

function sessionClassRequests(sessionId: number): SessionClassRequest[] {
  return [
    ...SESSION_CLASS_PATHS(sessionId).map(
      (path) => () => api.get<unknown>(path).then((r) => r.data)
    ),
    () =>
      api
        .get<unknown>("/classes", { params: { session_id: sessionId } })
        .then((r) => r.data),
    () =>
      api
        .get<unknown>("/admin/classes", { params: { session_id: sessionId } })
        .then((r) => r.data),
  ];
}

/**
 * Fetches classes for an academic session. Tries several URL patterns so
 * different Laravel route versions still work.
 */
export async function fetchSessionClasses(sessionId: number): Promise<SessionClassRow[]> {
  let last404 = false;
  let lastError: unknown;

  for (const run of sessionClassRequests(sessionId)) {
    try {
      const data = await run();
      const rows = parseSessionClassesPayload(data);
      if (rows !== null) {
        return rows;
      }
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        last404 = true;
        continue;
      }
      throw err;
    }
  }

  if (last404 && lastError) {
    throw lastError;
  }
  return [];
}
