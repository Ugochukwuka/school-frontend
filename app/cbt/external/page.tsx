"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BookOpen, Trophy } from "lucide-react";

const CBT_BASE = "/cbt";

export default function ExternalUserDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">External Exams Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome. Take external exams and view your results.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-3 rounded-xl bg-blue-100 w-fit">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="mt-3">Available External Exams</CardTitle>
            <CardDescription>View and take external exams (e.g. WAEC, JAMB)</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${CBT_BASE}/external/exams`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Exams</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-3 rounded-xl bg-slate-100 w-fit">
              <Trophy className="w-6 h-6 text-slate-600" />
            </div>
            <CardTitle className="mt-3">My External Results</CardTitle>
            <CardDescription>View your past external exam attempts and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${CBT_BASE}/external/results`}>
              <Button variant="outline" className="w-full">View Results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
