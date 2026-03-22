/**
 * Date/time helpers for backend datetimes.
 * Backend usually sends UTC (e.g. "2026-03-02T17:44:00.000000Z" or "2026-03-02 17:44:00").
 */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Keep this in sync with backend (e.g. Laravel config('app.timezone'))
export const APP_TIMEZONE = "Africa/Lagos";

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
 * Format backend datetime (stored as UTC) in a specific timezone.
 * Example: formatBackendUtcToTimezone("2026-03-09T13:13:00Z", "MMM D, h:mm A", "Africa/Lagos")
 */
export function formatBackendUtcToTimezone(
  value: string | null | undefined,
  format = "MMM D, YYYY HH:mm",
  timeZone: string = APP_TIMEZONE
): string {
  const iso = toUtcIsoString(value);
  if (!iso) return "—";
  const d = dayjs.utc(iso).tz(timeZone);
  return d.isValid() ? d.format(format) : "—";
}

/**
 * Convert a local dayjs (e.g. from DatePicker) to UTC ISO string for the API.
 */
export function localToUtcIso(value: dayjs.Dayjs | null | undefined): string | undefined {
  if (value == null || !dayjs.isDayjs(value)) return undefined;
  return value.toISOString();
}

/**
 * Format backend UTC datetime for use as value in <input type="datetime-local">.
 * Parses API value as UTC and returns local time in YYYY-MM-DDTHH:mm.
 */
export function formatBackendUtcForDateTimeLocal(value: string | null | undefined): string {
  const d = parseBackendUtcToLocal(value);
  return d ? d.format("YYYY-MM-DDTHH:mm") : "";
}

/**
 * Format backend UTC datetime for exam cards (e.g. "3/5/2026, 2:02 PM").
 */
export function formatBackendUtcExamDisplay(value: string | null | undefined): string {
  return formatBackendUtcToLocal(value, "M/D/YYYY, h:mm A");
}

/**
 * Parse backend datetime as local time (no timezone).
 * Use when the backend stores "wall clock" time (e.g. 15:08 = 3:08 PM as entered)
 * so we display the same time without UTC conversion.
 * Strips Z and timezone offsets so "2026-03-05T15:08:00.000Z" is shown as 3:08 PM local.
 */
function parseBackendAsLocal(value: string | null | undefined): dayjs.Dayjs | null {
  if (value == null || value === "") return null;
  let str = String(value).trim().replace(/\s+/, "T").replace(/\.\d+$/, "");
  str = str.replace(/Z$/i, "").replace(/[+-]\d{2}:?\d{2}$/, "");
  if (!str) return null;
  const d = dayjs(str);
  return d.isValid() ? d : null;
}

/**
 * Format backend datetime for exam "Available" range when backend stores local/wall-clock time.
 * Shows the time as stored (e.g. 3:08 PM) instead of converting from UTC.
 */
export function formatBackendLocalExamDisplay(value: string | null | undefined): string {
  const d = parseBackendAsLocal(value);
  return d ? d.format("M/D/YYYY, h:mm A") : "—";
}

/**
 * Format backend datetime for exam cards with seconds, treating backend time as local/wall-clock.
 * Example output: "Mar 9, 12:30:00".
 */
export function formatBackendLocalExamDisplayWithSeconds(value: string | null | undefined): string {
  const d = parseBackendAsLocal(value);
  return d ? d.format("MMM D, HH:mm:ss") : "—";
}

/**
 * Format backend datetime (stored as local/wall-clock) for <input type="datetime-local">.
 * Use when loading exam edit form so the input shows the same time as stored (e.g. 3:34 PM).
 */
export function formatBackendLocalForDateTimeLocal(value: string | null | undefined): string {
  const d = parseBackendAsLocal(value);
  return d ? d.format("YYYY-MM-DDTHH:mm") : "";
}
