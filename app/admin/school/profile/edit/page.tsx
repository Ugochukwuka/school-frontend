"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function EditSchoolProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/schoolprofile/edit");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}
