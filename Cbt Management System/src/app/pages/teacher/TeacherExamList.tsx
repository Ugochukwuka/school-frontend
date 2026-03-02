import { useState } from "react";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
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
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Copy,
  Trash,
  MoreVertical,
  Users,
  Clock,
  FileText,
} from "lucide-react";

export function TeacherExamList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - will be fetched from teacher's exams endpoint
  const exams = [
    {
      id: 1,
      title: "Mathematics Mid-Term Exam",
      class: "Grade 10A",
      subject: "Mathematics",
      duration: 60,
      totalMarks: 50,
      totalQuestions: 25,
      startTime: "2026-03-05T09:00:00",
      endTime: "2026-03-05T10:30:00",
      status: "published",
      studentsEnrolled: 45,
      studentsCompleted: 32,
      createdAt: "2026-02-20",
    },
    {
      id: 2,
      title: "Physics Quiz - Newton's Laws",
      class: "Grade 11B",
      subject: "Physics",
      duration: 30,
      totalMarks: 30,
      totalQuestions: 15,
      startTime: "2026-03-08T10:30:00",
      endTime: "2026-03-08T11:15:00",
      status: "published",
      studentsEnrolled: 38,
      studentsCompleted: 0,
      createdAt: "2026-03-01",
    },
    {
      id: 3,
      title: "Chemistry Practical Assessment",
      class: "Grade 10A",
      subject: "Chemistry",
      duration: 90,
      totalMarks: 100,
      totalQuestions: 20,
      startTime: "2026-02-28T09:00:00",
      endTime: "2026-02-28T10:30:00",
      status: "completed",
      studentsEnrolled: 45,
      studentsCompleted: 45,
      createdAt: "2026-02-15",
      needsMarking: 8,
    },
    {
      id: 4,
      title: "Biology Final Exam Draft",
      class: "Grade 10B",
      subject: "Biology",
      duration: 120,
      totalMarks: 100,
      totalQuestions: 40,
      status: "draft",
      studentsEnrolled: 0,
      studentsCompleted: 0,
      createdAt: "2026-03-02",
    },
  ];

  const statuses = ["all", "draft", "published", "completed"];

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      default:
        return null;
    }
  };

  const draftExams = filteredExams.filter((e) => e.status === "draft");
  const activeExams = filteredExams.filter((e) => e.status === "published");
  const completedExams = filteredExams.filter((e) => e.status === "completed");

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Exams</h1>
            <p className="text-slate-600 mt-1">Manage all your exams and assessments</p>
          </div>
          <Link to="/teacher/exams/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({filteredExams.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({draftExams.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeExams.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedExams.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ExamGrid exams={filteredExams} />
          </TabsContent>
          <TabsContent value="draft">
            <ExamGrid exams={draftExams} />
          </TabsContent>
          <TabsContent value="active">
            <ExamGrid exams={activeExams} />
          </TabsContent>
          <TabsContent value="completed">
            <ExamGrid exams={completedExams} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function ExamGrid({ exams }: { exams: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      default:
        return null;
    }
  };

  if (exams.length === 0) {
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
      {exams.map((exam) => (
        <Card key={exam.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{exam.subject}</Badge>
                  <Badge variant="outline">{exam.class}</Badge>
                  {getStatusBadge(exam.status)}
                </div>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <CardDescription className="mt-1">
                  Created {new Date(exam.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Exam
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Clone Exam
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Questions</p>
                <p className="font-semibold">{exam.totalQuestions}</p>
              </div>
              <div>
                <p className="text-slate-600">Duration</p>
                <p className="font-semibold">{exam.duration} mins</p>
              </div>
              <div>
                <p className="text-slate-600">Marks</p>
                <p className="font-semibold">{exam.totalMarks}</p>
              </div>
            </div>

            {exam.status === "published" || exam.status === "completed" ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Completion</span>
                    <span className="font-medium">
                      {exam.studentsCompleted}/{exam.studentsEnrolled} students
                    </span>
                  </div>
                  <Progress
                    value={(exam.studentsCompleted / exam.studentsEnrolled) * 100}
                    className="h-2"
                  />
                </div>

                {exam.needsMarking ? (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700 font-medium mb-2">
                      {exam.needsMarking} theory answers need marking
                    </p>
                    <Link to={`/teacher/exams/${exam.id}/mark`}>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                        Mark Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to={`/teacher/exams/${exam.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Link to={`/teacher/exams/${exam.id}`}>
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Continue Editing
                  </Button>
                </Link>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Publish Exam
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
