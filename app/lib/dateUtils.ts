/**
 * Date/time helpers for backend UTC datetimes.
 * Backend sends UTC (e.g. "2026-03-02T17:44:00.000000Z" or "2026-03-02 17:44:00").
 * We parse as UTC and display in local time so form and table match (no extra offset).
 */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/** Normalize backend datetime string to ISO UTC so dayjs.utc() parses correctly */
function toUtcIsoString(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const str = String(value).trim();
  if (!str) return null;
  const hasTz = str.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(str);
  if (hasTz) return str;
  const noFrac = str.replace(/\.\d+$/, "");
  const iso = noFrac.includes("T") ? noFrac : noFrac.replace(/\s+/, "T");
  return `${iso}Z`;
}

/**
 * Parse backend datetime (UTC) and return a dayjs in local time for display.
 * Use this when loading into forms or formatting for tables so no extra hours are added.
 */
export function parseBackendUtcToLocal(
  value: string | null | undefined
): dayjs.Dayjs | null {
  const iso = toUtcIsoString(value);
  if (!iso) return null;
  const d = dayjs.utc(iso).local();
  return d.isValid() ? d : null;
}

/**
 * Format backend datetime (UTC) as local time string for display in tables.
 */
export function formatBackendUtcToLocal(
  value: string | null | undefined,
  format = "MMM D, YYYY HH:mm"
): string {
  const d = parseBackendUtcToLocal(value);
  return d ? d.format(format) : "—";
}

/**
 * Convert a local dayjs (e.g. from DatePicker) to UTC ISO string for the API.
 */
export function localToUtcIso(value: dayjs.Dayjs | null | undefined): string | undefined {
  if (value == null || !dayjs.isDayjs(value)) return undefined;
  return value.toISOString();
}
