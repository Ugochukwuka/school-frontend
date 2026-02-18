"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function ViewAllTuitionFeesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/tuitionfee/viewall");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}
