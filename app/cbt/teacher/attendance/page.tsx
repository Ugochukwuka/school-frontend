"use client";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ClipboardCheck } from "lucide-react";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mark Attendance</h1>
        <p className="text-slate-600 mt-1">Record student presence for your classes</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Attendance Management</h3>
          <p className="text-slate-600 mb-4">Use POST /teacher/attendance/mark and related endpoints when integrated.</p>
          <Button variant="outline" disabled>Coming soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
