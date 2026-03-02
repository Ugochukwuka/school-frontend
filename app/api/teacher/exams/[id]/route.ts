import { NextRequest, NextResponse } from "next/server";
import { subtractOffset } from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * GET /api/teacher/exams/:id
 * Proxies to backend GET /api/cbt/exams/:id and adjusts start_time/end_time by offset so UI shows correct time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization");
  try {
    const res = await fetch(`${backendUrl}/api/cbt/exams/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const obj = data as Record<string, unknown>;
    const out = { ...obj };
    const exam = (out.data ?? out) as Record<string, unknown>;
    if (typeof exam.start_time === "string") exam.start_time = subtractOffset(exam.start_time) ?? exam.start_time;
    if (typeof exam.end_time === "string") exam.end_time = subtractOffset(exam.end_time) ?? exam.end_time;
    return NextResponse.json(out, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch exam from backend" },
      { status: 502 }
    );
  }
}
