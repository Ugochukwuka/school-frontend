"use client";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { GraduationCap } from "lucide-react";

export default function TeacherClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
        <p className="text-slate-600 mt-1">View students in classes you teach</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Class & Subject Management</h3>
          <p className="text-slate-600 mb-4">Use GET /teacher/classes/students and GET /teacher/subjects when integrated.</p>
          <Button variant="outline" disabled>Coming soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
