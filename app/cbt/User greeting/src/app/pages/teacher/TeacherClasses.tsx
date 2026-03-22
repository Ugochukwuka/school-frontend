import React, { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Users,
  BookOpen,
  Mail,
  Phone,
  Search,
  UserCheck,
  GraduationCap,
  Download,
} from "lucide-react";

export function TeacherClasses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("1");

  // Mock data - would come from API
  const sessions = [
    { id: "1", name: "2025/2026" },
    { id: "2", name: "2024/2025" },
  ];

  const subjectsAssigned = [
    {
      id: 1,
      subject: "Mathematics",
      classes: ["Grade 10A", "Grade 10B", "Grade 11A"],
      totalStudents: 125,
      sessionsPerWeek: 5,
    },
    {
      id: 2,
      subject: "Physics",
      classes: ["Grade 11A", "Grade 11B"],
      totalStudents: 76,
      sessionsPerWeek: 4,
    },
  ];

  const classesTaught = [
    {
      id: 1,
      className: "Grade 10A",
      subject: "Mathematics",
      students: [
        { uuid: "uuid-1", name: "John Doe", rollNumber: "001", email: "john@example.com", phone: "0801234567" },
        { uuid: "uuid-2", name: "Jane Smith", rollNumber: "002", email: "jane@example.com", phone: "0801234568" },
        { uuid: "uuid-3", name: "Michael Brown", rollNumber: "003", email: "michael@example.com", phone: "0801234569" },
        { uuid: "uuid-4", name: "Emily Wilson", rollNumber: "004", email: "emily@example.com", phone: "0801234570" },
      ]
    },
    {
      id: 2,
      className: "Grade 10B",
      subject: "Mathematics",
      students: [
        { uuid: "uuid-5", name: "David Lee", rollNumber: "001", email: "david@example.com", phone: "0801234571" },
        { uuid: "uuid-6", name: "Sarah Johnson", rollNumber: "002", email: "sarah@example.com", phone: "0801234572" },
      ]
    },
  ];

  const formClass = {
    id: 1,
    className: "Grade 10A",
    totalStudents: 45,
    students: [
      { uuid: "uuid-1", name: "John Doe", rollNumber: "001", email: "john@example.com", phone: "0801234567", subjects: 8 },
      { uuid: "uuid-2", name: "Jane Smith", rollNumber: "002", email: "jane@example.com", phone: "0801234568", subjects: 8 },
      { uuid: "uuid-3", name: "Michael Brown", rollNumber: "003", email: "michael@example.com", phone: "0801234569", subjects: 8 },
      { uuid: "uuid-4", name: "Emily Wilson", rollNumber: "004", email: "emily@example.com", phone: "0801234570", subjects: 7 },
      { uuid: "uuid-7", name: "Robert Taylor", rollNumber: "005", email: "robert@example.com", phone: "0801234573", subjects: 8 },
      { uuid: "uuid-8", name: "Lisa Anderson", rollNumber: "006", email: "lisa@example.com", phone: "0801234574", subjects: 8 },
    ]
  };

  const [selectedClass, setSelectedClass] = useState<string>(classesTaught[0]?.className || "");

  const currentClassStudents = classesTaught.find(c => c.className === selectedClass)?.students || [];
  
  const filteredStudents = currentClassStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  const filteredFormStudents = formClass.students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Classes & Subjects</h1>
          <p className="text-slate-600 mt-1">View students in your classes and subjects assigned</p>
        </div>

        {/* Session Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Academic Session:</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">
              <BookOpen className="w-4 h-4 mr-2" />
              Subjects Assigned
            </TabsTrigger>
            <TabsTrigger value="classes">
              <Users className="w-4 h-4 mr-2" />
              Classes Taught
            </TabsTrigger>
            <TabsTrigger value="formclass">
              <UserCheck className="w-4 h-4 mr-2" />
              Form Class
            </TabsTrigger>
          </TabsList>

          {/* Subjects Assigned Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectsAssigned.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{subject.subject}</CardTitle>
                        <CardDescription>{subject.classes.length} classes assigned</CardDescription>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-100">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-slate-600">Classes</span>
                        <div className="flex gap-1">
                          {subject.classes.map((cls, idx) => (
                            <Badge key={idx} variant="secondary">{cls}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-slate-600">Total Students</span>
                        <span className="font-semibold">{subject.totalStudents}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-600">Sessions/Week</span>
                        <span className="font-semibold">{subject.sessionsPerWeek}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Classes Taught Tab */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students in Classes</CardTitle>
                    <CardDescription>View students in the classes you teach</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesTaught.map((cls) => (
                          <SelectItem key={cls.id} value={cls.className}>
                            {cls.className} - {cls.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.uuid}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-slate-600">Roll No: {student.rollNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </div>
                          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            {student.phone}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Class Tab */}
          <TabsContent value="formclass" className="space-y-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">You are the Form Teacher for {formClass.className}</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      You have {formClass.totalStudents} students under your care
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Form Class Students</CardTitle>
                    <CardDescription>Complete list of students in your form class</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Students List */}
                  <div className="space-y-2">
                    {filteredFormStudents.map((student) => (
                      <div
                        key={student.uuid}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-slate-600">Roll No: {student.rollNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </div>
                          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            {student.phone}
                          </div>
                          <Badge variant="secondary">{student.subjects} subjects</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredFormStudents.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
