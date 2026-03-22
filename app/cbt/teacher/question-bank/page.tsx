"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BookOpen } from "lucide-react";

export default function TeacherQuestionBankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
        <p className="text-slate-600 mt-1">Manage and reuse questions across exams</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Question Bank</h3>
          <p className="text-slate-600 mb-4">Browse and import questions into your exams. Connect to GET /cbt/question-bank when ready.</p>
          <Button variant="outline" disabled>Coming soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
