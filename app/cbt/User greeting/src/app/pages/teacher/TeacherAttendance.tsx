import React, { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Calendar,
  CheckCircle, 
  XCircle,
  Save,
  Search,
  Download,
} from "lucide-react";

export function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const classes = [
    { id: "1", name: "Grade 10A", students: 45 },
    { id: "2", name: "Grade 10B", students: 42 },
    { id: "3", name: "Grade 11A", students: 38 },
  ];

  const [students, setStudents] = useState([
    { uuid: "uuid-1", name: "John Doe", rollNumber: "001", status: "present" },
    { uuid: "uuid-2", name: "Jane Smith", rollNumber: "002", status: "present" },
    { uuid: "uuid-3", name: "Michael Brown", rollNumber: "003", status: "absent" },
    { uuid: "uuid-4", name: "Emily Wilson", rollNumber: "004", status: "present" },
    { uuid: "uuid-5", name: "David Lee", rollNumber: "005", status: "late" },
    { uuid: "uuid-6", name: "Sarah Johnson", rollNumber: "006", status: "present" },
  ]);

  const toggleAttendance = (uuid: string) => {
    setStudents(students.map(student => {
      if (student.uuid === uuid) {
        const statuses = ["present", "absent", "late"];
        const currentIndex = statuses.indexOf(student.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...student, status: statuses[nextIndex] };
      }
      return student;
    }));
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, status: "present" })));
  };

  const handleSaveAttendance = () => {
    // API call would go here
    console.log("Saving attendance:", {
      class_id: selectedClass,
      date: selectedDate,
      attendance: students.map(s => ({ uuid: s.uuid, status: s.status }))
    });
    alert("Attendance saved successfully!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absent</Badge>;
      case "late":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Late</Badge>;
      default:
        return null;
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  const presentCount = students.filter(s => s.status === "present").length;
  const absentCount = students.filter(s => s.status === "absent").length;
  const lateCount = students.filter(s => s.status === "late").length;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-600 mt-1">Mark and manage student attendance</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class-select">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-input">Date</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Students</p>
                  <p className="text-3xl font-bold mt-1">{students.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Present</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{presentCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Absent</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">{absentCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Late</p>
                  <p className="text-3xl font-bold mt-1 text-orange-600">{lateCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-100">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  Click on a student to cycle through: Present → Absent → Late
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={markAllPresent}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

                  <Button
                    variant="ghost"
                    onClick={() => toggleAttendance(student.uuid)}
                    className="hover:bg-transparent"
                  >
                    {getStatusBadge(student.status)}
                  </Button>
                </div>
              ))}
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
                onClick={handleSaveAttendance}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
