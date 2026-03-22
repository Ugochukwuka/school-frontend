"use client";

import { CBT_BASE } from "../../cbt-urls";
import { ExternalExamsList } from "../../components/external/ExternalExamsList";

export default function StudentExternalExamsPage() {
  return (
    <ExternalExamsList
      title="External Exams"
      description="Take external (e.g. WAEC, JAMB) exams from this list"
      takeExamHrefForExamId={(id) => `${CBT_BASE}/student/external-exam/${id}`}
    />
  );
}
