import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const backendUrl = getBackendUrl();

/**
 * POST /api/cbt/attempts/:attemptId/answers
 * Proxies to backend: POST {BACKEND}/api/cbt/attempts/:attemptId/answers
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const { attemptId } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    let res = await fetch(`${backendUrl}/api/cbt/attempts/${attemptId}/answers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (res.status === 404) {
      res = await fetch(`${backendUrl}/cbt/attempts/${attemptId}/answers`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to save answer" }, { status: 502 });
  }
}

