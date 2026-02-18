"use client";

import { useEffect } from "react";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

export default function DynamicTitle() {
  const { schoolName } = useSchoolProfile();

  useEffect(() => {
    if (schoolName && typeof document !== "undefined") {
      document.title = schoolName;
    }
  }, [schoolName]);

  return null;
}
