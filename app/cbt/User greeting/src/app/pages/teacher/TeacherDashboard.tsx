import { Link } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Eye,
  BookOpen,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TeacherDashboard() {
  const stats = [
    { label: "Total Exams", value: "24", icon: FileText, color: "text-blue-600" },
    { label: "Active Students", value: "156", icon: Users, color: "text-green-600" },
    { label: "Pending Marking", value: "8", icon: Clock, color: "text-orange-600" },
    { label: "Completed", value: "16", icon: CheckCircle, color: "text-purple-600" },
  ];

  const recentExams = [
    {
      id: 1,
      title: "Mathematics Mid-Term",
      class: "Grade 10A",
      date: "2026-03-05",
      students: 45,
      completed: 32,
      status: "active",
    },
    {
      id: 2,
      title: "Physics Quiz",
      class: "Grade 11B",
      date: "2026-03-08",
      students: 38,
      completed: 0,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Chemistry Practical",
      class: "Grade 10A",
      date: "2026-02-28",
      students: 45,
      completed: 45,
      status: "completed",
      needsMarking: 8,
    },
  ];

  const performanceData = [
    { subject: "Math", average: 78 },
    { subject: "Physics", average: 72 },
    { subject: "Chemistry", average: 85 },
    { subject: "Biology", average: 80 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-slate-100 text-slate-700">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your exams and track student performance</p>
          </div>
          <Link to="/teacher/exams/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
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
          {/* Recent Exams */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Exams</CardTitle>
                  <CardDescription>Your latest exam activities</CardDescription>
                </div>
                <Link to="/teacher/exams">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{exam.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{exam.class}</Badge>
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                      <Link to={`/teacher/exams/${exam.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>

                    {exam.needsMarking ? (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-700 font-medium">
                          {exam.needsMarking} theory answers need marking
                        </span>
                        <Link to={`/teacher/exams/${exam.id}/mark`} className="ml-auto">
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            Mark Now
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Completion</span>
                          <span className="font-medium">
                            {exam.completed}/{exam.students} students
                          </span>
                        </div>
                        <Progress
                          value={(exam.completed / exam.students) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Overall class performance is improving!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Average scores increased by 8% this month. Keep up the great teaching!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/teacher/question-bank">
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
    </DashboardLayout>
  );
}
