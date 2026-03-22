"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { toast } from "sonner";
import { CBT_BASE } from "../../../../cbt-urls";
import { Loader2, PlusCircle } from "lucide-react";

const EXAM_NAME_OPTIONS = ["COMMON ENTRANCE", "BECE", "WAEC", "NECO", "JAMB"] as const;
const STATUS_OPTIONS = ["draft", "published", "archived"] as const;

function datetimeLocalToApi(local: string): string | undefined {
  if (!local || local.length < 16) return undefined;
  // Convert `YYYY-MM-DDTHH:mm` → `YYYY-MM-DD HH:mm:00` to match backend examples.
  return `${local.replace("T", " ")}:00`;
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

export default function AdminCreateExternalExamPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("draft");
  const [isLocked, setIsLocked] = useState(false);
  const [description, setDescription] = useState("");

  const createExam = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name,
        course_name: courseName || undefined,
        title: title || undefined,
        year: year || undefined,
        duration,
        total_marks: totalMarks,
        start_time: datetimeLocalToApi(startTime),
        end_time: datetimeLocalToApi(endTime),
        status: status || undefined,
        is_locked: isLocked ? 1 : 0,
        description: description || undefined,
      };
      const res = await fetch("/api/cbt/external/exams", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message ?? "Failed to create exam.");
      }
      const created = json?.data ?? json;
      const id = created?.id;
      toast.success("External exam created. Add questions and options on the next page.");
      if (id != null) router.push(`${CBT_BASE}/admin/external/exams/${id}/questions`);
      else router.push(`${CBT_BASE}/admin/external`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create exam.");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = name.trim().length > 0;

  return (
    <div className="space-y-6 min-w-0">
      <div className="min-w-0">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="text-slate-600" asChild>
            <Link href={`${CBT_BASE}/admin/external`}>← Back to list</Link>
          </Button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Create External Exam</h1>
        <p className="mt-1.5 text-base text-slate-500 tracking-wide">
          Enter exam details. You can add questions and answers on the next page.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Exam details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-2">
            <Label className="text-slate-700 font-medium">Exam</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              >
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-200/60">
                {EXAM_NAME_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="course" className="text-slate-700 font-medium">Course name</Label>
              <Input
                id="course"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Mathematics"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-700 font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Objective section"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="year" className="text-slate-700 font-medium">Year</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus((v as any) ?? "draft")}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-200/60">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="duration" className="text-slate-700 font-medium">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "0", 10))}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marks" className="text-slate-700 font-medium">Total marks</Label>
              <Input
                id="marks"
                type="number"
                min={0}
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value || "0", 10))}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start_time" className="text-slate-700 font-medium">Start time (optional)</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time" className="text-slate-700 font-medium">End time (optional)</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 h-11 shadow-sm">
            <Label htmlFor="locked" className="cursor-pointer text-slate-700 font-medium">
              Locked
            </Label>
            <Switch
              id="locked"
              checked={isLocked}
              onCheckedChange={setIsLocked}
              className="h-6 w-11 border border-slate-200 data-[state=unchecked]:bg-slate-100 data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc" className="text-slate-700 font-medium">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="min-h-[100px] rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <Button
              onClick={createExam}
              className="h-12 rounded-xl bg-blue-600 px-6 text-lg font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-100 disabled:bg-blue-200 disabled:text-blue-900"
              disabled={saving || !canSubmit}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-5 w-5" aria-hidden />
                  Create Exam
                </>
              )}
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-slate-200" asChild>
              <Link href={`${CBT_BASE}/admin/external`}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
