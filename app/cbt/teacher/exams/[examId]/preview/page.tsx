"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, FileText, ListChecks, Loader2 } from "lucide-react";
import { cbtTeacher } from "@/app/lib/cbtApi";

const CBT_BASE = "/cbt";

/** Matches API response: GET /api/cbt/exams/:id/preview */
interface ExamPreviewResponse {
  status?: boolean;
  message?: string;
  type?: string;
  data?: {
    exam: {
      id: number;
      title: string;
      description?: string;
      instructions?: string;
      duration_minutes: number;
      total_marks: number;
    };
    questions: Array<{
      id: number;
      question_type?: string;
      question_text?: string;
      marks?: number;
      options?: Array<{
        id: number;
        option_label?: string;
        option_text?: string;
        is_correct?: boolean;
      }>;
    }>;
  };
}

export default function TeacherExamPreviewPage() {
  const params = useParams();
  const examId = params?.examId as string;
  const id = examId ? parseInt(examId, 10) : NaN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ExamPreviewResponse["data"] | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtTeacher.previewExam(id);
        const payload = res.data as ExamPreviewResponse;
        const previewData = payload?.data ?? (res.data as { data?: ExamPreviewResponse["data"] })?.data;
        if (!cancelled) setData(previewData ?? null);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to load exam preview.";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href={`${CBT_BASE}/teacher/exams`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exam = data?.exam;
  const questions = data?.questions ?? [];

  if (!exam) {
    return (
      <div className="space-y-6">
        <Link href={`${CBT_BASE}/teacher/exams`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">No preview data available for this exam.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${CBT_BASE}/teacher/exams`}>
          <Button variant="outline" size="sm" className="gap-2 border-slate-300 text-slate-800">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{exam.title}</CardTitle>
          {exam.description && (
            <CardDescription className="text-slate-600 mt-1">{exam.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{exam.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Total marks: {exam.total_marks}</span>
            </div>
          </div>
          {exam.instructions && (
            <div>
              <p className="font-medium text-slate-700 mb-1">Instructions</p>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{exam.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Questions ({questions.length})
          </CardTitle>
          <CardDescription>Preview of all questions in this exam</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No questions in this exam yet.</p>
          ) : (
            <ul className="space-y-6">
              {questions.map((q, idx) => (
                <li
                  key={q.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">Question {idx + 1}</span>
                    {q.question_type && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {q.question_type}
                      </Badge>
                    )}
                    {q.marks != null && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {q.marks} mark{q.marks !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-800 mt-1">{q.question_text ?? "(No text)"}</p>
                  {q.options && q.options.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 text-sm">
                      {q.options.map((opt) => (
                        <li key={opt.id} className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{opt.option_label ?? "—"}.</span>
                          <span>{opt.option_text}</span>
                          {opt.is_correct && (
                            <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800 border-0 gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
