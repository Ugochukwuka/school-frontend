"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Label } from "../../../../../components/ui/label";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { toast } from "sonner";
import { CBT_BASE } from "../../../../../cbt-urls";
import { AlertCircle, ArrowLeft, Loader2, Trash2 } from "lucide-react";

type ExternalOption = { id: number; option_label?: string; option_text?: string; is_correct?: boolean };
type ExternalQuestion = {
  id: number;
  question_text?: string;
  type?: "mcq" | "theory" | string;
  question_type?: "mcq" | "theory" | string;
  marks?: number;
  options?: ExternalOption[];
};

type PaginationLink = { url: string | null; label: string; active?: boolean; page?: number | null };
type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  next_page_url: string | null;
  prev_page_url: string | null;
  links: PaginationLink[];
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

function extractPaginatedQuestions(json: any): { data: ExternalQuestion[]; meta: PaginationMeta | null } {
  // Backend shape:
  // { success: true, data: { current_page, data: [...], last_page, links, ... } }
  const root = json?.data;
  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root?.questions)
      ? root.questions
      : Array.isArray(json?.data?.questions)
        ? json.data.questions
        : Array.isArray(json)
          ? json
          : [];

  const meta =
    root && typeof root.current_page === "number"
      ? {
          current_page: root.current_page,
          last_page: root.last_page ?? 1,
          per_page: root.per_page ?? (Array.isArray(list) ? list.length : 0),
          total: root.total ?? (Array.isArray(list) ? list.length : 0),
          from: root.from ?? null,
          to: root.to ?? null,
          next_page_url: root.next_page_url ?? null,
          prev_page_url: root.prev_page_url ?? null,
          links: Array.isArray(root.links) ? root.links : [],
        }
      : null;

  return { data: (list as ExternalQuestion[]) ?? [], meta };
}

export default function AdminExternalExamQuestionsPage() {
  const params = useParams();
  const examId = params?.examId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExternalQuestion[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const [optionDrafts, setOptionDrafts] = useState<Record<number, { option_label: string; option_text: string; is_correct: boolean; saving?: boolean }>>(
    {}
  );

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("per_page", "4");
      const res = await fetch(`/api/cbt/external/exams/${examId}/questions?${qs.toString()}`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to load questions.");
      const { data, meta } = extractPaginatedQuestions(json);
      setQuestions(data);
      setPagination(meta);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!examId) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, page]);

  const deleteQuestion = async (questionId: number) => {
    try {
      const res = await fetch(`/api/cbt/external/questions/${questionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to delete question.");
      toast.success("Question deleted.");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete question.");
    }
  };

  const addOption = async (questionId: number) => {
    const draft = optionDrafts[questionId] ?? { option_label: "A", option_text: "", is_correct: false };
    if (!draft.option_text.trim()) {
      toast.error("Option text is required.");
      return;
    }
    setOptionDrafts((p) => ({ ...p, [questionId]: { ...draft, saving: true } }));
    try {
      const res = await fetch(`/api/cbt/external/questions/${questionId}/options`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ option_label: draft.option_label, option_text: draft.option_text, is_correct: draft.is_correct }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to add option.");
      toast.success("Option added.");
      setOptionDrafts((p) => ({ ...p, [questionId]: { option_label: draft.option_label, option_text: "", is_correct: false } }));
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add option.");
    } finally {
      setOptionDrafts((p) => ({ ...p, [questionId]: { ...(p[questionId] ?? draft), saving: false } }));
    }
  };

  const deleteOption = async (optionId: number) => {
    try {
      const res = await fetch(`/api/cbt/external/options/${optionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to delete option.");
      toast.success("Option deleted.");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete option.");
    }
  };

  const sorted = useMemo(() => [...questions].sort((a, b) => a.id - b.id), [questions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="flex flex-wrap gap-2">
          <Link href={`${CBT_BASE}/admin/external`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to list</Button>
          </Link>
          <Link href={`${CBT_BASE}/admin/external/exams/${examId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to exam</Button>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">External Exam Questions</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Could not load questions</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              <Link href={`${CBT_BASE}/admin/external`}><Button variant="outline">Back to list</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 w-full max-w-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link href={`${CBT_BASE}/admin/external`}>
              <Button variant="ghost" size="sm" className="text-slate-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to list
              </Button>
            </Link>
            <Link href={`${CBT_BASE}/admin/external/exams/${examId}`}>
              <Button variant="ghost" size="sm" className="text-slate-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to exam
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">External Exam Questions</h1>
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map((q) => {
          const qt = (q.type ?? q.question_type ?? "mcq") as string;
          const draft = optionDrafts[q.id] ?? { option_label: "A", option_text: "", is_correct: false };
          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardDescription className="break-words">{q.question_text ?? "—"}</CardDescription>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary">{qt}</Badge>
                      <Badge variant="outline">{q.marks ?? 0} marks</Badge>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteQuestion(q.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {qt !== "theory" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-800">Options</p>
                      {(q.options ?? []).length === 0 ? (
                        <p className="text-sm text-slate-600">No options yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {(q.options ?? []).map((o) => (
                            <div key={o.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                              <div className="min-w-0">
                                <p className="text-sm">
                                  <span className="font-semibold text-slate-700 mr-2">{o.option_label ?? "•"}.</span>
                                  <span className="text-slate-900 break-words">{o.option_text ?? ""}</span>
                                </p>
                                {o.is_correct && <Badge className="mt-2 bg-green-100 text-green-700">Correct</Badge>}
                              </div>
                              <Button variant="outline" size="sm" onClick={() => deleteOption(o.id)}>
                                Delete
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pagination && pagination.last_page > 1 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm text-slate-600">
              Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.prev_page_url}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {pagination.links
                .filter(
                  (l) =>
                    l.page != null &&
                    !String(l.label).includes("Previous") &&
                    !String(l.label).includes("Next") &&
                    String(l.label) !== "..."
                )
                .map((l) => (
                  <Button
                    key={l.page ?? l.label}
                    variant={l.active ? "default" : "outline"}
                    size="sm"
                    onClick={() => typeof l.page === "number" && setPage(l.page)}
                  >
                    {l.label}
                  </Button>
                ))}
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.next_page_url}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sorted.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold text-lg mb-2">No questions yet</h3>
            <p className="text-slate-600">No questions have been added to this exam yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

