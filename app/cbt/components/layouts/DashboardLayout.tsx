"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  FileBarChart,
  PlusCircle,
  Database,
  Trophy,
  PencilLine,
  ChevronDown,
  ListChecks,
  HelpCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const CBT_BASE = "/cbt";

type NavLink = { label: string; icon: React.ComponentType<{ className?: string }>; path: string };
type NavGroup = { label: string; icon: React.ComponentType<{ className?: string }>; children: NavLink[] };
type NavItem = NavLink | NavGroup;

function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray((item as NavGroup).children);
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin" | "parent" | "external_user";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);

  const roleConfig: Record<string, { name: string; email: string; initials: string; badgeClass: string; nav: NavItem[] }> = {
    student: {
      name: "John Doe",
      email: "john.doe@school.edu",
      initials: "JD",
      badgeClass: "bg-blue-600 text-white",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: `${CBT_BASE}/student` },
        { label: "School Exams", icon: BookOpen, path: `${CBT_BASE}/student/exams` },
        {
          label: "External Exams",
          icon: FileText,
          children: [
            { label: "Available External Exams", icon: BookOpen, path: `${CBT_BASE}/student/external-exams` },
            { label: "My External Results", icon: Trophy, path: `${CBT_BASE}/student/results` },
          ],
        },
        { label: "Results", icon: Trophy, path: `${CBT_BASE}/student/results` },
      ],
    },
    teacher: {
      name: "Sarah Wilson",
      email: "sarah.wilson@school.edu",
      initials: "SW",
      badgeClass: "bg-blue-600 text-white",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: `${CBT_BASE}/teacher` },
        { label: "My Exams", icon: FileText, path: `${CBT_BASE}/teacher/exams` },
        { label: "Create Exam", icon: PlusCircle, path: `${CBT_BASE}/teacher/exams/create` },
        { label: "Grading & Review", icon: PencilLine, path: `${CBT_BASE}/teacher/exams?view=grading` },
        { label: "Question Bank", icon: Database, path: `${CBT_BASE}/teacher/question-bank` },
      ],
    },
    admin: {
      name: "Admin User",
      email: "admin@school.edu",
      initials: "AU",
      badgeClass: "bg-blue-600 text-white",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: `${CBT_BASE}/admin` },
        { label: "Settings", icon: Settings, path: `${CBT_BASE}/admin/settings` },
        { label: "Question Bank", icon: Database, path: `${CBT_BASE}/admin/question-bank` },
        { label: "Reports", icon: FileBarChart, path: `${CBT_BASE}/admin/reports` },
        {
          label: "External CBT",
          icon: FileText,
          children: [
            { label: "List External Exams", icon: FileText, path: `${CBT_BASE}/admin/external` },
            { label: "Create External Exam", icon: PlusCircle, path: `${CBT_BASE}/admin/external/exams/create` },
          ],
        },
        {
          label: "External Questions",
          icon: HelpCircle,
          children: [
            { label: "Add question to exam", icon: PlusCircle, path: `${CBT_BASE}/admin/external/questions/add` },
            { label: "List questions for exam", icon: FileText, path: `${CBT_BASE}/admin/external/questions/list` },
          ],
        },
        {
          label: "External Question Options",
          icon: ListChecks,
          children: [
            { label: "Add option to question", icon: PlusCircle, path: `${CBT_BASE}/admin/external/options/add` },
            { label: "Add correct option", icon: PlusCircle, path: `${CBT_BASE}/admin/external/options/add-correct` },
            { label: "List options for question", icon: FileText, path: `${CBT_BASE}/admin/external/options` },
          ],
        },
      ],
    },
    parent: {
      name: "Parent User",
      email: "parent@school.edu",
      initials: "PU",
      badgeClass: "bg-blue-600 text-white",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: `${CBT_BASE}/parent` },
        { label: "Children", icon: Users, path: `${CBT_BASE}/parent` },
      ],
    },
    external_user: {
      name: "External User",
      email: "external@example.com",
      initials: "EU",
      badgeClass: "bg-blue-600 text-white",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: `${CBT_BASE}/external` },
        {
          label: "External",
          icon: BookOpen,
          children: [
            { label: "Available External Exams", icon: BookOpen, path: `${CBT_BASE}/external/exams` },
            { label: "My External Results", icon: Trophy, path: `${CBT_BASE}/external/results` },
          ],
        },
      ],
    },
  };

  const configBase = roleConfig[role];
  const config = useMemo(() => {
    const name = profile?.name?.trim() || configBase.name;
    const email = profile?.email?.trim() || configBase.email;
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || configBase.initials;
    return { ...configBase, name, email, initials };
  }, [configBase, profile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readProfile = () => {
      try {
        const raw = localStorage.getItem(`cbt.profile.${role}`);
        if (!raw) {
          setProfile(null);
          return;
        }
        const parsed = JSON.parse(raw) as { name?: string; email?: string };
        setProfile(parsed && typeof parsed === "object" ? parsed : null);
      } catch {
        setProfile(null);
      }
    };

    readProfile();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === `cbt.profile.${role}`) readProfile();
    };
    const onCustom = () => readProfile();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cbt-profile-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cbt-profile-updated", onCustom);
    };
  }, [role]);

  const isActive = (path: string) => {
    if (path === `${CBT_BASE}/${role}` || path === `${CBT_BASE}/external`) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNavItem = (item: NavItem, keyPrefix: string, isMobile: boolean) => {
    if (isNavGroup(item)) {
      const groupKey = keyPrefix + item.label.replace(/\s+/g, "-").toLowerCase();
      const isOpen = openGroups[groupKey] ?? true;
      const hasActiveChild = item.children.some((c) => isActive(c.path));
      const Icon = item.icon;
      return (
        <div key={groupKey} className="space-y-0.5">
          <button
            type="button"
            onClick={() => toggleGroup(groupKey)}
            className={`flex w-full items-center justify-between gap-2 px-4 py-3 rounded-lg transition-colors text-left ${
              hasActiveChild ? "bg-blue-50/70 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>
          {isOpen && (
            <div className="ml-4 pl-4 border-l border-slate-200 space-y-0.5">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const active = isActive(child.path);
                return (
                  <Link
                    key={child.path}
                    href={child.path}
                    onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active ? "bg-blue-50 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ChildIcon className="w-4 h-4 shrink-0" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={isMobile ? () => setSidebarOpen(false) : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          active ? "bg-blue-50 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex overflow-x-hidden">
      {/* Sidebar - Desktop: off-white background, solid blue logo, light blue active nav */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:min-w-[18rem] bg-slate-50 border-r border-slate-200 shrink-0">
        <div className="p-6 border-b border-slate-200">
          <Link href={CBT_BASE} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">CBT System</h2>
              <p className="text-xs text-slate-500 capitalize">{role} Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {config.nav.map((item, idx) => renderNavItem(item, `nav-${idx}-`, false))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
            <Avatar>
              <AvatarFallback className="bg-slate-600 text-white text-sm font-medium">
                {config.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{config.name}</p>
              <p className="text-xs text-slate-500 truncate">{config.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(18rem,85vw)] max-w-[18rem] bg-slate-50 shadow-xl flex flex-col pl-[env(safe-area-inset-left)]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <Link href={CBT_BASE} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">CBT System</h2>
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

            <nav className="p-4 space-y-1 overflow-y-auto">
              {config.nav.map((item, idx) => renderNavItem(item, `m-${idx}-`, true))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
                <Avatar>
                  <AvatarFallback className="bg-slate-600 text-white text-sm font-medium">
                    {config.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{config.name}</p>
                  <p className="text-xs text-slate-500 truncate">{config.email}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                      id={`cbt-profile-menu-trigger-${role}`}
                    variant="ghost"
                    className="h-11 px-2.5 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-200 transition-colors"
                  >
                    <Avatar className="h-9 w-9 shadow-sm">
                      <AvatarFallback className="bg-slate-600 text-white text-xs font-semibold">
                        {config.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:flex items-center gap-2 ml-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="min-w-[260px] rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-2 shadow-xl shadow-slate-200/60"
                >
                  <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-slate-600 text-white text-xs font-semibold">
                          {config.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{config.name}</div>
                        <div className="text-xs text-slate-500 truncate">{config.email}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    variant="destructive"
                    className="rounded-xl cursor-pointer py-2.5 px-2.5 focus:bg-red-50"
                  >
                    <Link href={CBT_BASE}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-auto bg-slate-100">
          {children}
        </div>
      </main>
    </div>
  );
}
