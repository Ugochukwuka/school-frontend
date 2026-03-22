"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Copy,
  Trash,
  MoreVertical,
  FileText,
  Loader2,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cbtTeacherListExams, cbtTeacher } from "@/app/lib/cbtApi";
import { formatBackendLocalExamDisplay } from "@/app/lib/dateUtils";

const CBT_BASE = "/cbt";

/** API response shape from GET /api/teacher/exams or ?status=draft|published|completed */
interface TeacherExamsResponse {
  status?: boolean;
  message?: string;
  data?: {
    exams?: { data: ApiExam[]; total?: number };
    counts?: { all: number; draft: number; published: number; completed: number };
  };
}

interface ApiExam {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  start_time: string;
  end_time: string;
  status: "draft" | "published" | "completed";
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  subject?: { id: number; name: string };
  class_level?: { id: number; name: string; arm?: string };
  creator?: { id: number; name: string; email?: string };
}

/** Normalized exam for the UI (Completion remains static until we have an endpoint) */
interface DisplayExam {
  id: number;
  title: string;
  subject: string;
  class: string;
  status: "draft" | "published" | "completed";
  createdAt: string;
  duration_minutes: number;
  total_marks: number;
  total_questions?: number;
  start_time?: string;
  end_time?: string;
}

function mapApiExamToDisplay(exam: ApiExam): DisplayExam {
  const subject = exam.subject?.name ?? "—";
  const cl = exam.class_level;
  const classLabel = cl ? (cl.arm ? `${cl.name} ${cl.arm}` : cl.name) : "—";
  return {
    id: exam.id,
    title: exam.title,
    subject,
    class: classLabel,
    status: exam.status,
    createdAt: exam.created_at,
    duration_minutes: exam.duration_minutes,
    total_marks: exam.total_marks,
    start_time: exam.start_time,
    end_time: exam.end_time,
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "draft": return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
    case "published": return <Badge className="bg-green-100 text-green-700">Published</Badge>;
    case "completed": return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
    default: return null;
  }
}

/** Static until we have an endpoint for completion data */
const STATIC_COMPLETION = { completed: 32, total: 45 };

