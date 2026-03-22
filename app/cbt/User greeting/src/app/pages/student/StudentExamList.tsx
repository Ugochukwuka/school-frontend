import { useState } from "react";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Clock, Calendar, BookOpen, Play, CheckCircle, AlertCircle } from "lucide-react";

export function StudentExamList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  // Mock data - will be replaced with API: GET /api/cbt/exams/available
  const exams = [
    {
      id: 1,
      title: "Mathematics Mid-Term Exam",
      subject: "Mathematics",
      description: "Comprehensive assessment covering algebra, geometry, and calculus",
      duration: 60,
      totalMarks: 50,
      startTime: "2026-03-05T09:00:00",
      endTime: "2026-03-05T10:30:00",
      status: "available",
      hasStarted: false,
    },
    {
      id: 2,
      title: "English Language Quiz",
      subject: "English",
      description: "Grammar, comprehension, and essay writing assessment",
      duration: 45,
      totalMarks: 40,
      startTime: "2026-03-08T10:30:00",
      endTime: "2026-03-08T11:30:00",
      status: "upcoming",
      hasStarted: false,
    },
    {
      id: 3,
      title: "Physics Final Assessment",
      subject: "Physics",
      description: "Complete physics course evaluation including practical and theory",
      duration: 90,
      totalMarks: 100,
      startTime: "2026-03-10T14:00:00",
      endTime: "2026-03-10T16:00:00",
      status: "upcoming",
      hasStarted: false,
    },
    {
      id: 4,
      title: "Biology Chapter Test",
      subject: "Biology",
      description: "Test on cell biology and genetics",
      duration: 30,
      totalMarks: 30,
      startTime: "2026-03-01T09:00:00",
      endTime: "2026-03-01T10:00:00",
      status: "in-progress",
      hasStarted: true,
      attemptId: 123,
    },
    {
      id: 5,
      title: "Chemistry Practical",
      subject: "Chemistry",
      description: "Organic chemistry practical assessment",
      duration: 60,
      totalMarks: 50,
      startTime: "2026-02-28T09:00:00",
      endTime: "2026-02-28T10:00:00",
      status: "completed",
      hasStarted: true,
    },
  ];

  const subjects = ["all", "Mathematics", "English", "Physics", "Biology", "Chemistry"];

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || exam.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getActionButton = (exam: any) => {
    if (exam.status === "available") {
      return (
        <Link to={`/student/exam/${exam.id}`}>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start Exam
          </Button>
        </Link>
      );
    }
    if (exam.status === "in-progress") {
      return (
        <Link to={`/student/exam/${exam.id}?resume=${exam.attemptId}`}>
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            Resume Exam
          </Button>
        </Link>
      );
    }
    if (exam.status === "completed") {
      return (
        <Button variant="outline" className="w-full" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed
        </Button>
      );
    }
    return (
      <Button variant="outline" className="w-full" disabled>
        Not Yet Available
      </Button>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Available Exams</h1>
          <p className="text-slate-600 mt-1">View and take your scheduled exams</p>
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
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{exam.subject}</Badge>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.replace("-", " ")}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Total Marks: {exam.totalMarks}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(exam.startTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                {getActionButton(exam)}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No exams found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
