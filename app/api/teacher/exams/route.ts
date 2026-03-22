import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * GET /api/teacher/exams
 * Proxies to backend. start_time/end_time are returned as-is (backend stores wall-clock time);
 * frontend uses formatBackendLocalExamDisplay so the time matches what the user entered (e.g. 3:08 PM).
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
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch exams from backend" },
      { status: 502 }
    );
  }
}
