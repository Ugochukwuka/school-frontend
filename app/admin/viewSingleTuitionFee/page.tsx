"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";

export default function ViewSingleTuitionFeeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/admin/viewSingleTuitionFee/${id}`);
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
