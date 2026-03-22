"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { Badge } from "../../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { toast } from "sonner";

const CBT_BASE = "/cbt";

type BackendOption = {
  id: number;
  option_label?: string;
  option_text?: string;
};

type BackendQuestion = {
  id: number;
  question_type?: "mcq" | "theory" | string;
  question_text?: string;
  marks?: number;
  options?: BackendOption[];
  saved_answer?: unknown;
};

type UiOption = { id: number; label: string; text: string };
type UiQuestion =
  | { id: number; type: "mcq"; text: string; marks: number; options: UiOption[] }
  | { id: number; type: "theory"; text: string; marks: number };

function coerceNumber(v: any): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? (n as number) : null;
}

function normalizeStatus(v: any): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function isInProgressAttempt(a: any): boolean {
  const s = normalizeStatus(a?.status ?? a?.attempt_status ?? a?.state);
  if (!s) return true; // if backend omits status, assume resumable
  if (
    s.includes("submit") ||
    s.includes("complete") ||
    s.includes("finish") ||
    s.includes("marked") ||
    s.includes("closed") ||
    s === "ended"
  )
    return false;
  return true;
}

function getAttemptExamId(a: any): number | null {
  return coerceNumber(a?.exam_id ?? a?.examId ?? a?.exam?.id ?? a?.exam?.exam_id);
}

function getAttemptIdFromAny(a: any): number | null {
  return coerceNumber(a?.attempt_id ?? a?.attemptId ?? a?.id);
}

