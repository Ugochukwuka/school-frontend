import React, { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { 
  Save,
  Search,
  Download,
  Edit,
  TrendingUp,
  Award,
} from "lucide-react";

interface StudentResult {
  uuid: string;
  name: string;
  rollNumber: string;
  ca1: number;
  ca2: number;
  examScore: number;
  total: number;
  grade: string;
  teacherComment: string;
}

export function TeacherResultsManagement() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  const classes = [
    { id: "1", name: "Grade 10A" },
    { id: "2", name: "Grade 10B" },
    { id: "3", name: "Grade 11A" },
  ];

  const subjects = [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Physics" },
    { id: "3", name: "Chemistry" },
    { id: "4", name: "Biology" },
  ];

  const terms = [
    { id: "1", name: "First Term" },
    { id: "2", name: "Second Term" },
    { id: "3", name: "Third Term" },
  ];

  const [students, setStudents] = useState<StudentResult[]>([
    {
      uuid: "uuid-1",
      name: "John Doe",
      rollNumber: "001",
      ca1: 15,
      ca2: 18,
      examScore: 55,
      total: 88,
      grade: "A",
      teacherComment: "Excellent performance"
    },
    {
      uuid: "uuid-2",
      name: "Jane Smith",
      rollNumber: "002",
      ca1: 12,
      ca2: 15,
      examScore: 48,
      total: 75,
      grade: "B",
      teacherComment: "Good effort, keep improving"
    },
    {
      uuid: "uuid-3",
      name: "Michael Brown",
      rollNumber: "003",
      ca1: 18,
      ca2: 19,
      examScore: 58,
      total: 95,
      grade: "A",
      teacherComment: "Outstanding work"
    },
  ]);

  const calculateGrade = (total: number): string => {
    if (total >= 90) return "A";
    if (total >= 80) return "B";
    if (total >= 70) return "C";
    if (total >= 60) return "D";
    return "F";
  };

  const updateStudentScore = (uuid: string, field: keyof StudentResult, value: number | string) => {
    setStudents(students.map(student => {
      if (student.uuid === uuid) {
        const updated = { ...student, [field]: value };
        
        if (field === 'ca1' || field === 'ca2' || field === 'examScore') {
          const ca1 = field === 'ca1' ? Number(value) : student.ca1;
          const ca2 = field === 'ca2' ? Number(value) : student.ca2;
          const examScore = field === 'examScore' ? Number(value) : student.examScore;
          updated.total = ca1 + ca2 + examScore;
          updated.grade = calculateGrade(updated.total);
        }
        
        return updated;
      }
      return student;
    }));
  };

  const handleSaveResults = () => {
    // API call would go here
    console.log("Saving results:", {
      subject_id: selectedSubject,
      term_id: selectedTerm,
      results: students.map(s => ({
        student_uuid: s.uuid,
        ca1: s.ca1,
        ca2: s.ca2,
        exam_score: s.examScore,
        teacher_comment: s.teacherComment
      }))
    });
    setEditingUuid(null);
    alert("Results saved successfully!");
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  const classAverage = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.total, 0) / students.length)
    : 0;

  const topPerformer = students.length > 0 
    ? students.reduce((prev, current) => (prev.total > current.total) ? prev : current)
    : null;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Results Management</h1>
          <p className="text-slate-600 mt-1">Enter and manage student examination results</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="class-select">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject-select">Select Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject-select">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="term-select">Select Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger id="term-select">
                    <SelectValue placeholder="Choose a term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Name or Roll Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Students</p>
                  <p className="text-3xl font-bold mt-1">{students.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Class Average</p>
                  <p className="text-3xl font-bold mt-1">{classAverage}%</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-slate-600">Top Performer</p>
                {topPerformer && (
                  <div className="mt-1">
                    <p className="font-semibold">{topPerformer.name}</p>
                    <p className="text-2xl font-bold text-purple-600">{topPerformer.total}/100</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Entry */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enter Results</CardTitle>
                <CardDescription>CA1 (20) + CA2 (20) + Exam (60) = Total (100)</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Roll No</th>
                    <th className="text-left p-3 font-semibold">Student Name</th>
                    <th className="text-center p-3 font-semibold">CA1 (20)</th>
                    <th className="text-center p-3 font-semibold">CA2 (20)</th>
                    <th className="text-center p-3 font-semibold">Exam (60)</th>
                    <th className="text-center p-3 font-semibold">Total</th>
                    <th className="text-center p-3 font-semibold">Grade</th>
                    <th className="text-left p-3 font-semibold">Comment</th>
                    <th className="text-center p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const isEditing = editingUuid === student.uuid;
                    
                    return (
                      <tr key={student.uuid} className="border-b hover:bg-slate-50">
                        <td className="p-3">{student.rollNumber}</td>
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={student.ca1}
                            onChange={(e) => updateStudentScore(student.uuid, 'ca1', parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={!isEditing}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={student.ca2}
                            onChange={(e) => updateStudentScore(student.uuid, 'ca2', parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={!isEditing}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="60"
                            value={student.examScore}
                            onChange={(e) => updateStudentScore(student.uuid, 'examScore', parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={!isEditing}
                          />
                        </td>
                        <td className="p-3 text-center font-bold">{student.total}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                            student.grade === 'A' ? 'bg-green-100 text-green-700' :
                            student.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            student.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            student.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {student.grade}
                          </span>
                        </td>
                        <td className="p-3">
                          <Textarea
                            value={student.teacherComment}
                            onChange={(e) => updateStudentScore(student.uuid, 'teacherComment', e.target.value)}
                            className="min-w-[200px]"
                            rows={2}
                            disabled={!isEditing}
                            placeholder="Enter comment..."
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant={isEditing ? "default" : "outline"}
                            onClick={() => setEditingUuid(isEditing ? null : student.uuid)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No students found</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSaveResults}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
