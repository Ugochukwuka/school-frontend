import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** GET /api/cbt/external/exams/:id — Get one external exam. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}`, request, { method: "GET" });
}

/** PUT /api/cbt/external/exams/:id — Update external exam. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}`, request, { method: "PUT" });
}

/** DELETE /api/cbt/external/exams/:id — Delete external exam. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}`, request, { method: "DELETE" });
}
