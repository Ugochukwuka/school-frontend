"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  PlusCircle,
  Eye,
  AlertCircle,
  TrendingUp,
  Loader2,
  BookOpen,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cbtTeacherListExams } from "@/app/lib/cbtApi";

const CBT_BASE = "/cbt";

interface DisplayExam {
  id: number;
  title: string;
  class: string;
  status: "draft" | "published" | "completed";
  students?: number;
  completed?: number;
  needsMarking?: number;
}

export default function TeacherDashboardPage() {
  const [recentExams, setRecentExams] = useState<DisplayExam[]>([]);
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await cbtTeacherListExams({ per_page: 10, page: 1 });
        if (cancelled) return;
        const body = res.data as {
          data?: {
            exams?: { data?: Array<{
              id: number;
              title: string;
              status: string;
              class_level?: { id: number; name: string; arm?: string };
              subject?: { id: number; name: string };
            }> };
            data?: Array<{
              id: number;
              title: string;
              status: string;
              class_level?: { id: number; name: string; arm?: string };
            }>;
            total?: number;
            counts?: { all?: number; draft?: number; published?: number; completed?: number };
          };
        };
        const inner = body?.data;
        const list = inner?.exams?.data ?? inner?.data ?? [];
        const total = Array.isArray(list) ? list.length : 0;
        const nextCounts = inner?.counts;
        if (nextCounts) {
          setCounts({
            all: nextCounts.all ?? total,
            draft: nextCounts.draft ?? 0,
            published: nextCounts.published ?? 0,
            completed: nextCounts.completed ?? 0,
          });
        } else {
          setCounts({ all: total, draft: 0, published: 0, completed: 0 });
        }
        const arr = Array.isArray(list) ? list.slice(0, 5) : [];
        setRecentExams(
          arr.map((e: { id: number; title?: string; status?: string; class_level?: { name?: string; arm?: string } }) => ({
            id: e.id,
            title: e.title ?? "Untitled",
            class: e.class_level ? `${e.class_level.name ?? ""}${e.class_level.arm ?? ""}`.trim() || "—" : "—",
            status: (e.status === "draft" || e.status === "published" || e.status === "completed" ? e.status : "draft") as DisplayExam["status"],
            students: 0,
            completed: 0,
          }))
        );
      } catch {
        if (!cancelled) setRecentExams([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const stats = [
    { label: "Total Exams", value: String(counts.all), icon: FileText, color: "text-blue-600" },
    { label: "Draft", value: String(counts.draft), icon: FileText, color: "text-slate-600" },
    { label: "Published", value: String(counts.published), icon: CheckCircle, color: "text-green-600" },
    { label: "Completed", value: String(counts.completed), icon: CheckCircle, color: "text-purple-600" },
  ];

  const performanceData = [
    { subject: "Math", average: 78 },
    { subject: "Physics", average: 72 },
    { subject: "Chemistry", average: 85 },
    { subject: "Biology", average: 80 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "draft":
        return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your exams and track student performance</p>
        </div>
        <Link href={`${CBT_BASE}/teacher/exams/create`}>
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-slate-100 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Exams</CardTitle>
              <CardDescription>Your latest exam activities</CardDescription>
            </div>
            <Link href={`${CBT_BASE}/teacher/exams`}>
              <Button size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-0 shadow-none rounded-lg">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
          <div className="space-y-4">
            {recentExams.map((exam) => {
              const students = exam.students ?? 0;
              const completed = exam.completed ?? 0;
              const progressPct = students > 0 ? (completed / students) * 100 : 0;
              return (
              <div
                key={exam.id}
                className="p-4 rounded-lg bg-slate-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] hover:bg-slate-100/80 transition-colors"
              >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{exam.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {exam.class}
                        </Badge>
                        {getStatusBadge(exam.status)}
                      </div>
                    </div>
                    <Link href={`${CBT_BASE}/teacher/exams/${exam.id}`}>
                      <Button size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-0 shadow-none rounded-lg">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                  {"needsMarking" in exam && exam.needsMarking ? (
                    <div className="p-3 bg-orange-50 rounded-lg flex items-center gap-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700 font-medium">
                        {exam.needsMarking} theory answers need marking
                      </span>
                      <Link href={`${CBT_BASE}/teacher/exams/${exam.id}/mark`} className="ml-auto">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Mark Now
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status</span>
                        <span className="font-medium text-slate-900">{exam.status}</span>
                      </div>
                      {students > 0 && (
                        <Progress value={progressPct} className="h-2" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Overall class performance is improving!</h3>
              <p className="text-sm text-blue-700 mt-1">
                Average scores increased by 8% this month. Keep up the great teaching!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your teaching activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`${CBT_BASE}/teacher/exams/create`}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300">
                <PlusCircle className="w-8 h-8 text-green-600" />
                <span className="font-medium">Create New Exam</span>
                <span className="text-xs text-slate-500">Set up CBT exams</span>
              </Button>
            </Link>
            <Link href={`${CBT_BASE}/teacher/question-bank`}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300">
                <BookOpen className="w-8 h-8 text-purple-600" />
                <span className="font-medium">Question Bank</span>
                <span className="text-xs text-slate-500">Manage questions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
