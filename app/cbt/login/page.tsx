"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { ClientOnlyIcon } from "../components/ClientOnlyIcon";
import { CBT_BASE, getCbtLoginApiUrl } from "../cbt-urls";

type Role = "student" | "teacher" | "admin" | "parent" | "external_user";

// Demo credentials (password is "password" for all):
// Admin: admin@example.com | Parent: parent1@example.com | Teacher: johndoe@example.com | Student: studenta@example.com

export default function CbtLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(getCbtLoginApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? (data?.errors ? Object.values(data.errors).flat().join(" ") : "Login failed."));
        setLoading(false);
        return;
      }
      // Role is in data.user.role (same shape as main login API)
      const roleFromApi = (data?.user?.role ?? data?.role) as string | undefined;
      const role = roleFromApi?.toLowerCase?.() || "student";
      const normalizedRole: Role = ["admin", "teacher", "parent", "student", "external_user"].includes(role) ? role : "student";
      if (data?.token) {
        try {
          localStorage.setItem("token", data.token);
          if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
        } catch (_) {}
      }
      // external_user uses /cbt/external (external-only dashboard)
      if (normalizedRole === "external_user") {
        router.push(`${CBT_BASE}/external`);
      } else {
        router.push(`${CBT_BASE}/${normalizedRole}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-64 rounded-full bg-slate-200/20 blur-3xl" />
      </div>

      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/80 bg-white/60 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium shadow-sm transition-all duration-200 hover:shadow"
      >
        <ClientOnlyIcon icon={ArrowLeft} className="w-4 h-4 shrink-0" />
        Back to home
      </Link>

      <main className="w-full max-w-md flex flex-col items-stretch gap-6 sm:gap-8 relative z-0 min-w-0 mx-auto pb-10 sm:pb-12">
        {/* Hero */}
        <header className="text-center animate-fade-in-down shrink-0 space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 ring-2 ring-white/20">
            <ClientOnlyIcon icon={BookOpen} className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              CBT Management System
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">Sign in to access your portal</p>
          </div>
        </header>

        {/* Form card */}
        <Card className="animate-fade-in-up shadow-[0_4px_14px_0_rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col w-full min-w-0">
          <CardHeader className="space-y-1 pb-2 sm:pb-4 pt-6 sm:pt-6 px-5 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">Login</CardTitle>
            <CardDescription className="text-slate-500 text-sm">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="overflow-visible px-5 sm:px-6 pb-6 sm:pb-6 pt-0">
            <form onSubmit={handleLogin} className="flex flex-col gap-5 min-w-0">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-0 transition-colors w-full"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-0 transition-colors w-full"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ClientOnlyIcon icon={Loader2} className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-slate-500 max-w-[18rem] sm:max-w-xs mx-auto leading-relaxed animate-fade-in relative z-0 px-2">
          No account? Contact your school admin. After login you will be redirected to your role dashboard.
        </p>
      </main>
    </div>
  );
}
