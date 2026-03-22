import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const backendUrl = getBackendUrl();

/**
 * GET /api/cbt/attempts/:attemptId/questions
 * Proxies to backend: GET {BACKEND}/api/cbt/attempts/:attemptId/questions
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const { attemptId } = await context.params;

  try {
    let res = await fetch(`${backendUrl}/api/cbt/attempts/${attemptId}/questions`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });
    if (res.status === 404) {
      res = await fetch(`${backendUrl}/cbt/attempts/${attemptId}/questions`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(auth ? { Authorization: auth } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch attempt questions" }, { status: 502 });
  }
}

