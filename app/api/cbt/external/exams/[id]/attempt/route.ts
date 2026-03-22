import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** POST /api/cbt/external/exams/:id/attempt — Start a new attempt. Body optional: { user_id }. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}/attempt`, request, { method: "POST" });
}
