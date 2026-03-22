"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { AlertCircle, BookOpen, Calendar, Clock, Loader2, Play, Search } from "lucide-react";
import { toast } from "sonner";
import { formatExamTimeExact } from "@/app/lib/time";

export interface ExternalExam {
  id: number;
  name: string;
  title?: string;
  description?: string;
  duration: number;
  total_marks: number;
  start_time?: string;
  end_time?: string;
  year?: string;
  course_name?: string;
  status?: string;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function extractArray(json: any): any[] {
  const candidates = [json?.data, json?.data?.data, json];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

/** Parse DB datetime as local; return ms. Handles "2026-03-14 16:56:00" or ISO. */
function parseDateTimeMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const s = value.trim();
  if (!s) return null;
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const ms = new Date(normalized).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Visibility rules:
 * - Show exam as long as now < end_time (if end_time is present).
 * - Student may start late: Start button is disabled until now >= start_time.
 * - Fallback: if end_time missing, use start_time + duration as end.
 */
function getExamTimeStatus(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  durationMinutes: number
): "ended" | "upcoming" | "available" {
  const startMs = parseDateTimeMs(startTime);
  const explicitEndMs = parseDateTimeMs(endTime);
  const now = Date.now();

  const durationMs = (durationMinutes || 0) * 60 * 1000;
  const derivedEndMs = startMs != null && durationMs > 0 ? startMs + durationMs : null;
  const endMs = explicitEndMs ?? derivedEndMs;

  // If end time exists and has passed, exam should not show.
  if (endMs != null && now > endMs) return "ended";
  // If start time exists and hasn't reached, show exam but disable Start.
  if (startMs != null && now < startMs) return "upcoming";
  return "available";
}

export function ExternalExamsList({
  title = "External Exams",
  description = "Take external exams from this list",
  takeExamHrefForExamId,
}: {
  title?: string;
  description?: string;
  takeExamHrefForExamId: (examId: number) => string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<ExternalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchExams() {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/cbt/external/exams", {
          headers: getAuthHeaders(),
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.message ?? "Failed to load external exams.");
          if (res.status === 401) toast.error("Please log in again.");
          return;
        }
        setExams(extractArray(json) as ExternalExam[]);
      } catch {
        if (!cancelled) {
          setError("Network error loading external exams.");
          toast.error("Could not load exams.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchExams();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredExams = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return exams.filter((exam) => {
      const t = (exam.title ?? exam.name ?? "").toLowerCase();
      const d = (exam.description ?? "").toLowerCase();
      const c = (exam.course_name ?? "").toLowerCase();
      return t.includes(term) || d.includes(term) || c.includes(term);
    });
  }, [exams, searchTerm]);

  /** Exclude ended exams (current time way past start + duration). Show only upcoming + available. */
  const visibleExams = useMemo(() => {
    return filteredExams.filter((exam) => {
      const status = getExamTimeStatus(exam.start_time, exam.end_time, exam.duration ?? 0);
      return status !== "ended";
    });
  }, [filteredExams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading external exams...</p>
        </div>
      </div>
    );
  }

  if (error && exams.length === 0) {
    return (
      <div className="space-y-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Could not load external exams</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">{description}</p>
      </div>

      <Card className="!bg-slate-50">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search by title, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 rounded-lg bg-white border border-slate-300"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleExams.map((exam) => {
          const displayTitle = exam.title ?? exam.name ?? `Exam #${exam.id}`;
          const isPublished = (exam.status ?? "").toLowerCase() === "published";
          const timeStatus = getExamTimeStatus(exam.start_time, exam.end_time, exam.duration ?? 0);
          const canStart = isPublished && timeStatus === "available";
          return (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{exam.course_name ?? "External"}</Badge>
                  {exam.year && <Badge variant="outline">{exam.year}</Badge>}
                </div>
                <CardTitle className="text-lg">{displayTitle}</CardTitle>
                <CardDescription className="line-clamp-2">{exam.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Total Marks: {exam.total_marks}</span>
                  </div>
                  {exam.start_time && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Starts: {formatExamTimeExact(exam.start_time)}</span>
                    </div>
                  )}
                  {exam.end_time && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Ends: {formatExamTimeExact(exam.end_time)}</span>
                    </div>
                  )}
                </div>
                {canStart ? (
                  <Link href={takeExamHrefForExamId(exam.id)}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Exam
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled
                    title={
                      !isPublished
                        ? "Not available"
                        : timeStatus === "upcoming"
                          ? "Available at start time"
                          : "Not available"
                    }
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {!isPublished ? "Not available" : timeStatus === "upcoming" ? "Not yet available" : "Not available"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visibleExams.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {filteredExams.length === 0 ? "No external exams found" : "No Exams Currently"}
            </h3>
            <p className="text-slate-600">
              {filteredExams.length === 0 ? "Try adjusting your search" : "There are no exams in the current time window. Check back later."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

