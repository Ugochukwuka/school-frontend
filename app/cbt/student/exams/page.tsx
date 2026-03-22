"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Clock, Calendar, BookOpen, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CBT_BASE } from "../../cbt-urls";
import { formatExamTime } from "@/app/lib/time";

/** Shape from GET /api/cbt/exams/available (backend /exams/available) */
interface AvailableExam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  start_time: string;
  end_time: string;
  status: string;
  is_locked: boolean;
  subject: { id: number; name: string; code?: string };
  class_level?: { id: number; name: string; arm?: string };
  instructions?: string;
  published_at?: string;
}

/** Shape for in-progress attempt (GET /api/cbt/attempts?status=in_progress). Backend may use id or attempt_id. */
interface InProgressAttempt {
  id?: number;
  attempt_id?: number;
  exam_id?: number;
  examId?: number;
  status?: string;
  attempt_status?: string;
  state?: string;
  exam?: {
    id: number;
    title: string;
    description?: string;
    duration_minutes?: number;
    total_marks?: number;
    subject?: { name: string };
    start_time?: string;
    end_time?: string;
  };
}

/** Unified exam card item: from available list or from ongoing attempt */
type ExamListItem =
  | {
      type: "available" | "upcoming" | "ended";
      id: number;
      title: string;
      subject: string;
      description: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
      attemptId?: undefined;
    }
  | {
      type: "in-progress";
      id: number;
      title: string;
      subject: string;
      description: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
      attemptId: number;
    };

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

