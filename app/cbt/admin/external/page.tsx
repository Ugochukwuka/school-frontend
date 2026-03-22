"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../components/ui/utils";
import { CBT_BASE } from "../../cbt-urls";
import { formatExamTimeExact } from "@/app/lib/time";

type ExternalExam = {
  id: number;
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
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  links: { url: string | null; label: string; active: boolean; page: number | null }[];
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

function extractPaginated(json: any): { data: any[]; meta: PaginationMeta | null } {
  const dataObj = json?.data;
  const list = Array.isArray(dataObj?.data) ? dataObj.data : Array.isArray(dataObj) ? dataObj : [];
  const meta =
    dataObj && typeof dataObj.current_page === "number"
      ? {
          current_page: dataObj.current_page,
          last_page: dataObj.last_page ?? 1,
          per_page: dataObj.per_page ?? 15,
          total: dataObj.total ?? 0,
          from: dataObj.from ?? null,
          to: dataObj.to ?? null,
          first_page_url: dataObj.first_page_url ?? "",
          last_page_url: dataObj.last_page_url ?? "",
          next_page_url: dataObj.next_page_url ?? null,
          prev_page_url: dataObj.prev_page_url ?? null,
          links: Array.isArray(dataObj.links) ? dataObj.links : [],
        }
      : null;
  return { data: list, meta };
}

const PER_PAGE = 15;

export default function AdminExternalCbtPage() {
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<ExternalExam[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const res = await fetch(
        `/api/cbt/external/exams?per_page=200`,
        { headers: getAuthHeaders(), cache: "no-store" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const { data } = extractPaginated(json);
      const years = Array.from(new Set((data as ExternalExam[]).map((e) => e.year).filter(Boolean))) as string[];
      const courses = Array.from(
        new Set((data as ExternalExam[]).map((e) => e.course_name).filter(Boolean))
      ) as string[];
      setYearOptions(years.sort());
      setCourseOptions(courses.sort());
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(PER_PAGE));
      if (yearFilter) params.set("year", yearFilter);
      if (courseFilter) params.set("course_name", courseFilter);
      const res = await fetch(`/api/cbt/external/exams?${params.toString()}`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        setError(json?.message ?? "Failed to load external exams.");
        if (res.status === 401) toast.error("Please log in again.");
        setExams([]);
        setPagination(null);
        return;
      }
      const { data, meta } = extractPaginated(json);
      setExams((data as ExternalExam[]) ?? []);
      setPagination(meta);
    } catch {
      setError("Network error loading external exams.");
      setExams([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, yearFilter, courseFilter]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cbt/external/exams/${deleteTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to delete.");
      toast.success("External exam deleted.");
      setDeleteTarget(null);
      fetchExams();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete exam.");
    } finally {
      setDeleting(false);
    }
  };

  const pageLinks = useMemo(() => pagination?.links ?? [], [pagination]);
  const canPrev = !!pagination?.prev_page_url;
  const canNext = !!pagination?.next_page_url;

  if (optionsLoading && yearOptions.length === 0 && courseOptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-600">Loading external CBT...</p>
        </div>
      </div>
    );
  }

  if (error && exams.length === 0 && !loading) {
    return (
      <div className="space-y-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">External CBT</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Could not load External CBT</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchExams()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">External CBT</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Manage external exams, questions and options
          </p>
        </div>
        <Link href={`${CBT_BASE}/admin/external/exams/create`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create External Exam
          </Button>
        </Link>
      </div>

      <Card className="!bg-slate-50">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Year</label>
              <Select
                value={yearFilter || "all"}
                onValueChange={(v) => {
                  setYearFilter(v === "all" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-10 rounded-lg bg-white border border-slate-300">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Course</label>
              <Select
                value={courseFilter || "all"}
                onValueChange={(v) => {
                  setCourseFilter(v === "all" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] h-10 rounded-lg bg-white border border-slate-300">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courseOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => {
                setPage(1);
                fetchExams();
              }}
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
        {loading ? (
          <CardContent className="p-12 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="border-b border-slate-200/80 hover:bg-transparent">
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Title
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Course
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Year
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Duration
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Total marks
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Start time
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      End time
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight first:pl-6 last:pr-6 px-4 py-3.5">
                      Status
                    </TableHead>
                    <TableHead className="h-12 bg-slate-50/90 font-semibold text-slate-600 tracking-tight text-right first:pl-6 last:pr-6 px-4 py-3.5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => {
                    const displayTitle = exam.title ?? exam.name ?? `Exam #${exam.id}`;
                    const status = (exam.status ?? "").toLowerCase();
                    const isPublished = status === "published";
                    const isDraft = status === "draft";
                    return (
                      <TableRow
                        key={exam.id}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell className="font-medium text-slate-900 max-w-[200px] truncate pl-6 pr-4 py-3.5" title={displayTitle}>
                          {displayTitle}
                        </TableCell>
                        <TableCell className="text-slate-600 pl-4 pr-4 py-3.5">{exam.course_name ?? "—"}</TableCell>
                        <TableCell className="text-slate-600 pl-4 pr-4 py-3.5">{exam.year ?? "—"}</TableCell>
                        <TableCell className="text-slate-600 pl-4 pr-4 py-3.5">{exam.duration != null ? `${exam.duration} min` : "—"}</TableCell>
                        <TableCell className="text-slate-600 pl-4 pr-4 py-3.5">{exam.total_marks ?? "—"}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-600 pl-4 pr-4 py-3.5">
                          {exam.start_time ? formatExamTimeExact(exam.start_time) : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-600 pl-4 pr-4 py-3.5">
                          {exam.end_time ? formatExamTimeExact(exam.end_time) : "—"}
                        </TableCell>
                        <TableCell className="pl-4 pr-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              isPublished && "bg-emerald-50 text-emerald-700",
                              isDraft && "bg-amber-50 text-amber-700",
                              !isPublished && !isDraft && "bg-slate-100 text-slate-600"
                            )}
                          >
                            {exam.status ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pl-4 pr-6 py-3.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              sideOffset={6}
                              className="min-w-[200px] rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-200/50"
                            >
                              <DropdownMenuItem asChild className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-slate-100">
                                <Link href={`${CBT_BASE}/admin/external/exams/${exam.id}`}>
                                  <Eye className="h-4 w-4 mr-3 text-slate-500" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-slate-100">
                                <Link href={`${CBT_BASE}/admin/external/exams/${exam.id}/edit`}>
                                  <Pencil className="h-4 w-4 mr-3 text-slate-500" />
                                  Update
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-slate-100">
                                <Link href={`${CBT_BASE}/admin/external/exams/${exam.id}/questions`}>
                                  <FileText className="h-4 w-4 mr-3 text-slate-500" />
                                  Questions & options
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-100" />
                              <DropdownMenuItem
                                variant="destructive"
                                className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-red-50 focus:text-red-700"
                                onClick={() => setDeleteTarget({ id: exam.id, title: displayTitle })}
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {exams.length === 0 && (
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No external exams found</h3>
                <p className="text-slate-600">
                  {yearFilter || courseFilter ? "Try changing year or course filters." : "Create an exam to get started."}
                </p>
              </CardContent>
            )}

            {pagination && pagination.last_page > 1 && exams.length > 0 && (
              <CardContent className="border-t flex flex-wrap items-center justify-between gap-4 py-4">
                <p className="text-sm text-slate-600">
                  Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {pageLinks
                    .filter(
                      (l) =>
                        l.page != null &&
                        !l.label.includes("Previous") &&
                        !l.label.includes("Next")
                    )
                    .map((l) => (
                      <Button
                        key={l.page ?? l.label}
                        variant={l.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => l.page != null && setPage(l.page)}
                      >
                        {l.label}
                      </Button>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </>
        )}
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete external exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;. Questions and attempts may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExam}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
