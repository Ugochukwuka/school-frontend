/**
 * Proxy OCR upload requests to the backend.
 * POST /api/ocr/questions/upload and /api/ocr/answers/upload with formData and Bearer auth.
 */

function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

export async function proxyOcrUpload(
  path: "questions/upload" | "answers/upload",
  request: Request
): Promise<Response> {
  const auth = request.headers.get("authorization");
  const formData = await request.formData();

  const backendFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      backendFormData.append(key, value, value.name);
    } else {
      backendFormData.append(key, value);
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(auth ? { Authorization: auth } : {}),
  };

  const url = `${getBackendUrl()}/api/ocr/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: backendFormData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
