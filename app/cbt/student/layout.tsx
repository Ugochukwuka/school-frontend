"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { RoleGuard } from "../components/RoleGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Full-screen exam taking pages (school or external) — no sidebar
  if (pathname?.includes("/student/exam/") || pathname?.includes("/student/external-exam/")) {
    return (
      <RoleGuard allow={["student"]}>
        {children}
      </RoleGuard>
    );
  }
  return (
    <RoleGuard allow={["student"]}>
      <DashboardLayout role="student">{children}</DashboardLayout>
    </RoleGuard>
  );
}
