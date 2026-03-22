import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const backendUrl = getBackendUrl();

/**
 * POST /api/cbt/exams/:id/start
 * Proxies to backend: POST {BACKEND}/api/cbt/exams/:id/start
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  try {
    let res = await fetch(`${backendUrl}/api/cbt/exams/${id}/start`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });
    if (res.status === 404) {
      res = await fetch(`${backendUrl}/cbt/exams/${id}/start`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to start exam" }, { status: 502 });
  }
}

