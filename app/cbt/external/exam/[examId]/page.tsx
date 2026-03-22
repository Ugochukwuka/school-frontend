"use client";

import { useParams } from "next/navigation";
import { CBT_BASE } from "../../../cbt-urls";
import { ExternalTakeExam } from "../../../components/external/ExternalTakeExam";

export default function ExternalUserTakeExamPage() {
  const params = useParams();
  const examId = params?.examId as string;

  return (
    <ExternalTakeExam
      examId={examId}
      onExitHref={`${CBT_BASE}/external/exams`}
      onSubmittedHref={`${CBT_BASE}/external`}
    />
  );
}

