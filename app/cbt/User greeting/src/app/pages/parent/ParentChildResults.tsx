import { useParams } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Trophy, TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ParentChildResults() {
  const { studentUuid } = useParams();

  // Mock data - GET /api/cbt/parent/{student_uuid}/history
  const childData = {
    name: "Emma Johnson",
    class: "Grade 10A",
    initials: "EJ",
    avgScore: 85,
    totalExams: 12,
    upcomingExams: [
      {
        id: 1,
        title: "Mathematics Mid-Term",
        subject: "Mathematics",
        date: "2026-03-05",
        time: "09:00 AM",
      },
      {
        id: 2,
        title: "Physics Final",
        subject: "Physics",
        date: "2026-03-10",
        time: "02:00 PM",
      },
    ],
    examHistory: [
      { 
        id: 1, 
        title: "Mathematics Test", 
        subject: "Mathematics",
        score: 88, 
        totalMarks: 100,
        date: "2026-02-28",
        grade: "A",
        rank: 5,
        totalStudents: 45,
      },
      {
        id: 2,
        title: "Physics Quiz",
        subject: "Physics",
        score: 92,
        totalMarks: 100,
        date: "2026-02-25",
        grade: "A",
        rank: 2,
        totalStudents: 38,
      },
      {
        id: 3,
        title: "Chemistry Practical",
        subject: "Chemistry",
        score: 78,
        totalMarks: 100,
        date: "2026-02-22",
        grade: "B",
        rank: 12,
        totalStudents: 45,
      },
      {
        id: 4,
        title: "Biology Test",
        subject: "Biology",
        score: 85,
        totalMarks: 100,
        date: "2026-02-18",
        grade: "A",
        rank: 7,
        totalStudents: 45,
      },
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

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-700";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                    {childData.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{childData.name}</h1>
                  <p className="text-slate-600">{childData.class}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Overall Average</p>
                <p className="text-4xl font-bold text-green-600">{childData.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Exams</p>
                  <p className="text-3xl font-bold mt-1">{childData.totalExams}</p>
                </div>
                <Trophy className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Best Score</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">92%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Best Rank</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">#2</p>
                </div>
                <Trophy className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                  <p className="text-3xl font-bold mt-1 text-orange-600">
                    {childData.upcomingExams.length}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history">Exam History</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {childData.examHistory.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{exam.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{exam.subject}</Badge>
                            <span className="text-sm text-slate-600">
                              {new Date(exam.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <Badge className={getGradeColor(exam.grade)}>{exam.grade}</Badge>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Score</span>
                          <span className="font-semibold">
                            {exam.score}/{exam.totalMarks} ({Math.round((exam.score / exam.totalMarks) * 100)}%)
                          </span>
                        </div>
                        <Progress value={(exam.score / exam.totalMarks) * 100} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Class Rank: {exam.rank} of {exam.totalStudents}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {childData.upcomingExams.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Upcoming Exams</h3>
                  <p className="text-slate-600">There are no scheduled exams at this time</p>
                </CardContent>
              </Card>
            ) : (
              childData.upcomingExams.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <Badge variant="secondary" className="mt-2">{exam.subject}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(exam.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{exam.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Average scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={childData.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Average Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>Average scores across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={childData.subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#10b981" name="Average Score (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childData.subjectPerformance.map((subject) => (
                <Card key={subject.subject}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{subject.subject}</h3>
                      {subject.avgScore >= 85 ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : subject.avgScore >= 75 ? (
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{subject.avgScore}%</p>
                    <p className="text-sm text-slate-600 mt-1">{subject.exams} exams taken</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
