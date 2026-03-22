"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type Role = "student" | "teacher" | "parent" | "admin" | "external_user";

function readRoleFromStorage(): Role | null {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    const role = String(user?.role ?? "").toLowerCase();
    if (role === "external_user") return "external_user";
    if (role === "student") return "student";
    if (role === "teacher") return "teacher";
    if (role === "parent") return "parent";
    if (role === "admin") return "admin";
    return null;
  } catch {
    return null;
  }
}

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const allowSet = useMemo(() => new Set<Role>(allow), [allow]);

  useEffect(() => {
    const role = readRoleFromStorage();
    if (!role) return;
    if (!allowSet.has(role)) {
      toast.error("You do not have access to that portal.");
      router.replace("/cbt/login");
      return;
    }

    // Extra safety: keep external users inside /cbt/external only.
    if (role === "external_user" && pathname && !pathname.startsWith("/cbt/external")) {
      router.replace("/cbt/external");
    }
  }, [allowSet, pathname, router]);

  return <>{children}</>;
}

