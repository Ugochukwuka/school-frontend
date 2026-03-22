"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BookOpen, Clock, Trophy, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

const CBT_BASE = "/cbt";

export default function StudentDashboardPage() {
  const stats = [
    { label: "Exams Taken", value: "12", icon: BookOpen, color: "text-blue-600" },
    { label: "Average Score", value: "85%", icon: Trophy, color: "text-green-600" },
    { label: "Available Exams", value: "3", icon: Calendar, color: "text-purple-600" },
    { label: "Hours Spent", value: "24.5", icon: Clock, color: "text-orange-600" },
  ];

  const upcomingExams = [
    { id: 1, title: "Mathematics Mid-Term", subject: "Mathematics", date: "2026-03-05", time: "09:00 AM", duration: "60 mins" },
    { id: 2, title: "English Language Quiz", subject: "English", date: "2026-03-08", time: "10:30 AM", duration: "45 mins" },
    { id: 3, title: "Physics Final Assessment", subject: "Physics", date: "2026-03-10", time: "02:00 PM", duration: "90 mins" },
  ];

  const recentResults = [
    { exam: "Biology Quiz", score: 92, total: 100, date: "2026-02-28", grade: "A" },
    { exam: "History Test", score: 78, total: 100, date: "2026-02-25", grade: "B" },
    { exam: "Chemistry Practical", score: 88, total: 100, date: "2026-02-22", grade: "A" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here&apos;s your exam overview.</p>
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
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>Exams scheduled for you</CardDescription>
              </div>
              <Link href={`${CBT_BASE}/student/exams`}>
                <Button size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-0 shadow-none rounded-lg">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] hover:bg-slate-100/80 transition-colors"
                >
                <div className="flex-1">
                  <h4 className="font-semibold">{exam.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                    <Badge variant="secondary" className="text-xs">{exam.subject}</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.time}
                    </span>
                    <span>{exam.duration}</span>
                  </div>
                </div>
                <Link href={`${CBT_BASE}/student/exam/${exam.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Start Exam
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Your latest exam scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map((result, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{result.exam}</span>
                    <Badge className={
                      result.grade === "A" ? "bg-green-100 text-green-700 border-0" :
                      result.grade === "B" ? "bg-blue-100 text-blue-700 border-0" :
                      "bg-yellow-100 text-yellow-700 border-0"
                    }>
                      {result.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{result.score}/{result.total}</span>
                    <span>{new Date(result.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <Progress value={(result.score / result.total) * 100} className="h-2" />
                </div>
              ))}
              <Link href={`${CBT_BASE}/student/results`} className="block text-center mt-4">
                <span className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline">View All Results</span>
              </Link>
            </div>
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
              <h3 className="font-semibold text-blue-900">Keep up the great work!</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your performance has improved by 12% this month. Continue practicing to maintain this momentum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
