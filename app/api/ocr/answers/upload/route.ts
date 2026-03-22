import { proxyOcrUpload } from "@/app/api/lib/ocrProxy";

/**
 * POST /api/ocr/answers/upload
 * FormData: exam_type, external_exam_id (required), images[] (answer key files).
 * Proxies to backend OCR; sets is_correct on external question options.
 */
export async function POST(request: Request) {
  return proxyOcrUpload("answers/upload", request);
}
