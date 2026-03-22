import { NextRequest, NextResponse } from "next/server";
import { applyOffsetToExam } from "@/app/api/lib/datetimeOffset";

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const backendUrl = getBackendUrl();

function mapExam(e: unknown): unknown {
  return applyOffsetToExam(e != null && typeof e === "object" ? (e as Record<string, unknown>) : null) ?? e;
}

/** Apply start_time/end_time offset to each exam so the list shows the correct start time. */
function applyOffsetToExamsResponse(data: unknown): unknown {
  if (data == null || typeof data !== "object") return data;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map(mapExam);
  }
  if (Array.isArray(obj.data)) {
    return { ...obj, data: (obj.data as unknown[]).map(mapExam) };
  }
  const inner = obj.data as Record<string, unknown> | undefined;
  if (inner && typeof inner === "object" && Array.isArray(inner.exams)) {
    return {
      ...obj,
      data: { ...inner, exams: (inner.exams as unknown[]).map(mapExam) },
    };
  }
  if (Array.isArray(obj.exams)) {
    return { ...obj, exams: (obj.exams as unknown[]).map(mapExam) };
  }
  return data;
}

/**
 * GET /api/cbt/exams/available
 * Proxies to backend and adjusts start_time/end_time by offset so the list shows the correct start time.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  // Try /cbt/exams/available first (common backend mount), then /api/cbt/exams/available
  const cbtUrl = query
    ? `${backendUrl}/cbt/exams/available?${query}`
    : `${backendUrl}/cbt/exams/available`;
  const apiUrl = query
    ? `${backendUrl}/api/cbt/exams/available?${query}`
    : `${backendUrl}/api/cbt/exams/available`;

  const headers = {
    Accept: "application/json",
    ...(auth ? { Authorization: auth } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  try {
    // Try /cbt/exams/available first (matches Postman BaseUrl/cbt/exams/available), then /api/cbt/exams/available
    let res = await fetch(cbtUrl, { method: "GET", headers, cache: "no-store" });
    if (res.status === 404) {
      res = await fetch(apiUrl, { method: "GET", headers, cache: "no-store" });
    }
    const data = await res.json().catch(() => ({}));
    const transformed = applyOffsetToExamsResponse(data);
    return NextResponse.json(transformed, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch available exams" }, { status: 502 });
  }
}

