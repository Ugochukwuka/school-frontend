"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Switch } from "../../../../../components/ui/switch";
import { toast } from "sonner";
import { CBT_BASE } from "../../../../../cbt-urls";
import { ArrowLeft, Loader2 } from "lucide-react";

const EXAM_NAME_OPTIONS = ["COMMON ENTRANCE", "BECE", "WAEC", "NECO", "JAMB"] as const;

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
};

/** Convert API datetime to datetime-local value (YYYY-MM-DDTHH:mm). */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const s = iso.trim();
  const match = s.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}):(\d{2})/);
  if (match) return `${match[1]}T${match[2].padStart(2, "0")}:${match[3]}`;
  if (s.length >= 16) return s.slice(0, 16);
  return "";
}

/** Convert datetime-local value (YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss) to MySQL format (YYYY-MM-DD HH:mm:ss) for API. */
function fromDatetimeLocal(local: string): string | undefined {
  if (!local || local.length < 16) return undefined;
  const s = local.trim();
  const datePart = s.slice(0, 10);
  const timePart = s.slice(11, 16);
  const seconds = s.length >= 19 && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(s) ? s.slice(17, 19) : "00";
  return `${datePart} ${timePart}:${seconds}`;
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

export default function AdminEditExternalExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<ExternalExam | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [isLocked, setIsLocked] = useState(false);

  const loadExam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cbt/external/exams/${examId}`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message ?? "Failed to load exam.");
        if (res.status === 401) toast.error("Please log in again.");
        return;
      }
      const data = (json?.exam ?? json?.data ?? json) as ExternalExam;
      setExam(data);
      setName(data.name ?? "");
      setTitle(data.title ?? "");
      setCourseName(data.course_name ?? "");
      setYear(String(data.year ?? ""));
      setDuration(typeof data.duration === "number" ? data.duration : 60);
      setTotalMarks(typeof data.total_marks === "number" ? data.total_marks : 100);
      setDescription(data.description ?? "");
      setStartTime(toDatetimeLocal(data.start_time));
      setEndTime(toDatetimeLocal(data.end_time));
      setStatus(data.status ?? "draft");
      setIsLocked(!!data.is_locked);
    } catch {
      setError("Network error loading exam.");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) void loadExam();
  }, [examId, loadExam]);

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim() || undefined,
        title: title.trim() || undefined,
        course_name: courseName.trim() || undefined,
        year: year.trim() || undefined,
        duration,
        total_marks: totalMarks,
        description: description.trim() || undefined,
        start_time: fromDatetimeLocal(startTime),
        end_time: fromDatetimeLocal(endTime),
        status: status || undefined,
        is_locked: isLocked,
      };
      const res = await fetch(`/api/cbt/external/exams/${examId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message ?? "Failed to update exam.";
        toast.error(msg);
        return;
      }
      const updated = (json?.exam ?? json?.data ?? json) as ExternalExam;
      setExam(updated);
      // Re-sync datetime-local inputs with what backend returns (avoids UI showing stale values).
      setStartTime(toDatetimeLocal(updated.start_time));
      setEndTime(toDatetimeLocal(updated.end_time));
      toast.success("External exam updated.");
      router.push(`${CBT_BASE}/admin/external/exams/${examId}`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !exam) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
            External CBT
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate">Edit #{examId}</span>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => loadExam()}>
                Retry
              </Button>
              <Link href={`${CBT_BASE}/admin/external`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayTitle = exam?.title ?? exam?.name ?? `Edit Exam #${examId}`;
  const fieldClass =
    "h-11 rounded-lg border border-slate-300 bg-white shadow-sm focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:shadow-none focus-visible:outline-none";
  const textareaClass =
    "rounded-lg border border-slate-300 bg-white shadow-sm focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:shadow-none focus-visible:outline-none";
  const selectTriggerClass =
    "h-11 rounded-lg border border-slate-300 bg-white shadow-sm focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:shadow-none focus-visible:outline-none";

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
        <Link href={`${CBT_BASE}/admin/external/exams/${examId}`} className="hover:text-slate-900 truncate">
          {displayTitle}
        </Link>
        <span>/</span>
        <span className="text-slate-900">Edit</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Update exam</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`${CBT_BASE}/admin/external/exams/${examId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger id="name" className={selectTriggerClass}>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent
                side="top"
                sideOffset={8}
                position="popper"
                avoidCollisions
                collisionPadding={16}
                className="rounded-xl border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-200/60"
              >
                {EXAM_NAME_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WAEC Maths 2024"
              className={fieldClass}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course">Course name</Label>
              <Input
                id="course"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Mathematics"
                className={fieldClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "0", 10))}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marks">Total marks</Label>
              <Input
                id="marks"
                type="number"
                min={0}
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value || "0", 10))}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">End time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className={selectTriggerClass}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent
                  side="top"
                  sideOffset={8}
                  position="popper"
                  avoidCollisions
                  collisionPadding={16}
                  className="rounded-xl border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-200/60"
                >
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-300 bg-white px-4 h-11 shadow-sm">
              <Label htmlFor="locked" className="cursor-pointer">
                Locked
              </Label>
              <Switch id="locked" checked={isLocked} onCheckedChange={setIsLocked} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className={textareaClass}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={save}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            <Link href={`${CBT_BASE}/admin/external/exams/${examId}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
