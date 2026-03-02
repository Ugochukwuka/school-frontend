import { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Search, Download, FileText, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export function AdminReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  // Mock data - GET /api/cbt/reports
  const reports = [
    {
      id: 1,
      examTitle: "Mathematics Mid-Term",
      class: "Grade 10A",
      date: "2026-03-05",
      totalStudents: 45,
      completed: 45,
      avgScore: 78,
      highestScore: 95,
      lowestScore: 45,
    },
    {
      id: 2,
      examTitle: "Physics Quiz",
      class: "Grade 11B",
      date: "2026-03-08",
      totalStudents: 38,
      completed: 38,
      avgScore: 72,
      highestScore: 88,
      lowestScore: 52,
    },
    {
      id: 3,
      examTitle: "Chemistry Practical",
      class: "Grade 10A",
      date: "2026-02-28",
      totalStudents: 45,
      completed: 45,
      avgScore: 85,
      highestScore: 98,
      lowestScore: 68,
    },
  ];

  const classes = ["all", "Grade 10A", "Grade 10B", "Grade 11A", "Grade 11B"];

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || r.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleExport = (examId: number, format: string) => {
    // GET /api/cbt/exams/{exam_id}/export?format={format}
    console.log(`Exporting exam ${examId} as ${format}`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-1">Export and analyze exam results</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Exams</p>
                  <p className="text-3xl font-bold mt-1">{reports.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Participants</p>
                  <p className="text-3xl font-bold mt-1">
                    {reports.reduce((sum, r) => sum + r.totalStudents, 0)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overall Average</p>
                  <p className="text-3xl font-bold mt-1">
                    {Math.round(
                      reports.reduce((sum, r) => sum + r.avgScore, 0) / reports.length
                    )}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="exams">Exam Reports</TabsTrigger>
            <TabsTrigger value="students">Student Reports</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
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
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls === "all" ? "All Classes" : cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Results Summary</CardTitle>
                <CardDescription>Detailed performance metrics for each exam</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.examTitle}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.class}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(report.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          {report.completed}/{report.totalStudents}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">
                            {report.avgScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {report.lowestScore}% - {report.highestScore}%
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(report.id, "csv")}
                            >
                              CSV
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(report.id, "pdf")}
                            >
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Student Reports</h3>
                <p className="text-slate-600">Individual student performance tracking</p>
                <Badge className="mt-4">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Subject Analysis</h3>
                <p className="text-slate-600">Performance trends by subject</p>
                <Badge className="mt-4">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
