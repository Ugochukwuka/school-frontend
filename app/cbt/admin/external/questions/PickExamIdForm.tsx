"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { CBT_BASE } from "../../../cbt-urls";
import { ArrowLeft, ArrowRight, FileUp, Loader2, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";

type ExternalExam = {
  id: number;
  name?: string;
  title?: string;
  course_name?: string;
  year?: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function extractExamList(json: unknown): ExternalExam[] {
  const data = json && typeof json === "object" && "data" in json ? (json as { data?: unknown }).data : null;
  if (!data || typeof data !== "object") return [];
  const list = Array.isArray((data as { data?: unknown }).data)
    ? (data as { data: ExternalExam[] }).data
    : Array.isArray(data)
      ? (data as ExternalExam[])
      : [];
  return list;
}

const EXAM_TYPES = ["WAEC", "NECO", "JAMB", "church_quiz", "company_exam", "other"] as const;

export function PickExamIdForm() {
  const router = useRouter();
  const [exams, setExams] = useState<ExternalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [step, setStep] = useState<"list" | "method" | "upload">("list");
  const [method, setMethod] = useState<"manual" | "upload" | null>(null);

  const [examType, setExamType] = useState<string>("WAEC");
  const [questionsFiles, setQuestionsFiles] = useState<FileList | null>(null);
  const [answersFiles, setAnswersFiles] = useState<FileList | null>(null);
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [uploadingAnswers, setUploadingAnswers] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cbt/external/exams?per_page=200", {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        setError(json?.message ?? "Failed to load exams.");
        if (res.status === 401) toast.error("Please log in again.");
        setExams([]);
        return;
      }
      setExams(extractExamList(json));
    } catch {
      setError("Network error loading exams.");
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const onContinue = () => {
    if (selectedExamId == null) return;
    setStep("method");
  };

  const onChooseManual = () => {
    if (selectedExamId == null) return;
    router.push(`${CBT_BASE}/admin/external/exams/${selectedExamId}/questions`);
  };

  const onChooseUpload = () => {
    setMethod("upload");
    setStep("upload");
  };

  const handleUploadQuestions = async () => {
    if (!selectedExamId || !questionsFiles?.length) {
      toast.error("Select an exam and at least one question image.");
      return;
    }
    setUploadingQuestions(true);
    try {
      const formData = new FormData();
      formData.append("exam_type", examType);
      formData.append("external_exam_id", String(selectedExamId));
      for (let i = 0; i < questionsFiles.length; i++) {
        formData.append("images[]", questionsFiles[i], questionsFiles[i].name);
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/ocr/questions/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Upload failed.");
      toast.success("Questions uploaded. OCR will parse and add them to this exam.");
      setQuestionsFiles(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to upload questions.");
    } finally {
      setUploadingQuestions(false);
    }
  };

  const handleUploadAnswers = async () => {
    if (!selectedExamId || !answersFiles?.length) {
      toast.error("Select an exam and at least one answer key image.");
      return;
    }
    setUploadingAnswers(true);
    try {
      const formData = new FormData();
      formData.append("exam_type", examType);
      formData.append("external_exam_id", String(selectedExamId));
      for (let i = 0; i < answersFiles.length; i++) {
        formData.append("images[]", answersFiles[i], answersFiles[i].name);
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/ocr/answers/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Upload failed.");
      toast.success("Answer key uploaded. Correct options will be applied to this exam.");
      setAnswersFiles(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to upload answers.");
    } finally {
      setUploadingAnswers(false);
    }
  };

  const backToList = () => {
    setStep("list");
    setMethod(null);
  };

  const backToMethod = () => {
    setStep("method");
    setMethod(null);
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
          External CBT
        </Link>
        <span>/</span>
        <span className="text-slate-900">External Questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`${CBT_BASE}/admin/external`}>
          <Button variant="ghost" size="sm" className="text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to exams
          </Button>
        </Link>
      </div>

      {step === "list" && (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="tracking-tight">External Questions</CardTitle>
            <CardDescription>
              Pick an exam from the list below (course and year). Then click Continue and choose to add questions &amp; options manually or by upload (OCR).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            )}
            {error && !loading && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            {!loading && !error && exams.length === 0 && (
              <p className="text-slate-600 text-sm">No exams found. Create an exam from the external exams list first.</p>
            )}
            {!loading && exams.length > 0 && (
              <div className="space-y-2">
                <Label>Select an exam</Label>
                <ul className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                  {exams.map((exam) => {
                    const isSelected = selectedExamId === exam.id;
                    return (
                      <li key={exam.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedExamId(exam.id)}
                          className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
                            isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-medium text-slate-900">{exam.course_name ?? exam.name ?? "—"}</span>
                          <span className="text-slate-600">{exam.year ?? "—"}</span>
                          {/* id kept in state only, not displayed */}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <Button
                onClick={onContinue}
                disabled={selectedExamId == null}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "method" && (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="tracking-tight">How will you add Questions &amp; Options?</CardTitle>
            <CardDescription>
              {selectedExam && (
                <>Exam: {selectedExam.course_name ?? selectedExam.name ?? "—"} ({selectedExam.year ?? "—"})</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={onChooseManual}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <PenLine className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manual</p>
                  <p className="text-sm text-slate-600">Add questions and options one by one on the exam questions page.</p>
                </div>
              </button>
              <button
                type="button"
                onClick={onChooseUpload}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <FileUp className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Upload</p>
                  <p className="text-sm text-slate-600">Upload question and answer key images; AI will parse and add them.</p>
                </div>
              </button>
            </div>
            <Button variant="outline" onClick={backToList} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to exam list
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "upload" && method === "upload" && (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="tracking-tight flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload questions &amp; answers
            </CardTitle>
            <CardDescription>
              {selectedExam && (
                <>Exam: {selectedExam.course_name ?? selectedExam.name ?? "—"} ({selectedExam.year ?? "—"})</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h4 className="font-medium text-slate-900">Upload questions (images)</h4>
                <p className="text-sm text-slate-600">Question paper images. OCR parses questions and options, then adds them to this exam.</p>
                <div className="space-y-2">
                  <Label>Exam type</Label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => setQuestionsFiles(e.target.files ?? null)}
                  className="cursor-pointer"
                />
                <Button
                  onClick={handleUploadQuestions}
                  disabled={uploadingQuestions || !questionsFiles?.length}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {uploadingQuestions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingQuestions ? "Uploading..." : "Upload questions"}
                </Button>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h4 className="font-medium text-slate-900">Upload answers (answer key)</h4>
                <p className="text-sm text-slate-600">Answer key images. OCR parses correct options and sets them on existing questions.</p>
                <div className="space-y-2">
                  <Label>Exam type</Label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => setAnswersFiles(e.target.files ?? null)}
                  className="cursor-pointer"
                />
                <Button
                  onClick={handleUploadAnswers}
                  disabled={uploadingAnswers || !answersFiles?.length}
                  variant="outline"
                  className="w-full border-slate-300"
                >
                  {uploadingAnswers ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingAnswers ? "Uploading..." : "Upload answers"}
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={backToMethod} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Manual / Upload choice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
