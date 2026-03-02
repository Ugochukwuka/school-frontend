import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * GET /api/admin/schools
 * Proxies to backend GET /api/admin/schools (or /admin/schools if your backend uses no /api prefix).
 * Backend response shape: { data: Array<{ id, uuid, name, address, phone, status, created_at }> }
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  try {
    // Try backend with /api prefix first (Laravel typical)
    let res = await fetch(`${backendUrl}/api/admin/schools`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });
    // If 404, try without /api prefix (some backends expose /admin/schools at root)
    if (res.status === 404) {
      res = await fetch(`${backendUrl}/admin/schools`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
        },
        cache: "no-store",
      });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch schools from backend" },
      { status: 502 }
    );
  }
}
