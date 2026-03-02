/**
 * Backend may store/return exam datetimes with an added timezone offset (e.g. +5 hours).
 * This helper subtracts that offset so the frontend displays the time the user picked.
 * Set CBT_DATETIME_OFFSET_HOURS in .env (e.g. 5) to match your backend.
 */
const OFFSET_HOURS = Number(process.env.CBT_DATETIME_OFFSET_HOURS ?? "5") || 0;
const MS_PER_HOUR = 60 * 60 * 1000;

export function subtractOffset(isoString: string | null | undefined): string | null | undefined {
  if (OFFSET_HOURS === 0 || isoString == null || isoString === "") return isoString;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const adjusted = new Date(date.getTime() - OFFSET_HOURS * MS_PER_HOUR);
    return adjusted.toISOString();
  } catch {
    return isoString;
  }
}

export function applyOffsetToBody(body: Record<string, unknown>): Record<string, unknown> {
  const out = { ...body };
  if (typeof out.start_time === "string") out.start_time = subtractOffset(out.start_time);
  if (typeof out.end_time === "string") out.end_time = subtractOffset(out.end_time);
  return out;
}

export function applyOffsetToExam(exam: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!exam || typeof exam !== "object") return exam;
  const out = { ...exam };
  if (typeof out.start_time === "string") out.start_time = subtractOffset(out.start_time);
  if (typeof out.end_time === "string") out.end_time = subtractOffset(out.end_time);
  return out;
}
