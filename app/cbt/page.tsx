"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, Settings, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { CBT_BASE } from "./cbt-urls";

export default function CbtHomePage() {
  const roles = [
    {
      title: "Student Portal",
      description: "Take exams, view results, and track your performance",
      icon: GraduationCap,
      path: `${CBT_BASE}/student`,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Teacher Portal",
      description: "Create exams, manage questions, and grade assessments",
      icon: BookOpen,
      path: `${CBT_BASE}/teacher`,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Admin Portal",
      description: "Configure settings, view analytics, and manage system",
      icon: Settings,
      path: `${CBT_BASE}/admin`,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Parent Portal",
      description: "Monitor your child's exam progress and results",
      icon: Users,
      path: `${CBT_BASE}/parent`,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CBT System
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-2">
          Complete Computer-Based Testing solution for modern education
        </p>
        <Link
          href={`${CBT_BASE}/login`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Login to CBT
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link key={role.path} href={`${CBT_BASE}/login`}>
              <Card className="group transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden shadow-none hover:shadow-none">
                <div className={`h-2 bg-gradient-to-r ${role.color}`} />
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-slate-100">
                    Enter Portal →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
