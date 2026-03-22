import { proxyOcrUpload } from "@/app/api/lib/ocrProxy";

/**
 * POST /api/ocr/questions/upload
 * FormData: exam_type, external_exam_id (optional), images[] (files).
 * Optional: name, course_name, year, duration (when creating new exam).
 * Proxies to backend OCR; inserts parsed questions into External CBT.
 */
export async function POST(request: Request) {
  return proxyOcrUpload("questions/upload", request);
}
