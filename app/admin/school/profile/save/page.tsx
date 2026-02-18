"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function SaveSchoolProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/schoolprofile/add");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}
