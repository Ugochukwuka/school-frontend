"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "../components/layouts/DashboardLayout";

/**
 * Layout for external_user role: same CBT dashboard shell, sidebar shows only
 * External CBT items (Dashboard, Available External Exams, My External Results).
 * Role check: external_user should only access /cbt/external/* routes (enforced by login redirect).
 */
export default function ExternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Full-screen exam taking — no sidebar (path: /cbt/external/exam/[examId])
  if (pathname?.includes("/external/exam/")) {
    return <>{children}</>;
  }
  return <DashboardLayout role="external_user">{children}</DashboardLayout>;
}
