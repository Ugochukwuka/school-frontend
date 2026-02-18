"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";

export default function UpdateTuitionFeeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/admin/updateTuitionFee/${id}`);
    } else {
      router.replace("/admin/tuitionfee/viewall");
    }
  }, [router, id]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}
