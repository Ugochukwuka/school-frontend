"use client";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BarChart3 } from "lucide-react";

export default function TeacherResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Enter Results</h1>
        <p className="text-slate-600 mt-1">Enter CA and exam scores for your classes</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Result Management</h3>
          <p className="text-slate-600 mb-4">Use POST /results/enter and PUT /results/update when integrated.</p>
          <Button variant="outline" disabled>Coming soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
