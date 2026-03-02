import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  Clock,
  Trophy,
  Database,
  FileBarChart,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin" | "parent";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const roleConfig = {
    student: {
      name: "John Doe",
      email: "john.doe@school.edu",
      initials: "JD",
      color: "from-blue-500 to-cyan-500",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/student" },
        { label: "Available Exams", icon: BookOpen, path: "/student/exams" },
        { label: "Results", icon: Trophy, path: "/student/results" },
      ],
    },
    teacher: {
      name: "Sarah Wilson",
      email: "sarah.wilson@school.edu",
      initials: "SW",
      color: "from-green-500 to-emerald-500",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/teacher" },
        { label: "My Exams", icon: FileText, path: "/teacher/exams" },
        { label: "Create Exam", icon: PlusCircle, path: "/teacher/exams/create" },
      ],
    },
    admin: {
      name: "Admin User",
      email: "admin@school.edu",
      initials: "AU",
      color: "from-purple-500 to-pink-500",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { label: "Settings", icon: Settings, path: "/admin/settings" },
        { label: "Question Bank", icon: Database, path: "/admin/question-bank" },
        { label: "Reports", icon: FileBarChart, path: "/admin/reports" },
      ],
    },
    parent: {
      name: "Parent User",
      email: "parent@school.edu",
      initials: "PU",
      color: "from-orange-500 to-red-500",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/parent" },
        { label: "Children", icon: Users, path: "/parent" },
      ],
    },
  };

  const config = roleConfig[role];

  const isActive = (path: string) => {
    if (path === `/${role}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">CBT System</h2>
              <p className="text-xs text-slate-500 capitalize">{role} Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {config.nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Avatar>
              <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white`}>
                {config.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{config.name}</p>
              <p className="text-xs text-slate-500 truncate">{config.email}</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="ghost" className="w-full mt-2 justify-start" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">CBT System</h2>
                  <p className="text-xs text-slate-500 capitalize">{role} Portal</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {config.nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Avatar>
                  <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white`}>
                    {config.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{config.name}</p>
                  <p className="text-xs text-slate-500 truncate">{config.email}</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full mt-2 justify-start" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${config.color}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
