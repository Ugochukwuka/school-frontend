"use client";

import { CBT_BASE } from "../../cbt-urls";
import { ExternalExamsList } from "../../components/external/ExternalExamsList";

export default function ExternalUserExamsPage() {
  return (
    <ExternalExamsList
      title="Available External Exams"
      description="Browse and start published external exams"
      takeExamHrefForExamId={(id) => `${CBT_BASE}/external/exam/${id}`}
    />
  );
}

