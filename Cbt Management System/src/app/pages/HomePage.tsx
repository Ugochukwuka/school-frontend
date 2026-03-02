import { Link } from "react-router";
import { GraduationCap, BookOpen, Settings, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function HomePage() {
  const roles = [
    {
      title: "Student Portal",
      description: "Take exams, view results, and track your performance",
      icon: GraduationCap,
      path: "/student",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Teacher Portal",
      description: "Create exams, manage questions, and grade assessments",
      icon: BookOpen,
      path: "/teacher",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Admin Portal",
      description: "Configure settings, view analytics, and manage system",
      icon: Settings,
      path: "/admin",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Parent Portal",
      description: "Monitor your child's exam progress and results",
      icon: Users,
      path: "/parent",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CBT System
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Complete Computer-Based Testing solution for modern education
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link key={role.path} to={role.path}>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
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
