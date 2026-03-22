import { NextRequest, NextResponse } from "next/server";
import { subtractOffset } from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * POST /api/cbt/exams/:id/publish
 * Proxies to backend POST /api/cbt/exams/:id/publish.
 * Expected response: { status, message, type: "exam_published", data: exam }.
 * Adjusts start_time/end_time in response by offset so UI shows correct time.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization");
  try {
    const res = await fetch(`${backendUrl}/api/cbt/exams/${id}/publish`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const out = { ...(data as Record<string, unknown>) };
    const exam = out.data as Record<string, unknown> | undefined;
    if (exam && typeof exam === "object") {
      if (typeof exam.start_time === "string") exam.start_time = subtractOffset(exam.start_time) ?? exam.start_time;
      if (typeof exam.end_time === "string") exam.end_time = subtractOffset(exam.end_time) ?? exam.end_time;
    }
    return NextResponse.json(out, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { status: false, message: "Failed to publish exam" },
      { status: 502 }
    );
  }
}
