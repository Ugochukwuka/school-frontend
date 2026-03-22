import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** GET /api/cbt/external/exams — List external exams. Optional query: year, course_name, per_page. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.toString();
  return proxyExternalCbtFetch("/exams", request, { method: "GET", searchParams: q || undefined });
}

/** POST /api/cbt/external/exams — Create external exam. Body: name, course_name, duration, total_marks, etc. */
export async function POST(request: NextRequest) {
  return proxyExternalCbtFetch("/exams", request, { method: "POST" });
}
