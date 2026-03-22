import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** POST /api/cbt/external/attempts/:id/answers — Submit one or multiple answers. Body: question_id, option_id or answers: [{question_id, option_id}]. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/attempts/${id}/answers`, request, { method: "POST" });
}
