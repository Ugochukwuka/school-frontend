"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { CBT_BASE } from "../../../../cbt-urls";
import { formatExamTimeExact } from "@/app/lib/time";
import { ArrowLeft, FileText, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

type ExternalExam = {
  id: number;
  uuid?: string;
  name: string;
  title?: string;
  description?: string;
  course_name?: string;
  year?: string;
  duration?: number;
  total_marks?: number;
  start_time?: string;
  end_time?: string;
  status?: string;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
  questions_count?: number;
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

export default function AdminViewExternalExamPage() {
  const params = useParams();
  const examId = params?.examId as string;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExternalExam | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cbt/external/exams/${examId}`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.message ?? "Failed to load exam.");
          if (res.status === 401) toast.error("Please log in again.");
          return;
        }
        const data = (json?.exam ?? json?.data ?? json) as ExternalExam;
        setExam(data);
      } catch {
        setError("Network error loading exam.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (examId) void load();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const displayTitle = exam?.title ?? exam?.name ?? `External Exam #${examId}`;

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

  if (error || !exam) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
            External CBT
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate">Exam #{examId}</span>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 mb-4">{error ?? "Exam not found."}</p>
            <Link href={`${CBT_BASE}/admin/external`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
          External CBT
        </Link>
        <span>/</span>
        <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900">
          List
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate">{displayTitle}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{displayTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary">External CBT</Badge>
            <Badge variant="outline" className="capitalize">
              {String(exam.status ?? "—")}
            </Badge>
            {exam.is_locked && (
              <Badge variant="secondary">Locked</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`${CBT_BASE}/admin/external`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link href={`${CBT_BASE}/admin/external/exams/${examId}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="w-4 h-4 mr-2" />
              Update
            </Button>
          </Link>
          <Link href={`${CBT_BASE}/admin/external/exams/${examId}/questions`}>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Questions & options
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</p>
              <p className="text-slate-900">{exam.name ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Title</p>
              <p className="text-slate-900">{exam.title ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course</p>
              <p className="text-slate-900">{exam.course_name ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Year</p>
              <p className="text-slate-900">{exam.year ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</p>
              <p className="text-slate-900">{exam.duration != null ? `${exam.duration} min` : "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total marks</p>
              <p className="text-slate-900">{exam.total_marks ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start time</p>
              <p className="text-slate-900">{exam.start_time ? formatExamTimeExact(exam.start_time) : "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">End time</p>
              <p className="text-slate-900">{exam.end_time ? formatExamTimeExact(exam.end_time) : "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
              <p className="text-slate-900 capitalize">{exam.status ?? "—"}</p>
            </div>
            {exam.questions_count != null && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Questions</p>
                <p className="text-slate-900">{exam.questions_count}</p>
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</p>
              <p className="text-slate-900 whitespace-pre-wrap">{exam.description ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
