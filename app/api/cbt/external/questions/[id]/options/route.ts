import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** GET /api/cbt/external/questions/:id/options — List options for question. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/questions/${id}/options`, request, { method: "GET" });
}

/** POST /api/cbt/external/questions/:id/options — Add option. Body: option_text, is_correct, option_label, etc. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/questions/${id}/options`, request, { method: "POST" });
}
