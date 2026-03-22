import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** PUT /api/cbt/external/questions/:id — Update question. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/questions/${id}`, request, { method: "PUT" });
}

/** DELETE /api/cbt/external/questions/:id — Delete question. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/questions/${id}`, request, { method: "DELETE" });
}
