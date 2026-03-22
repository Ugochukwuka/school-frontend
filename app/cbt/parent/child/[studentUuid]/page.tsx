"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Trophy, Calendar, Clock, ArrowLeft } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CBT_BASE = "/cbt";

const childData = {
  name: "Emma Johnson",
  class: "Grade 10A",
  initials: "EJ",
  avgScore: 85,
  totalExams: 12,
  upcomingExams: [
    { id: 1, title: "Mathematics Mid-Term", subject: "Mathematics", date: "2026-03-05", time: "09:00 AM" },
    { id: 2, title: "Physics Final", subject: "Physics", date: "2026-03-10", time: "02:00 PM" },
  ],
  examHistory: [
    { id: 1, title: "Mathematics Test", subject: "Mathematics", score: 88, totalMarks: 100, date: "2026-02-28", grade: "A", rank: 5, totalStudents: 45 },
    { id: 2, title: "Physics Quiz", subject: "Physics", score: 92, totalMarks: 100, date: "2026-02-25", grade: "A", rank: 2, totalStudents: 38 },
    { id: 3, title: "Chemistry Practical", subject: "Chemistry", score: 78, totalMarks: 100, date: "2026-02-22", grade: "B", rank: 12, totalStudents: 45 },
    { id: 4, title: "Biology Test", subject: "Biology", score: 85, totalMarks: 100, date: "2026-02-18", grade: "A", rank: 7, totalStudents: 45 },
  ],
  performanceTrend: [
    { month: "Oct", score: 75 },
    { month: "Nov", score: 78 },
    { month: "Dec", score: 82 },
    { month: "Jan", score: 84 },
    { month: "Feb", score: 85 },
  ],
  subjectPerformance: [
    { subject: "Math", avgScore: 86, exams: 3 },
    { subject: "Physics", avgScore: 88, exams: 3 },
    { subject: "Chemistry", avgScore: 80, exams: 2 },
    { subject: "Biology", avgScore: 85, exams: 2 },
    { subject: "English", avgScore: 82, exams: 2 },
  ],
};

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "bg-green-100 text-green-700";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function ParentChildResultsPage() {
  const params = useParams();
  const studentUuid = params?.studentUuid as string;

  return (
    <div className="space-y-6">
      <Link href={`${CBT_BASE}/parent`} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                {childData.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{childData.name}</CardTitle>
              <CardDescription>{childData.class}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">Avg: {childData.avgScore}%</Badge>
                <Badge variant="secondary">{childData.totalExams} exams</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Exam History</TabsTrigger>
          <TabsTrigger value="trend">Performance Trend</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {childData.examHistory.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{exam.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{exam.subject}</Badge>
                      <Badge className={getGradeColor(exam.grade)}>{exam.grade}</Badge>
                      <span className="text-sm text-slate-500">
                        {new Date(exam.date).toLocaleDateString()} · Rank {exam.rank}/{exam.totalStudents}
                      </span>
                    </div>
                    <Progress value={(exam.score / exam.totalMarks) * 100} className="mt-2 h-2" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{exam.score}/{exam.totalMarks}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>Monthly average</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={childData.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>By Subject</CardTitle>
              <CardDescription>Average scores per subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={childData.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#10b981" radius={[4, 4, 0, 0]} name="Avg %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {childData.upcomingExams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{exam.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                    <Badge variant="secondary">{exam.subject}</Badge>
                    <Calendar className="w-4 h-4" />
                    {new Date(exam.date).toLocaleDateString()}
                    <Clock className="w-4 h-4" />
                    {exam.time}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
