"use client";

import { DashboardLayout } from "../components/layouts/DashboardLayout";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="parent">{children}</DashboardLayout>;
}
