import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** POST /api/cbt/external/attempts/:id/submit — Finalize attempt (sets status=submitted, computes score). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/attempts/${id}/submit`, request, { method: "POST" });
}
