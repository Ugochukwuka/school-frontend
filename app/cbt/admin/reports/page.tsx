"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Download, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const reports = [
  { id: 1, examTitle: "Mathematics Mid-Term", class: "Grade 10A", date: "2026-03-05", totalStudents: 45, completed: 45, avgScore: 78, highestScore: 95, lowestScore: 45 },
  { id: 2, examTitle: "Physics Quiz", class: "Grade 11B", date: "2026-03-08", totalStudents: 38, completed: 38, avgScore: 72, highestScore: 88, lowestScore: 52 },
  { id: 3, examTitle: "Chemistry Practical", class: "Grade 10A", date: "2026-02-28", totalStudents: 45, completed: 45, avgScore: 85, highestScore: 98, lowestScore: 68 },
];

const classes = ["all", "Grade 10A", "Grade 10B", "Grade 11A", "Grade 11B"];

export default function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || r.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleExport = (examId: number, format: string) => {
    console.log(`Export exam ${examId} as ${format} — use cbtAdmin.exportExamResults(examId, format)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Export and analyze exam results (cbtAdmin.getReports, exportExamResults)</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search reports..."
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
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>{c === "all" ? "All Classes" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Highest</TableHead>
              <TableHead>Lowest</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.examTitle}</TableCell>
                <TableCell>{r.class}</TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                <TableCell>{r.completed}/{r.totalStudents}</TableCell>
                <TableCell>{r.avgScore}%</TableCell>
                <TableCell>{r.highestScore}</TableCell>
                <TableCell>{r.lowestScore}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport(r.id, "csv")}>
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(r.id, "pdf")}>
                      PDF
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No reports found</h3>
            <p className="text-slate-600">Adjust search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
