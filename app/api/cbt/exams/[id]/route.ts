import { NextRequest, NextResponse } from "next/server";
import {
  subtractOffset,
  applyOffsetToBody,
  applyOffsetToExam,
} from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function transformExamResponse(data: unknown): unknown {
  if (data == null || typeof data !== "object") return data;
  const obj = data as Record<string, unknown>;
  const out = { ...obj };
  if (typeof out.data === "object" && out.data !== null) {
    const d = out.data as Record<string, unknown>;
    out.data = applyOffsetToExam(d);
    if (Array.isArray((d as any).questions)) {
      (out.data as Record<string, unknown>).questions = (d as any).questions;
    }
  }
  if (typeof out.start_time === "string") out.start_time = subtractOffset(out.start_time);
  if (typeof out.end_time === "string") out.end_time = subtractOffset(out.end_time);
  return out;
}

/**
 * GET /api/cbt/exams/:id
 * Proxies to backend and adjusts start_time/end_time by offset so UI shows correct time.
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
    const transformed = transformExamResponse(data);
    return NextResponse.json(transformed, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch exam from backend" },
      { status: 502 }
    );
  }
}

/**
 * PUT /api/cbt/exams/:id
 * Adjusts start_time/end_time in body (subtract offset) before sending to backend, then transforms response.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization");
  try {
    const body = await request.json().catch(() => ({}));
    const adjustedBody = applyOffsetToBody(body);
    const res = await fetch(`${backendUrl}/api/cbt/exams/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(adjustedBody),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const transformed = transformExamResponse(data);
    return NextResponse.json(transformed, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update exam" },
      { status: 502 }
    );
  }
}
