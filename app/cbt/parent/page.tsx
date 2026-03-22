"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  User,
  Trophy,
  Calendar,
  BookOpen,
  Clock,
  Eye,
} from "lucide-react";

const CBT_BASE = "/cbt";

const children = [
  {
    uuid: "student-uuid-1",
    name: "Emma Johnson",
    class: "Grade 10A",
    initials: "EJ",
    avgScore: 85,
    totalExams: 12,
    upcomingExams: 3,
    isCurrentlyWriting: false,
    recentExams: [
      { title: "Mathematics Test", score: 88, date: "2026-02-28" },
      { title: "Physics Quiz", score: 92, date: "2026-02-25" },
      { title: "Chemistry Practical", score: 78, date: "2026-02-22" },
    ],
  },
  {
    uuid: "student-uuid-2",
    name: "Michael Johnson",
    class: "Grade 8B",
    initials: "MJ",
    avgScore: 78,
    totalExams: 10,
    upcomingExams: 2,
    isCurrentlyWriting: true,
    currentExam: { title: "English Literature Quiz", startTime: "2026-03-02T10:00:00", progress: 65 },
    recentExams: [
      { title: "History Test", score: 75, date: "2026-02-27" },
      { title: "Biology Quiz", score: 82, date: "2026-02-24" },
    ],
  },
];

export default function ParentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Parent Dashboard</h1>
        <p className="text-slate-600 mt-1">Monitor your children&apos;s exam performance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Children</p>
                <p className="text-3xl font-bold mt-1">{children.length}</p>
              </div>
              <User className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Exams</p>
                <p className="text-3xl font-bold mt-1">
                  {children.reduce((sum, child) => sum + child.totalExams, 0)}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming</p>
                <p className="text-3xl font-bold mt-1">
                  {children.reduce((sum, child) => sum + child.upcomingExams, 0)}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Family Avg</p>
                <p className="text-3xl font-bold mt-1">
                  {Math.round(
                    children.reduce((sum, child) => sum + child.avgScore, 0) / children.length
                  )}%
                </p>
              </div>
              <Trophy className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {children.some((c) => c.isCurrentlyWriting) && (
        <Card className="bg-orange-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Child Currently Taking Exam</h3>
                {children
                  .filter((c) => c.isCurrentlyWriting && "currentExam" in c)
                  .map((c) => (
                    <div key={c.uuid} className="mt-2">
                      <p className="text-sm text-orange-700">
                        {c.name} is currently writing: {(c as { currentExam?: { title: string; progress?: number } }).currentExam?.title}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-orange-600 mb-1">
                          <span>Progress</span>
                          <span>{(c as { currentExam?: { progress?: number } }).currentExam?.progress}%</span>
                        </div>
                        <Progress value={(c as { currentExam?: { progress?: number } }).currentExam?.progress ?? 0} className="h-2" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.uuid} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {child.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.class}</CardDescription>
                  </div>
                </div>
                {child.isCurrentlyWriting && (
                  <Badge className="bg-orange-100 text-orange-700 animate-pulse">Writing Exam</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{child.avgScore}%</p>
                  <p className="text-xs text-slate-600 mt-1">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{child.totalExams}</p>
                  <p className="text-xs text-slate-600 mt-1">Exams</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{child.upcomingExams}</p>
                  <p className="text-xs text-slate-600 mt-1">Upcoming</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Recent Exams</h4>
                <div className="space-y-2">
                  {child.recentExams.map((exam, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{exam.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Badge
                        className={
                          exam.score >= 80
                            ? "bg-green-100 text-green-700"
                            : exam.score >= 70
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {exam.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Link href={`${CBT_BASE}/parent/child/${child.uuid}`}>
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border-0 shadow-none rounded-lg">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
