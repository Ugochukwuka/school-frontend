"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { toast } from "sonner";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Flag, Loader2 } from "lucide-react";

type BackendOption = { id: number; option_label?: string; option_text?: string };
type BackendQuestion = {
  id: number;
  type?: "mcq" | "theory" | string;
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

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeStatus(v: any): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function isAttemptInProgress(a: any): boolean {
  const s = normalizeStatus(a?.status ?? a?.attempt_status ?? a?.state);
  if (!s) return true;
  if (s.includes("submit") || s.includes("complete") || s.includes("finish") || s.includes("closed")) return false;
  return true;
}

function coerceNumber(v: any): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? (n as number) : null;
}

function coerceAttemptId(json: any): number | null {
  const raw = json?.data?.attempt_id ?? json?.data?.attemptId ?? json?.attempt_id ?? json?.data?.id ?? json?.id;
  return coerceNumber(raw);
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
  const qt = q.type ?? q.question_type;
  const type = qt === "theory" ? "theory" : "mcq";
  if (type === "theory") {
    return { id: q.id, type, text: q.question_text ?? "", marks: q.marks ?? 0 };
  }
  return {
    id: q.id,
    type,
    text: q.question_text ?? "",
    marks: q.marks ?? 0,
    options: (q.options ?? []).map((o) => ({ id: o.id, label: o.option_label ?? "", text: o.option_text ?? "" })),
  };
}

export function ExternalTakeExam({
  examId,
  onExitHref,
  onSubmittedHref,
}: {
  examId: string;
  onExitHref: string;
  onSubmittedHref: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        const metaRes = await fetch(`/api/cbt/external/exams/${examId}`, { headers: getAuthHeaders(), cache: "no-store" });
        const metaJson = await metaRes.json().catch(() => ({}));
        if (!cancelled && metaRes.ok) {
          const d = metaJson?.data ?? metaJson;
          setExamMeta({
            title: d?.title ?? d?.name ?? `External Exam #${examId}`,
            durationMinutes: typeof d?.duration === "number" ? d.duration : typeof d?.duration_minutes === "number" ? d.duration_minutes : 0,
            totalMarks: d?.total_marks ?? d?.totalMarks ?? 0,
          });
        } else if (!cancelled) {
          setExamMeta({ title: `External Exam #${examId}`, durationMinutes: 0, totalMarks: 0 });
        }

        let aid = resumeAttemptId;
        if (!aid) {
          const startRes = await fetch(`/api/cbt/external/exams/${examId}/attempt`, {
            method: "POST",
            headers: getAuthHeaders(),
            cache: "no-store",
          });
          const startJson = await startRes.json().catch(() => ({}));
          if (!startRes.ok || startJson?.status === false) {
            throw new Error(startJson?.message ?? "Failed to start external exam.");
          }
          aid = coerceAttemptId(startJson);
          if (!aid) throw new Error("Could not determine attempt id.");
        }

        if (cancelled) return;
        setAttemptId(aid);

        // Ensure attempt is in progress before loading questions (backend only allows questions while in_progress).
        const attemptRes = await fetch(`/api/cbt/external/attempts/${aid}`, { headers: getAuthHeaders(), cache: "no-store" });
        const attemptJson = await attemptRes.json().catch(() => ({}));
        const attemptData = attemptJson?.data ?? attemptJson;
        if (!attemptRes.ok) {
          // If attempt endpoint fails, still try questions (best-effort).
        } else if (!isAttemptInProgress(attemptData)) {
          setLoadError("This attempt is no longer in progress. You cannot reopen a submitted/closed external exam.");
          return;
        }

        const qsRes = await fetch(`/api/cbt/external/attempts/${aid}/questions`, { headers: getAuthHeaders(), cache: "no-store" });
        const qsJson = await qsRes.json().catch(() => ({}));
        if (!qsRes.ok || qsJson?.status === false) {
          const msg = qsJson?.message ?? "Failed to fetch questions.";
          if (typeof msg === "string" && msg.toLowerCase().includes("in_progress")) {
            throw new Error("Questions are only available while the attempt is in progress.");
          }
          throw new Error(msg);
        }

        const data = qsJson?.data ?? qsJson;
        const backendQuestions: BackendQuestion[] = Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : [];
        const uiQuestions = backendQuestions.map(mapQuestion);
        const initialAnswers: Record<number, number | string> = {};
        for (const q of backendQuestions) {
          const a = coerceSavedAnswer(q);
          if (a !== undefined) initialAnswers[q.id] = a;
        }

        // Timer: prefer remaining_seconds from questions/attempt payload; else duration minutes.
        const remainingSecs =
          (typeof data?.remaining_seconds === "number" ? data.remaining_seconds : undefined) ??
          (typeof attemptData?.remaining_seconds === "number" ? attemptData.remaining_seconds : undefined) ??
          (typeof examMeta?.durationMinutes === "number" && examMeta.durationMinutes > 0 ? examMeta.durationMinutes * 60 : 0);

        if (!cancelled) {
          setQuestions(uiQuestions);
          setAnswers(initialAnswers);
          setTimeRemaining(Number.isFinite(remainingSecs) && remainingSecs > 0 ? Math.floor(remainingSecs) : 0);
          setCurrentQuestion(0);
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message ?? "Failed to load external exam.";
          setLoadError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (examId) void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, resumeAttemptId]);

  useEffect(() => {
    if (loading) return;
    if (timeRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // External CBT API expects option_id (not selected_option_id) for MCQ; answer_text for theory.
    const body =
      q.type === "mcq"
        ? { question_id: questionId, option_id: typeof answer === "number" ? answer : parseInt(String(answer), 10) }
        : { question_id: questionId, answer_text: String(answer ?? "") };

    const res = await fetch(`/api/cbt/external/attempts/${attemptId}/answers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
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

    if (q.type === "mcq") {
      void saveAnswer(questionId, answer)
        .then(() => toast.success("Answer saved"))
        .catch((e) => toast.error(e?.message ?? "Failed to save answer"));
      return;
    }

    const existing = theorySaveTimersRef.current[questionId];
    if (existing) window.clearTimeout(existing);
    theorySaveTimersRef.current[questionId] = window.setTimeout(() => {
      void saveAnswer(questionId, answer).catch((e) => toast.error(e?.message ?? "Failed to save answer"));
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
    const res = await fetch(`/api/cbt/external/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
      cache: "no-store",
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
      setTimeout(() => router.push(onSubmittedHref), 1200);
    }
  };

  const confirmSubmit = async () => {
    try {
      await submitAttempt();
      toast.success("Exam submitted successfully!");
      router.push(onSubmittedHref);
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
          <p className="text-slate-600">Loading external exam...</p>
        </div>
      </div>
    );
  }

  if (loadError || !question) {
    return (
      <div className="space-y-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{examMeta?.title ?? "External Exam"}</h1>
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <h3 className="font-semibold text-lg">Could not load external exam</h3>
            <p className="text-slate-600">{loadError ?? "No questions were returned."}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push(onExitHref)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
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
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{examMeta?.title ?? `External Exam #${examId}`}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm ${timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="font-mono font-bold tabular-nums">{formatTime(timeRemaining)}</span>
              </div>
              <Button onClick={() => setShowSubmitDialog(true)} className="bg-green-600 hover:bg-green-700 shrink-0 text-sm sm:text-base">
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
                      <Badge className="bg-slate-100 text-slate-700">External CBT</Badge>
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

