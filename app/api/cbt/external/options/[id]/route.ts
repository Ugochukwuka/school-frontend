import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** PUT /api/cbt/external/options/:id — Update option. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/options/${id}`, request, { method: "PUT" });
}

/** DELETE /api/cbt/external/options/:id — Delete option. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/options/${id}`, request, { method: "DELETE" });
}
