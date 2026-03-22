"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
import { Copy, Trash2, MoreVertical, Loader2, Send, Ban, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cbtTeacher } from "@/app/lib/cbtApi";
import { formatBackendLocalForDateTimeLocal } from "@/app/lib/dateUtils";

const CBT_BASE = "/cbt";

/** Exam from preview or update response */
type ExamState = {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  duration_minutes: number;
  total_marks: number;
  start_time?: string;
  end_time?: string;
  status?: string;
  published_at?: string | null;
  subject?: { id: number; name: string };
  class_level?: { id: number; name: string; arm?: string };
  questions?: Array<{
    id: number;
    question_type?: string;
    question_text?: string;
    marks?: number;
    options?: Array<{ id: number; option_label?: string; option_text?: string; is_correct?: boolean }>;
  }>;
};

export default function TeacherExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;
  const id = examId ? parseInt(examId, 10) : NaN;

  const [exam, setExam] = useState<ExamState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    duration_minutes: 30,
    total_marks: 0,
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await cbtTeacher.previewExam(id);
        if (cancelled) return;
        const payload = res.data as { data?: { exam?: ExamState; questions?: ExamState["questions"] } };
        const data = payload?.data ?? (res.data as { data?: { exam?: ExamState; questions?: ExamState["questions"] } })?.data;
        const loadedExam = data?.exam ?? null;
        const questions = data?.questions ?? [];
        if (loadedExam) {
          setExam({ ...loadedExam, questions });
          setForm({
            title: loadedExam.title ?? "",
            description: loadedExam.description ?? "",
            instructions: loadedExam.instructions ?? "",
            duration_minutes: loadedExam.duration_minutes ?? 30,
            total_marks: loadedExam.total_marks ?? 0,
            start_time: formatBackendLocalForDateTimeLocal(loadedExam.start_time),
            end_time: formatBackendLocalForDateTimeLocal(loadedExam.end_time),
          });
        } else {
          setExam(null);
        }
      } catch {
        if (!cancelled) {
          setExam(null);
          toast.error("Failed to load exam.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, [id]);

  const handleClone = async () => {
    if (!id || isNaN(id)) return;
    setActionLoading(true);
    try {
      const res = await cbtTeacher.cloneExam(id);
      const cloned = (res.data as { data?: { id?: number }; id?: number })?.data?.id ?? (res.data as { id?: number })?.id;
      toast.success("Exam cloned as draft");
      if (cloned) router.push(`${CBT_BASE}/teacher/exams/${cloned}`);
      else router.push(`${CBT_BASE}/teacher/exams`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to clone exam";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isNaN(id)) return;
    setShowDeleteDialog(false);
    setActionLoading(true);
    try {
      await cbtTeacher.deleteExam(id);
      toast.success("Exam deleted");
      router.push(`${CBT_BASE}/teacher/exams`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to delete exam";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!id || isNaN(id)) return;
    setActionLoading(true);
    try {
      await cbtTeacher.publishExam(id);
      toast.success("Exam published");
      if (exam) setExam({ ...exam, status: "published", published_at: new Date().toISOString() });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to publish exam";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!id || isNaN(id)) return;
    setActionLoading(true);
    try {
      await cbtTeacher.unpublishExam(id);
      toast.success("Exam unpublished");
      if (exam) setExam({ ...exam, status: "draft", published_at: null });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to unpublish exam";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNaN(id)) return;
    setSaving(true);
    try {
      const res = await cbtTeacher.updateExam(id, {
        title: form.title,
        description: form.description || undefined,
        instructions: form.instructions || undefined,
        duration_minutes: form.duration_minutes,
        total_marks: form.total_marks,
        start_time: form.start_time ? (form.start_time.includes(":00") ? form.start_time : `${form.start_time}:00`) : undefined,
        end_time: form.end_time ? (form.end_time.includes(":00") ? form.end_time : `${form.end_time}:00`) : undefined,
      });
      const updated = (res.data as { data?: ExamState })?.data;
      if (updated) {
        setExam((prev) => (prev ? { ...prev, ...updated, questions: prev.questions } : null));
        setForm({
          title: updated.title ?? form.title,
          description: updated.description ?? "",
          instructions: updated.instructions ?? "",
          duration_minutes: updated.duration_minutes ?? form.duration_minutes,
          total_marks: updated.total_marks ?? form.total_marks,
          start_time: formatBackendLocalForDateTimeLocal(updated.start_time) || form.start_time,
          end_time: formatBackendLocalForDateTimeLocal(updated.end_time) || form.end_time,
        });
      }
      toast.success((res.data as { message?: string })?.message ?? "Exam updated successfully.");
      setTimeout(() => {
        router.push(`${CBT_BASE}/teacher/exams`);
      }, 5000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update exam.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Exam not found</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">This exam may have been deleted or you do not have access.</p>
            <Link href={`${CBT_BASE}/teacher/exams`}>
              <Button className="mt-4">Back to My Exams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classLabel = exam.class_level
    ? `${exam.class_level.name ?? ""} ${exam.class_level.arm ?? ""}`.trim()
    : "—";
  const subjectName = exam.subject?.name ?? "—";
  const status = exam.status ?? "draft";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${CBT_BASE}/teacher/exams`}>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-700">
            ← Back to My Exams
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{exam.title || "Edit Exam"}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {subjectName !== "—" && <Badge variant="secondary" className="font-normal">{subjectName}</Badge>}
            {classLabel !== "—" && <Badge variant="secondary" className="font-normal">{classLabel}</Badge>}
            {status === "draft" && <Badge className="bg-slate-100 text-slate-700">Draft</Badge>}
            {status === "published" && <Badge className="bg-green-100 text-green-700">Published</Badge>}
            {status === "completed" && <Badge className="bg-blue-100 text-blue-700">Completed</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleClone} disabled={actionLoading}>
                <Copy className="w-4 h-4 mr-2" />
                Clone exam
              </DropdownMenuItem>
              {status === "draft" && (
                <DropdownMenuItem onClick={handlePublish} disabled={actionLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish exam
                </DropdownMenuItem>
              )}
              {(status === "published" || status === "completed") && (
                <DropdownMenuItem onClick={handleUnpublish} disabled={actionLoading}>
                  <Ban className="w-4 h-4 mr-2" />
                  Unpublish exam
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteDialog(true)} disabled={actionLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete exam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="shadow-md border-slate-200/90 rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-200/80 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Exam details</CardTitle>
          <CardDescription className="text-slate-600">Edit the fields below and click Update to save changes.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-medium">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Exam title"
                className="max-w-md rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-shadow shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the exam"
                rows={2}
                className="max-w-md rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-shadow shadow-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-slate-700 font-medium">Instructions</Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                placeholder="Instructions for students"
                rows={3}
                className="max-w-md rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-shadow shadow-sm resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes" className="text-slate-700 font-medium">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value, 10) || 0 }))}
                  className="w-28 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_marks" className="text-slate-700 font-medium">Total marks</Label>
                <Input
                  id="total_marks"
                  type="number"
                  min={0}
                  value={form.total_marks}
                  onChange={(e) => setForm((f) => ({ ...f, total_marks: parseInt(e.target.value, 10) || 0 }))}
                  className="w-28 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-slate-700 font-medium">Start time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="max-w-xs rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-slate-700 font-medium">End time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="max-w-xs rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving} className="gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm min-w-[120px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>{(exam.questions?.length ?? 0)} questions</CardDescription>
        </CardHeader>
        <CardContent>
          {!exam.questions?.length ? (
            <p className="text-slate-600">No questions added yet. Add questions from the question bank or create new ones on the exam edit flow.</p>
          ) : (
            <ul className="space-y-4">
              {exam.questions.map((q, idx) => (
                <li key={q.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">Q{idx + 1}.</span>
                    <Badge variant="secondary" className="text-xs font-normal">{q.question_type ?? "mcq"}</Badge>
                    <Badge variant="outline" className="text-xs font-normal">{q.marks ?? 0} mark{(q.marks ?? 0) !== 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{q.question_text || "—"}</p>
                  {q.options && q.options.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 text-sm">
                      {q.options.map((opt) => (
                        <li key={opt.id} className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{opt.option_label ?? "—"}.</span>
                          <span>{opt.option_text ?? "—"}</span>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to delete this exam? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-lg border-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