function getAttemptId(a: any): number | null {
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

/**
 * Derives display status for exams from /exams/available.
 * Backend is source of truth: if the exam is in the available list, we never show "ended"
 * (only "upcoming" before start_time, else "available" with Start Exam).
 */
function deriveExamStatus(startTime: string, _endTime: string): "available" | "upcoming" | "ended" {
  const now = Date.now();
  const startMs = startTime ? new Date(startTime).getTime() : 0;
  if (Number.isFinite(startMs) && now < startMs) return "upcoming";
  return "available";
}

export default function StudentExamListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [ongoingAttempts, setOngoingAttempts] = useState<InProgressAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setError(null);
      setLoading(true);
      try {
        const [examsRes, attemptsRes] = await Promise.all([
          fetch("/api/cbt/exams/available", {
            headers: getAuthHeaders(),
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/cbt/attempts", {
            headers: getAuthHeaders(),
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (cancelled) return;

        const examsJson = await examsRes.json().catch(() => ({}));
        // Consume /exams/available: accept data array from common response shapes
        const dataArray =
          Array.isArray(examsJson?.data)
            ? examsJson.data
            : Array.isArray(examsJson?.data?.exams)
              ? examsJson.data.exams
              : Array.isArray(examsJson?.exams)
                ? examsJson.exams
                : Array.isArray(examsJson)
                  ? examsJson
                  : null;
        if (dataArray) {
          setAvailableExams(dataArray);
        }
        if (!examsRes.ok) {
          setError(examsJson?.message ?? "Failed to load available exams.");
          if (examsRes.status === 401) toast.error("Please log in again.");
        }

        // Ongoing exams: list from GET /attempts?status=in_progress; resume uses GET /attempts/:attemptId/resume on exam page
        const attemptsJson = await attemptsRes.json().catch(() => ({}));
        if (attemptsRes.ok && attemptsJson?.status) {
          setOngoingAttempts(extractArrayFromResponse(attemptsJson));
        }
      } catch (e) {
        if (!cancelled) {
          setError("Network error loading exams.");
          toast.error("Could not load exams.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const listItems = useMemo((): ExamListItem[] => {
    const items: ExamListItem[] = [];

    const filteredAttempts = ongoingAttempts.filter((a) => isInProgressAttempt(a));
    const examIdToAttempt = new Map<number, InProgressAttempt>();
    for (const a of filteredAttempts) {
      const eid = getAttemptExamId(a);
      if (eid == null) continue;
      examIdToAttempt.set(eid, a);
    }

    for (const exam of availableExams) {
      if (exam == null || exam.id == null) continue;
      const attempt = examIdToAttempt.get(exam.id);
      const startTime = exam.start_time;
      const endTime = exam.end_time;

      const aid = attempt != null ? getAttemptId(attempt) ?? undefined : undefined;
      if (attempt && aid != null) {
        items.push({
          type: "in-progress",
          id: exam.id,
          title: exam.title,
          subject: exam.subject?.name ?? "—",
          description: exam.description ?? "",
          duration: exam.duration_minutes,
          totalMarks: exam.total_marks,
          startTime,
          endTime,
          attemptId: aid,
        });
        continue;
      }

      const status = deriveExamStatus(startTime, endTime);
      items.push({
        type: status,
        id: exam.id,
        title: exam.title,
        subject: exam.subject?.name ?? "—",
        description: exam.description ?? "",
        duration: exam.duration_minutes,
        totalMarks: exam.total_marks,
        startTime,
        endTime,
      });
    }

    // Include ongoing attempts whose exam might not be in available list (e.g. exam window passed but attempt still open)
    for (const attempt of filteredAttempts) {
      const aid = getAttemptId(attempt);
      if (aid == null) continue;
      const eid = getAttemptExamId(attempt);
      if (eid == null) continue;
      if (items.some((i) => i.id === eid && "attemptId" in i)) continue;
      const exam = attempt.exam;
      items.unshift({
        type: "in-progress",
        id: eid,
        title: exam?.title ?? `Exam #${eid}`,
        subject: exam?.subject?.name ?? "—",
        description: exam?.description ?? "",
        duration: exam?.duration_minutes ?? 0,
        totalMarks: exam?.total_marks ?? 0,
        startTime: exam?.start_time ?? "",
        endTime: exam?.end_time ?? "",
        attemptId: aid,
      });
    }

    return items;
  }, [availableExams, ongoingAttempts]);

  const subjects = useMemo(() => {
    const set = new Set(listItems.map((e) => e.subject).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [listItems]);

  const filteredExams = useMemo(() => {
    return listItems.filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === "all" || exam.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });
  }, [listItems, searchTerm, filterSubject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
      case "ended":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getActionButton = (exam: ExamListItem) => {
    if (exam.type === "available") {
      return (
        <Link href={`${CBT_BASE}/student/exam/${exam.id}`}>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start Exam
          </Button>
        </Link>
      );
    }
    if (exam.type === "in-progress" && exam.attemptId != null) {
      return (
        <Link href={`${CBT_BASE}/student/exam/${exam.id}?resume=${exam.attemptId}`}>
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            <Clock className="w-4 h-4 mr-2" />
            Resume Exam
          </Button>
        </Link>
      );
    }
    if (exam.type === "ended") {
      return (
        <Button variant="outline" className="w-full" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Ended
        </Button>
      );
    }
    return (
      <Button variant="outline" className="w-full" disabled>
        Not Yet Available
      </Button>
    );
  };

  const displayStatus = (item: ExamListItem) =>
    item.type === "ended" ? "ended" : item.type === "in-progress" ? "in progress" : item.type;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error && listItems.length === 0) {
    return (
      <div className="space-y-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Available Exams</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Could not load exams</h3>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Available Exams</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">View and take your scheduled exams</p>
      </div>

      <Card className="!bg-slate-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:ring-offset-0 outline-none shadow-none"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full md:w-48 h-10 rounded-lg bg-white border border-slate-300 text-slate-800 data-[placeholder]:text-slate-500 focus:ring-2 focus:ring-slate-100 focus:border-slate-400 shadow-none">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject === "all" ? "All Subjects" : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card key={exam.type === "in-progress" ? `attempt-${exam.attemptId}` : `exam-${exam.id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary">{exam.subject}</Badge>
                <Badge className={getStatusColor(exam.type)}>{displayStatus(exam)}</Badge>
              </div>
              <CardTitle className="text-lg">{exam.title}</CardTitle>
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
                  <span>Total Marks: {exam.totalMarks}</span>
                </div>
                {exam.startTime && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatExamTime(exam.startTime)}
                    </span>
                  </div>
                )}
              </div>
              {getActionButton(exam)}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No exams found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