function extractArrayFromResponse(json: any): any[] {
  const candidates = [
    json,
    json?.data,
    json?.data?.data,
    json?.data?.attempts,
    json?.data?.attempts?.data,
    json?.attempts,
    json?.attempts?.data,
    json?.items,
    json?.data?.items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function pickLatestAttempt(attempts: any[]): any | null {
  const score = (a: any) => {
    const id = getAttemptIdFromAny(a) ?? -1;
    const updated = Date.parse(a?.updated_at ?? a?.updatedAt ?? a?.last_saved_at ?? a?.lastSavedAt ?? "");
    const created = Date.parse(a?.created_at ?? a?.createdAt ?? "");
    const t = Number.isFinite(updated) ? updated : Number.isFinite(created) ? created : -1;
    return { t, id };
  };
  let best: any | null = null;
  let bestScore = { t: -1, id: -1 };
  for (const a of attempts) {
    const s = score(a);
    if (s.t > bestScore.t || (s.t === bestScore.t && s.id > bestScore.id)) {
      best = a;
      bestScore = s;
    }
  }
  return best;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function coerceAttemptId(json: any): number | null {
  const raw =
    json?.data?.attempt_id ??
    json?.data?.attemptId ??
    json?.attempt_id ??
    json?.attempt_id ??
    json?.data?.id;
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
  return Number.isFinite(n) ? (n as number) : null;
}

function coerceSavedAnswer(q: BackendQuestion): number | string | undefined {
  const s = q.saved_answer as any;
  if (s == null) return undefined;
  if (typeof s === "number" || typeof s === "string") return s;
  if (typeof s === "object") {
    const selected = s.selected_option_id ?? s.option_id ?? s.selectedOptionId;
    if (selected != null) return selected;
    const text = s.answer_text ?? s.answerText;
    if (text != null) return text;
  }
  return undefined;
}

function mapQuestion(q: BackendQuestion): UiQuestion {
  const type = q.question_type === "theory" ? "theory" : "mcq";
  if (type === "theory") {
    return {
      id: q.id,
      type,
      text: q.question_text ?? "",
      marks: q.marks ?? 0,
    };
  }
  return {
    id: q.id,
    type,
    text: q.question_text ?? "",
    marks: q.marks ?? 0,
    options: (q.options ?? []).map((o) => ({
      id: o.id,
      label: o.option_label ?? "",
      text: o.option_text ?? "",
    })),
  };
}

export default function StudentTakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = params?.examId as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [examMeta, setExamMeta] = useState<{ title: string; durationMinutes: number; totalMarks: number } | null>(null);
  const [questions, setQuestions] = useState<UiQuestion[]>([]);
  const autoSubmittedRef = useRef(false);
  const theorySaveTimersRef = useRef<Record<number, number>>({});

  const resumeAttemptId = useMemo(() => {
    const resume = searchParams?.get("resume");
    if (!resume) return null;
    const n = parseInt(resume, 10);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      autoSubmittedRef.current = false;

      try {
        // Fetch exam meta for header (best-effort).
        const metaRes = await fetch(`/api/cbt/exams/${examId}`, { headers: getAuthHeaders() });
        const metaJson = await metaRes.json().catch(() => ({}));
        if (!cancelled && metaRes.ok && metaJson?.status && metaJson?.data) {
          setExamMeta({
            title: metaJson.data?.title ?? `Exam #${examId}`,
            durationMinutes: metaJson.data?.duration_minutes ?? 0,
            totalMarks: metaJson.data?.total_marks ?? 0,
          });
        } else if (!cancelled) {
          setExamMeta({ title: `Exam #${examId}`, durationMinutes: 0, totalMarks: 0 });
        }

        // Determine attempt (resume or start). Always call start when not resuming so backend creates attempt and returns remaining_seconds.
        let aid = resumeAttemptId;
        let startData: { remaining_seconds?: number; duration_minutes?: number } | null = null;
        if (!aid) {
          const startRes = await fetch(`/api/cbt/exams/${examId}/start`, {
            method: "POST",
            headers: getAuthHeaders(),
          });
          const startJson = await startRes.json().catch(() => ({}));
          if (!startRes.ok || !startJson?.status) {
            const msg = startJson?.message ?? "Failed to start exam.";
            // If backend says max attempts reached, try to resume any in-progress attempt for this exam
            if (typeof msg === "string" && msg.toLowerCase().includes("maximum attempts")) {
              // Some backends return the existing attempt id even on this error.
              const hintedAid = coerceAttemptId(startJson);
              if (hintedAid != null && !cancelled) {
                router.replace(`${CBT_BASE}/student/exam/${examId}?resume=${hintedAid}`);
                return;
              }

              const examIdNum = parseInt(examId, 10);

              // Try backend-filtered first (if supported), then fall back to full list and filter client-side.
              const candidates: any[] = [];
              for (const url of ["/api/cbt/attempts?status=in_progress", "/api/cbt/attempts"]) {
                const attemptsRes = await fetch(url, { headers: getAuthHeaders() });
                const attemptsJson = await attemptsRes.json().catch(() => ({}));
                const rawList = extractArrayFromResponse(attemptsJson);
                for (const a of rawList) {
                  const eid = getAttemptExamId(a);
                  if (eid == null || !Number.isFinite(examIdNum) || eid !== examIdNum) continue;
                  if (!isInProgressAttempt(a)) continue;
                  candidates.push(a);
                }
                if (candidates.length > 0) break;
              }

              const best = pickLatestAttempt(candidates);
              const existingAid = getAttemptIdFromAny(best);
              if (existingAid != null && !cancelled) {
                router.replace(`${CBT_BASE}/student/exam/${examId}?resume=${existingAid}`);
                return;
              }
            }
            throw new Error(msg);
          }
          aid = coerceAttemptId(startJson);
          if (!aid) throw new Error("Could not determine attempt id.");
          const d = startJson?.data;
          if (d && typeof d === "object") {
            startData = {
              remaining_seconds: typeof (d as any).remaining_seconds === "number" ? (d as any).remaining_seconds : undefined,
              duration_minutes: typeof (d as any).duration_minutes === "number" ? (d as any).duration_minutes : undefined,
            };
          }
        }

        if (cancelled) return;
        setAttemptId(aid);

        // Load questions + timer (resume uses remaining_seconds from resume; new start uses remaining_seconds from start response).
        if (resumeAttemptId) {
          const resumeRes = await fetch(`/api/cbt/attempts/${aid}/resume`, { headers: getAuthHeaders() });
          const resumeJson = await resumeRes.json().catch(() => ({}));
          if (!resumeRes.ok || !resumeJson?.status || !resumeJson?.data) {
            throw new Error(resumeJson?.message ?? "Failed to resume attempt.");
          }

          const data = resumeJson.data;
          const backendQuestions: BackendQuestion[] = Array.isArray(data.questions) ? data.questions : [];
          const uiQuestions = backendQuestions.map(mapQuestion);
          const initialAnswers: Record<number, number | string> = {};
          for (const q of backendQuestions) {
            const a = coerceSavedAnswer(q);
            if (a !== undefined) initialAnswers[q.id] = a;
          }

          if (!cancelled) {
            setQuestions(uiQuestions);
            setAnswers(initialAnswers);
            const secs = Number.isFinite(data.remaining_seconds) ? data.remaining_seconds : 0;
            setTimeRemaining(secs >= 0 ? secs : 0);
            setCurrentQuestion(0);
          }
        } else {
          const qsRes = await fetch(`/api/cbt/attempts/${aid}/questions`, { headers: getAuthHeaders() });
          const qsJson = await qsRes.json().catch(() => ({}));
          if (!qsRes.ok || !qsJson?.status) {
            throw new Error(qsJson?.message ?? "Failed to fetch questions.");
          }
          const data = qsJson?.data;
          const backendQuestions: BackendQuestion[] = Array.isArray(data?.questions)
            ? data.questions
            : Array.isArray(data)
              ? data
              : [];
          const uiQuestions = backendQuestions.map(mapQuestion);
          // Timer: use remaining_seconds from start response, else duration_minutes * 60 from start, else from exam meta
          const remainingSecs =
            startData?.remaining_seconds ??
            (typeof startData?.duration_minutes === "number" ? startData.duration_minutes * 60 : undefined) ??
            (metaJson?.data?.duration_minutes ?? 0) * 60;
          const initialSeconds = Number.isFinite(remainingSecs) && remainingSecs > 0 ? Math.floor(remainingSecs) : 0;
          if (!cancelled) {
            setQuestions(uiQuestions);
            setAnswers({});
            setTimeRemaining(initialSeconds);
            setCurrentQuestion(0);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message ?? "Failed to load exam.";
          setLoadError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (examId) load();
    return () => {
      cancelled = true;
    };
  }, [examId, resumeAttemptId]);

  useEffect(() => {
    if (loading) return;
    if (timeRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, timeRemaining]);

  useEffect(() => {
    if (loading) return;
    if (timeRemaining !== 0) return;
    if (!attemptId) return;
    if (autoSubmittedRef.current) return;
    if (questions.length === 0) return;
    autoSubmittedRef.current = true;
    void handleAutoSubmit();
  }, [attemptId, loading, questions.length, timeRemaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const saveAnswer = async (questionId: number, answer: number | string) => {
    if (!attemptId) return;
    const q = questions.find((qq) => qq.id === questionId);
    if (!q) return;

    const body =
      q.type === "mcq"
        ? { question_id: questionId, selected_option_id: typeof answer === "number" ? answer : parseInt(String(answer), 10), answer_text: null }
        : { question_id: questionId, selected_option_id: null, answer_text: String(answer ?? "") };

    const res = await fetch(`/api/cbt/attempts/${attemptId}/answers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.status === false) {
      throw new Error(json?.message ?? "Failed to save answer.");
    }
  };

  const handleAnswer = (questionId: number, answer: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    const q = questions.find((qq) => qq.id === questionId);
    if (!q) return;

    // MCQ: save immediately. Theory: debounce to avoid saving every keystroke.
    if (q.type === "mcq") {
      void saveAnswer(questionId, answer)
        .then(() => toast.success("Answer saved"))
        .catch((e) => toast.error(e?.message ?? "Failed to save answer"));
      return;
    }

    const existing = theorySaveTimersRef.current[questionId];
    if (existing) window.clearTimeout(existing);
    theorySaveTimersRef.current[questionId] = window.setTimeout(() => {
      void saveAnswer(questionId, answer).catch((e) => {
        toast.error(e?.message ?? "Failed to save answer");
      });
    }, 700);
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const submitAttempt = async () => {
    if (!attemptId) throw new Error("Missing attempt id.");
    const res = await fetch(`/api/cbt/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.status === false) {
      throw new Error(json?.message ?? "Failed to submit exam.");
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await submitAttempt();
      toast.error("Time's up! Your exam has been submitted automatically.");
    } catch (e: any) {
      toast.error(e?.message ?? "Time's up, but submission failed.");
    } finally {
      setTimeout(() => router.push(`${CBT_BASE}/student/results`), 1200);
    }
  };

  const handleSubmit = () => setShowSubmitDialog(true);

  const confirmSubmit = async () => {
    try {
      await submitAttempt();
      toast.success("Exam submitted successfully!");
      router.push(`${CBT_BASE}/student/results`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit exam.");
    }
  };

  const question = questions[currentQuestion];
  const answered = questions.filter((q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== "").length;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (loadError || !question) {
    return (
      <div className="space-y-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{examMeta?.title ?? "Exam"}</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold text-lg mb-2">Could not load exam</h3>
            <p className="text-slate-600 mb-4">{loadError ?? "No questions were returned."}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => router.push(`${CBT_BASE}/student/exams`)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to exams
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 overflow-x-hidden">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{examMeta?.title ?? `Exam #${examId}`}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm ${timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="font-mono font-bold tabular-nums">{formatTime(timeRemaining)}</span>
              </div>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 shrink-0 text-sm sm:text-base">
                Submit Exam
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3 sm:mt-4 h-2" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{question.marks} marks</Badge>
                      {question.type === "theory" && <Badge className="bg-purple-100 text-purple-700">Theory</Badge>}
                    </div>
                    <h2 className="text-base sm:text-xl font-semibold text-slate-900 break-words">{question.text}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFlagQuestion(question.id)}
                    className={flaggedQuestions.has(question.id) ? "text-orange-600" : ""}
                  >
                    <Flag className="w-5 h-5" fill={flaggedQuestions.has(question.id) ? "currentColor" : "none"} />
                  </Button>
                </div>

                {question.type === "mcq" ? (
                  <RadioGroup
                    value={String(answers[question.id] ?? "")}
                    onValueChange={(value) => handleAnswer(question.id, parseInt(value, 10))}
                  >
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            Number(answers[question.id]) === option.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} className="mt-1" />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 ml-3 cursor-pointer">
                            <span className="font-semibold text-slate-700 mr-2">{option.label}.</span>
                            <span className="text-slate-900">{option.text}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="theory-answer">Your Answer:</Label>
                    <Textarea
                      id="theory-answer"
                      placeholder="Type your answer here..."
                      value={typeof answers[question.id] === "string" ? answers[question.id] : ""}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      rows={8}
                      className="resize-none min-h-[8rem] sm:min-h-[12rem] md:min-h-[16rem]"
                    />
                    <p className="text-sm text-slate-500">
                      {(typeof answers[question.id] === "string" ? answers[question.id] : "").length} characters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="h-9 sm:h-10"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                Previous
              </Button>
              <div className="text-xs sm:text-sm text-slate-600 order-last w-full sm:order-none sm:w-auto text-center sm:text-left">
                {answered} of {questions.length} answered
              </div>
              <Button
                variant="outline"
                className="h-9 sm:h-10"
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1 min-w-0">
            <Card className="sticky top-24 lg:top-24">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors relative ${
                        currentQuestion === idx
                          ? "bg-blue-600 text-white"
                          : answers[q.id] !== undefined
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                      {flaggedQuestions.has(q.id) && (
                        <Flag className="w-3 h-3 absolute -top-1 -right-1 text-orange-500" fill="currentColor" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-600" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-700" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-100" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit your exam? This action cannot be undone.</p>
              <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-slate-900">Summary:</p>
                <p className="text-sm">Total Questions: {questions.length}</p>
                <p className="text-sm">Answered: {answered}</p>
                <p className="text-sm">Unanswered: {questions.length - answered}</p>
                <p className="text-sm">Flagged: {flaggedQuestions.size}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
