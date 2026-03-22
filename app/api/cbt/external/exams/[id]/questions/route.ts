import { NextRequest } from "next/server";
import { proxyExternalCbtFetch } from "@/app/api/lib/externalCbtProxy";

/** GET /api/cbt/external/exams/:id/questions — List questions for exam (admin view, with options). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}/questions`, request, { method: "GET" });
}

/** POST /api/cbt/external/exams/:id/questions — Add question. Body: question_text, type (mcq|theory), marks, etc. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyExternalCbtFetch(`/exams/${id}/questions`, request, { method: "POST" });
}
