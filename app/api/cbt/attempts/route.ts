import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const backendUrl = getBackendUrl();

/**
 * GET /api/cbt/attempts
 * Proxies to backend: GET {BACKEND}/api/cbt/attempts
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const url = query ? `${backendUrl}/api/cbt/attempts?${query}` : `${backendUrl}/api/cbt/attempts`;

  try {
    let res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });
    if (res.status === 404) {
      const fallbackUrl = query ? `${backendUrl}/cbt/attempts?${query}` : `${backendUrl}/cbt/attempts`;
      res = await fetch(fallbackUrl, {
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
    return NextResponse.json({ message: "Failed to fetch attempts" }, { status: 502 });
  }
}

