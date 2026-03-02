"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Descriptions, Typography } from "antd";
import { useParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtStudent } from "@/app/lib/cbtApi";

const { Title } = Typography;

export default function StudentCBTResultDetailPage() {
  const params = useParams();
  const examId = Number(params.examId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!examId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtStudent.getResultHistory();
        const raw = (res.data as any)?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : [];
        const data = list.find((r: any) => Number(r.exam_id) === examId) ?? list[0];
        setResult(data ?? null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load result.");
        setResult(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const pageTitle = result?.exam?.title ?? result?.title ?? (examId ? `Exam #${examId}` : "Result");

  const excludeKeys = new Set([
    "id", "exam_id", "student_id", "attempt_id", "published_at", "created_at", "updated_at", "exam", "attempt",
  ]);

  const labelMap: Record<string, string> = {
    total_score: "Total Score",
    total_marks: "Total Marks",
    percentage: "Percentage",
    grade: "Grade",
  };

  return (
    <DashboardLayout role="student">
      <Card title={`Result for ${pageTitle}`}>
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        {!result && !error && (
          <Alert type="info" title="No result found for this exam." />
        )}
        {result && (() => {
          const questionResults = result.question_results ?? result.questions ?? result.details ?? [];
          const hasBreakdown = Array.isArray(questionResults) && questionResults.length > 0;
          const getCorrect = (item: any) => item?.correct === true || item?.is_correct === true;
          return (
            <>
              {hasBreakdown && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>Questions</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {questionResults.map((item: any, idx: number) => {
                      const correct = getCorrect(item);
                      const circleStyle: React.CSSProperties = {
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "1px solid #d9d9d9",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        background: correct ? "#1890ff" : "#ff4d4f",
                        color: "#fff",
                      };
                      return (
                        <span
                          key={item?.question_id ?? item?.id ?? idx}
                          style={circleStyle}
                          title={`Question ${idx + 1}: ${correct ? "Correct" : "Incorrect"}`}
                        >
                          {idx + 1}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                    <span style={{ marginRight: 16 }}><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: "#1890ff", verticalAlign: "middle", marginRight: 4 }} /> Correct</span>
                    <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: "#ff4d4f", verticalAlign: "middle", marginRight: 4 }} /> Incorrect</span>
                  </div>
                </div>
              )}
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Subject">
              {result.exam?.subject?.name ?? result.subject?.name ?? result.subject_name ?? "—"}
            </Descriptions.Item>
            {Object.entries(result)
              .filter(([k]) => !excludeKeys.has(k) && k !== "exam" && k !== "attempt")
              .map(([k, v]) => {
                if (v == null || typeof v === "object") return null;
                const label = labelMap[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <Descriptions.Item key={k} label={label}>
                    {String(v)}
                  </Descriptions.Item>
                );
              })}
              </Descriptions>
            </>
          );
        })()}
      </Card>
    </DashboardLayout>
  );
}