function ExamGrid({
  examsList,
  loading,
  onPublish,
  publishingId,
  onUnpublish,
  unpublishingId,
  onClone,
  cloningId,
  onDeleteClick,
  onDelete,
  deletingId,
}: {
  examsList: DisplayExam[];
  loading?: boolean;
  onPublish?: (examId: number) => Promise<void>;
  publishingId?: number | null;
  onUnpublish?: (examId: number) => Promise<void>;
  unpublishingId?: number | null;
  onClone?: (examId: number) => Promise<void>;
  cloningId?: number | null;
  onDeleteClick?: (examId: number) => void;
  onDelete?: (examId: number) => Promise<void>;
  deletingId?: number | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }
  if (examsList.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No exams found</h3>
          <p className="text-slate-600">Create a new exam to get started</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {examsList.map((exam) => (
        <Card key={exam.id} className="rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <Badge variant="secondary" className="font-normal text-slate-700 bg-slate-100">
                  {exam.subject}
                </Badge>
                <Badge variant="secondary" className="font-normal text-slate-600 bg-slate-100">
                  {exam.class}
                </Badge>
                {getStatusBadge(exam.status)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={6}
                  collisionPadding={16}
                  className="min-w-[12.5rem] z-[100] rounded-xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 p-1.5"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${CBT_BASE}/teacher/exams/${exam.id}/preview`}
                      className="flex items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      <Eye className="w-4 h-4 mr-2.5 shrink-0 text-slate-500" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${CBT_BASE}/teacher/exams/${exam.id}`}
                      className="flex items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      <Edit className="w-4 h-4 mr-2.5 shrink-0 text-slate-500" />
                      Edit Exam
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={cloningId === exam.id}
                    onClick={(e) => {
                      e.preventDefault();
                      onClone?.(exam.id);
                    }}
                    className="flex items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                  >
                    {cloningId === exam.id ? (
                      <Loader2 className="w-4 h-4 mr-2.5 shrink-0 animate-spin text-slate-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2.5 shrink-0 text-slate-500" />
                    )}
                    Clone Exam
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={exam.status === "draft" || unpublishingId === exam.id}
                    onClick={(e) => {
                      if (exam.status === "draft") return;
                      e.preventDefault();
                      onUnpublish?.(exam.id);
                    }}
                    className="flex items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                  >
                    {unpublishingId === exam.id ? (
                      <Loader2 className="w-4 h-4 mr-2.5 shrink-0 animate-spin text-slate-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-2.5 shrink-0 text-slate-500" />
                    )}
                    Unpublish
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 bg-slate-200/80" />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={deletingId === exam.id}
                    onClick={(e) => {
                      e.preventDefault();
                      onDeleteClick?.(exam.id);
                    }}
                    className="flex items-center rounded-lg px-2.5 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 hover:bg-red-50 hover:text-red-700 data-[variant=destructive]:text-red-600"
                  >
                    {deletingId === exam.id ? (
                      <Loader2 className="w-4 h-4 mr-2.5 shrink-0 animate-spin" />
                    ) : (
                      <Trash className="w-4 h-4 mr-2.5 shrink-0" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="text-base font-bold text-slate-900 mt-2">{exam.title}</CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-0.5">
              Created {new Date(exam.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs font-medium">Questions</p>
                <p className="font-semibold text-slate-900 mt-0.5">{exam.total_questions ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Duration</p>
                <p className="font-semibold text-slate-900 mt-0.5">{exam.duration_minutes} mins</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Marks</p>
                <p className="font-semibold text-slate-900 mt-0.5">{exam.total_marks}</p>
              </div>
            </div>
            {(exam.start_time || exam.end_time) && (
              <div className="text-sm">
                <p className="text-slate-500 text-xs font-medium">Available</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {formatBackendLocalExamDisplay(exam.start_time)} – {formatBackendLocalExamDisplay(exam.end_time)}
                </p>
              </div>
            )}
            {(exam.status === "published" || exam.status === "completed") ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Completion</span>
                    <span className="font-medium text-slate-900">{STATIC_COMPLETION.completed}/{STATIC_COMPLETION.total} students</span>
                  </div>
                  <Progress value={(STATIC_COMPLETION.completed / STATIC_COMPLETION.total) * 100} className="h-2" />
                </div>
                <Link href={`${CBT_BASE}/teacher/exams/${exam.id}/preview`} className="block">
                  <Button variant="outline" className="w-full justify-center border-slate-300 text-slate-800 rounded-md">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <Link href={`${CBT_BASE}/teacher/exams/${exam.id}`} className="block">
                  <Button variant="outline" className="w-full justify-center border-slate-300 text-slate-800 rounded-md">
                    <Edit className="w-4 h-4 mr-2" />
                    Continue Editing
                  </Button>
                </Link>
                <Button
                  className="w-full justify-center bg-green-600 hover:bg-green-700 text-white rounded-md"
                  disabled={publishingId === exam.id}
                  onClick={(e) => {
                    e.preventDefault();
                    onPublish?.(exam.id);
                  }}
                >
                  {publishingId === exam.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    "Publish Exam"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type TabValue = "all" | "draft" | "active" | "completed";

const TAB_TO_STATUS: Record<TabValue, string | null> = {
  all: null,
  draft: "draft",
  active: "published",
  completed: "completed",
};

export default function TeacherExamListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [unpublishingId, setUnpublishingId] = useState<number | null>(null);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const statuses: { value: TabValue; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Published" },
    { value: "completed", label: "Completed" },
  ];

  const fetchExams = useCallback(async (tab: TabValue) => {
    setLoading(true);
    const statusParam = TAB_TO_STATUS[tab];
    try {
      const res = await cbtTeacherListExams({
        per_page: 100,
        page: 1,
        ...(statusParam ? { status: statusParam } : {}),
      } as { per_page?: number; page?: number; status?: string });
      const json = res.data as TeacherExamsResponse & { data?: { data?: ApiExam[]; exams?: { data?: ApiExam[] }; counts?: { all: number; draft: number; published: number; completed: number } } };
      const data = json.data ?? json;
      const list = data?.exams?.data ?? data?.data ?? [];
      const nextCounts = data?.counts;
      setExams((Array.isArray(list) ? list : []).map(mapApiExamToDisplay));
      if (nextCounts) setCounts(nextCounts);
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams(activeTab);
  }, [activeTab, fetchExams]);

  const handlePublish = useCallback(
    async (examId: number) => {
      setPublishingId(examId);
      try {
        const res = await cbtTeacher.publishExam(examId);
        const data = res.data as { status?: boolean; message?: string; data?: unknown };
        if (data?.status) {
          await fetchExams(activeTab);
        }
      } catch {
        // Error already surfaced by API; refetch to keep list in sync
        await fetchExams(activeTab);
      } finally {
        setPublishingId(null);
      }
    },
    [activeTab, fetchExams]
  );

  const handleUnpublish = useCallback(
    async (examId: number) => {
      setUnpublishingId(examId);
      try {
        const res = await cbtTeacher.unpublishExam(examId);
        const data = res.data as { status?: boolean; message?: string; data?: unknown };
        if (data?.status) {
          toast.success(data?.message ?? "Exam unpublished successfully. It is no longer visible to students.");
          await fetchExams(activeTab);
        } else {
          toast.error((data as { message?: string })?.message ?? "Failed to unpublish exam.");
        }
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to unpublish exam.";
        toast.error(msg);
        await fetchExams(activeTab);
      } finally {
        setUnpublishingId(null);
      }
    },
    [activeTab, fetchExams]
  );

  const handleClone = useCallback(
    async (examId: number) => {
      setCloningId(examId);
      try {
        const res = await cbtTeacher.cloneExam(examId);
        const data = res.data as { status?: boolean; message?: string; data?: { id?: number } };
        if (data?.status && data?.data?.id) {
          toast.success("Exam cloned successfully.");
          await fetchExams(activeTab);
        } else {
          toast.error((data as { message?: string })?.message ?? "Failed to clone exam.");
        }
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to clone exam.";
        toast.error(msg);
        await fetchExams(activeTab);
      } finally {
        setCloningId(null);
      }
    },
    [activeTab, fetchExams]
  );

  const handleDelete = useCallback(
    async (examId: number) => {
      setDeletingId(examId);
      try {
        await cbtTeacher.deleteExam(examId);
        toast.success("Exam deleted.");
        await fetchExams(activeTab);
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to delete exam.";
        toast.error(msg);
        await fetchExams(activeTab);
      } finally {
        setDeletingId(null);
      }
    },
    [activeTab, fetchExams]
  );

  const handleDeleteConfirm = useCallback(async () => {
    const id = examToDelete;
    if (id == null) return;
    setExamToDelete(null);
    await handleDelete(id);
  }, [examToDelete, handleDelete]);

  const filteredExams = exams.filter((exam) => {
    const term = searchTerm.toLowerCase();
    return (
      exam.title.toLowerCase().includes(term) ||
      exam.subject.toLowerCase().includes(term) ||
      exam.class.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Exams</h1>
          <p className="text-slate-600 mt-1">Manage all your exams and assessments</p>
        </div>
        <Link href={`${CBT_BASE}/teacher/exams/create`}>
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="rounded-lg bg-slate-100/80 border border-slate-200/80 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-10 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <SelectTrigger className="w-full sm:w-44 h-10 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-sm font-medium data-[placeholder]:text-slate-600">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4} align="start" className="min-w-[var(--radix-select-trigger-width)] bg-white rounded-md border border-slate-200 shadow-lg">
              {statuses.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="text-slate-800 data-[highlighted]:bg-slate-100 data-[state=checked]:bg-slate-100"
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6 w-full min-w-0">
        <div className="rounded-full bg-slate-200/90 p-1.5 sm:p-2 w-fit max-w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none border-0 shadow-none flex flex-nowrap justify-start min-h-0">
            <TabsTrigger
              value="all"
              className="rounded-full border-0 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="rounded-full border-0 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Drafts ({counts.draft})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-full border-0 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Active ({counts.published})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-full border-0 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Completed ({counts.completed})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all">
          <ExamGrid examsList={filteredExams} loading={loading} onPublish={handlePublish} publishingId={publishingId} onUnpublish={handleUnpublish} unpublishingId={unpublishingId} onClone={handleClone} cloningId={cloningId} onDeleteClick={(id) => setExamToDelete(id)} onDelete={handleDelete} deletingId={deletingId} />
        </TabsContent>
        <TabsContent value="draft">
          <ExamGrid examsList={filteredExams} loading={loading} onPublish={handlePublish} publishingId={publishingId} onUnpublish={handleUnpublish} unpublishingId={unpublishingId} onClone={handleClone} cloningId={cloningId} onDeleteClick={(id) => setExamToDelete(id)} onDelete={handleDelete} deletingId={deletingId} />
        </TabsContent>
        <TabsContent value="active">
          <ExamGrid examsList={filteredExams} loading={loading} onPublish={handlePublish} publishingId={publishingId} onUnpublish={handleUnpublish} unpublishingId={unpublishingId} onClone={handleClone} cloningId={cloningId} onDeleteClick={(id) => setExamToDelete(id)} onDelete={handleDelete} deletingId={deletingId} />
        </TabsContent>
        <TabsContent value="completed">
          <ExamGrid examsList={filteredExams} loading={loading} onPublish={handlePublish} publishingId={publishingId} onUnpublish={handleUnpublish} unpublishingId={unpublishingId} onClone={handleClone} cloningId={cloningId} onDeleteClick={(id) => setExamToDelete(id)} onDelete={handleDelete} deletingId={deletingId} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={examToDelete != null} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl border-slate-200/90 bg-white p-0 overflow-hidden shadow-xl shadow-slate-300/30">
          <div className="p-6 sm:p-7">
            <AlertDialogHeader className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                    Delete exam?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                    Are you sure you want to delete this exam? This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex flex-row gap-3 justify-end px-6 sm:px-7 py-4 bg-slate-50/80 border-t border-slate-200/80">
            <AlertDialogCancel className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 min-w-[4.5rem]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId != null}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500/30 min-w-[5rem] border-0"
            >
              {deletingId != null ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-1.5 shrink-0" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
