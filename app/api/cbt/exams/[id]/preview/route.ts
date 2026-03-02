import { NextRequest, NextResponse } from "next/server";
import { subtractOffset } from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function transformPreviewResponse(data: unknown): unknown {
  if (data == null || typeof data !== "object") return data;
  const obj = data as Record<string, unknown>;
  const out = { ...obj };
  const exam = (out.exam ?? out.data ?? out) as Record<string, unknown>;
  if (exam && typeof exam === "object") {
    if (typeof exam.start_time === "string") exam.start_time = subtractOffset(exam.start_time) ?? exam.start_time;
    if (typeof exam.end_time === "string") exam.end_time = subtractOffset(exam.end_time) ?? exam.end_time;
  }
  return out;
}

/**
 * GET /api/cbt/exams/:id/preview
 * Proxies to backend and adjusts start_time/end_time by offset so edit form shows correct time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization");
  try {
    const res = await fetch(`${backendUrl}/api/cbt/exams/${id}/preview`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const transformed = transformPreviewResponse(data);
    return NextResponse.json(transformed, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch exam preview" },
      { status: 502 }
    );
  }
}
