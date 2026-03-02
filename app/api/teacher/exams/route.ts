import { NextRequest, NextResponse } from "next/server";
import { applyOffsetToExam } from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * GET /api/teacher/exams
 * Proxies to backend and adjusts start_time/end_time on each exam by offset so UI shows correct time.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const url = query ? `${backendUrl}/api/teacher/exams?${query}` : `${backendUrl}/api/teacher/exams`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const payload = (data as any)?.data ?? data;
    const list = payload?.data;
    if (Array.isArray(list)) {
      payload.data = list.map((exam: any) => applyOffsetToExam(exam) ?? exam);
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch exams from backend" },
      { status: 502 }
    );
  }
}
