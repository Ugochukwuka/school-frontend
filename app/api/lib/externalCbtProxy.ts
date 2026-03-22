/**
 * Helper for proxying requests to the External CBT API.
 * Tries backendUrl/api/cbt/external/... then backendUrl/cbt/external/... on 404.
 */

function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

export function getExternalCbtBasePath(): string {
  return `${getBackendUrl()}/api/cbt/external`;
}

export function getExternalCbtFallbackPath(): string {
  return `${getBackendUrl()}/cbt/external`;
}

export function buildExternalCbtHeaders(request: Request, includeContentType = false): Record<string, string> {
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const h: Record<string, string> = {
    Accept: "application/json",
    ...(auth ? { Authorization: auth } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };
  if (includeContentType) h["Content-Type"] = "application/json";
  return h;
}

export async function proxyExternalCbtFetch(
  path: string,
  request: Request,
  init: { method?: string; body?: string | null; searchParams?: string } = {}
): Promise<Response> {
  const method = (init.method ?? request.method).toUpperCase();
  const q = init.searchParams ?? new URL(request.url).searchParams.toString();
  const pathWithQuery = q ? `${path}?${q}` : path;
  const body = init.body !== undefined ? init.body : (method !== "GET" && method !== "HEAD" ? await request.text() : undefined);
  const headers = buildExternalCbtHeaders(request, !!body);

  let res = await fetch(`${getExternalCbtBasePath()}${pathWithQuery}`, {
    method,
    headers,
    body: method !== "GET" && method !== "HEAD" ? body ?? undefined : undefined,
    cache: "no-store",
  });
  if (res.status === 404) {
    res = await fetch(`${getExternalCbtFallbackPath()}${pathWithQuery}`, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? body ?? undefined : undefined,
      cache: "no-store",
    });
  }
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
