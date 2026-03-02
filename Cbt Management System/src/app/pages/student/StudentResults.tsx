import { useState } from "react";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Search, Trophy, TrendingUp, TrendingDown, Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

export function StudentResults() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with API calls
  // All results: GET /api/cbt/results/history
  // Single exam: GET /api/cbt/results/{exam_id}
  const results = [
    {
      id: 1,
      examId: 5,
      examTitle: "Chemistry Practical",
      subject: "Chemistry",
      date: "2026-02-28",
      score: 88,
      totalMarks: 100,
      percentage: 88,
      grade: "A",
      duration: "58 mins",
      rank: 3,
      totalStudents: 45,
    },
    {
      id: 2,
      examId: 6,
      examTitle: "Biology Quiz",
      subject: "Biology",
      date: "2026-02-25",
      score: 92,
      totalMarks: 100,
      percentage: 92,
      grade: "A",
      duration: "42 mins",
      rank: 1,
      totalStudents: 45,
    },
    {
      id: 3,
      examId: 7,
      examTitle: "History Test",
      subject: "History",
      date: "2026-02-22",
      score: 78,
      totalMarks: 100,
      percentage: 78,
      grade: "B",
      duration: "55 mins",
      rank: 12,
      totalStudents: 45,
    },
    {
      id: 4,
      examId: 8,
      examTitle: "Mathematics Assignment",
      subject: "Mathematics",
      date: "2026-02-18",
      score: 95,
      totalMarks: 100,
      percentage: 95,
      grade: "A+",
      duration: "50 mins",
      rank: 2,
      totalStudents: 45,
    },
  ];

  const subjectStats = [
    { subject: "Mathematics", avgScore: 88, exams: 5, trend: "up" },
    { subject: "Chemistry", avgScore: 85, exams: 4, trend: "up" },
    { subject: "Biology", avgScore: 90, exams: 4, trend: "up" },
    { subject: "History", avgScore: 76, exams: 3, trend: "down" },
    { subject: "English", avgScore: 82, exams: 4, trend: "up" },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-700";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const filteredResults = results.filter((result) =>
    result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overallAverage = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exam Results</h1>
          <p className="text-slate-600 mt-1">View your performance and track progress</p>
        </div>

        {/* Overall Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overall Average</p>
                  <p className="text-3xl font-bold text-green-600">{overallAverage}%</p>
                </div>
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Exams</p>
                  <p className="text-3xl font-bold">{results.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Best Score</p>
                  <p className="text-3xl font-bold text-purple-600">95%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Class Rank</p>
                  <p className="text-3xl font-bold text-orange-600">#5</p>
                </div>
                <Trophy className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search results..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{result.examTitle}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{result.subject}</Badge>
                              <span className="text-sm text-slate-600">
                                {new Date(result.date).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Score</span>
                            <span className="font-semibold">
                              {result.score}/{result.totalMarks} ({result.percentage}%)
                            </span>
                          </div>
                          <Progress value={result.percentage} className="h-2" />
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Rank: {result.rank} of {result.totalStudents}</span>
                            <span>Duration: {result.duration}</span>
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="lg:w-auto w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{result.examTitle}</DialogTitle>
                            <DialogDescription>Detailed exam results and feedback</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Your Score</p>
                                <p className="text-2xl font-bold">{result.score}/{result.totalMarks}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Grade</p>
                                <p className="text-2xl font-bold">{result.grade}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Class Rank</p>
                                <p className="text-2xl font-bold">#{result.rank}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Duration</p>
                                <p className="text-2xl font-bold">{result.duration}</p>
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-semibold mb-2">Teacher's Feedback</h4>
                              <p className="text-sm text-slate-600">
                                Excellent work on the exam! You demonstrated strong understanding of the concepts.
                                Keep focusing on time management to improve further.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {subjectStats.map((stat) => (
                <Card key={stat.subject}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{stat.subject}</CardTitle>
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <CardDescription>{stat.exams} exams taken</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Average Score</span>
                        <span className="text-2xl font-bold">{stat.avgScore}%</span>
                      </div>
                      <Progress value={stat.avgScore} className="h-2" />
                    </div>
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
