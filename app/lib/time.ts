import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatExamTime(value: string | null | undefined): string {
  if (!value) return "";
  return dayjs.utc(value).format("MMM D, HH:mm");
}

/**
 * Format datetime exactly as stored in the database (no timezone conversion).
 * Uses only the date/time digits from the string — never converts UTC to local.
 * e.g. "2026-03-17T12:25:00.000000Z" or "2026-03-17 12:25:00" -> "2026-03-17 12:25"
 */
export function formatExamTimeExact(value: string | null | undefined): string {
  if (!value) return "";
  const s = value.trim();
  // Match ISO or DB style: YYYY-MM-DD then T or space, then HH:MM or HH:MM:SS (ignore Z and decimals)
  const match = s.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}):(\d{2})/);
  if (match)
    return `${match[1]} ${match[2].padStart(2, "0")}:${match[3]}`;
  return "";
}

