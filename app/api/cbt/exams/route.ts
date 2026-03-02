import { NextRequest, NextResponse } from "next/server";
import { applyOffsetToBody } from "@/app/api/lib/datetimeOffset";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * POST /api/cbt/exams
 * Adjusts start_time/end_time in body (subtract offset) before sending to backend so stored time is correct.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  try {
    const body = await request.json().catch(() => ({}));
    const adjustedBody = applyOffsetToBody(body);
    const res = await fetch(`${backendUrl}/api/cbt/exams`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(adjustedBody),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to create exam" },
      { status: 502 }
    );
  }
}
