"use client";

import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { RoleGuard } from "../components/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["admin"]}>
      <DashboardLayout role="admin">{children}</DashboardLayout>
    </RoleGuard>
  );
}
