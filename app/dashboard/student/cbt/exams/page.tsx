"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Button, Tag, Flex } from "antd";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtStudent, type AvailableExamDto } from "@/app/lib/cbtApi";
import { getApiErrorMessage } from "@/app/lib/api";

export default function StudentCBTExamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState<AvailableExamDto[]>([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtStudent.getAvailableExams();
        const raw = res.data as any;
        const data = raw?.data ?? res.data;
        const list = Array.isArray(data) ? data : raw?.exams ?? [];
        setExams(list);
        if (list.length === 0) {
          setEmptyMessage(raw?.empty_message ?? raw?.message ?? "No exam currently available.");
        } else {
          setEmptyMessage("");
        }
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Failed to load available exams."));
        setExams([]);
        setEmptyMessage("");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startExam = async (examId: number) => {
    try {
      const res = await cbtStudent.startExam(examId);
      const data = (res.data as any)?.data ?? res.data;
      const attemptId = data?.attempt_id ?? data?.id;
      if (attemptId) router.push(`/dashboard/student/cbt/attempt/${attemptId}`);
      else router.push(`/dashboard/student/cbt/attempt/${examId}`);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to start exam."));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Card title="Available Exams">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        {exams.length === 0 && emptyMessage && (
          <Alert type="info" title={emptyMessage} showIcon style={{ marginBottom: 16 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {exams.map((item) => (
            <Flex
              key={item.id}
              align="center"
              justify="space-between"
              wrap="wrap"
              gap="middle"
              style={{
                padding: "12px 16px",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {item.title ?? item.name ?? `Exam #${item.id}`}
                </div>
                <div>
                  {item.duration_minutes != null && <Tag>{item.duration_minutes} min</Tag>}
                  {item.total_marks != null && <Tag>Total: {item.total_marks} marks</Tag>}
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => startExam(item.id)}
                disabled={item.can_start_now === false}
                title={item.can_start_now === false ? item.start_blocked_reason || "Exam is not available to start yet." : undefined}
              >
                Start exam
              </Button>
              {item.can_start_now === false && item.start_blocked_reason ? (
                <div style={{ width: "100%", color: "#8c8c8c", fontSize: 12 }}>{item.start_blocked_reason}</div>
              ) : null}
            </Flex>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
