import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** GET /api/cbt/external/attempts/:id — Get attempt (with score, answers when submitted). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/attempts/${id}`, request, { method: "GET" });
}
