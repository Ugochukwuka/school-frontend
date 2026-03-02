"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Button, Typography, Flex } from "antd";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtStudent } from "@/app/lib/cbtApi";

export default function StudentCBTResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtStudent.getResultHistory();
        const data = (res.data as any)?.data ?? res.data;
        setHistory(Array.isArray(data) ? data : data?.results ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load result history.");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      <Card title="My CBT Results">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {history.map((item: any) => {
            const examId = item.exam_id ?? item.id;
            const title = item.exam?.title ?? item.exam_title ?? item.title ?? `Exam #${examId}`;
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
              : "";
            return (
              <Flex
                key={item.id ?? examId}
                align="center"
                justify="space-between"
                style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
                wrap="wrap"
                gap={8}
              >
                <div>
                  <Typography.Text strong style={{ display: "block" }}>
                    {title}
                  </Typography.Text>
                  {dateStr && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dateStr}
                    </Typography.Text>
                  )}
                </div>
                <Button type="link" onClick={() => router.push(`/dashboard/student/cbt/results/${examId}`)}>
                  View result
                </Button>
              </Flex>
            );
          })}
        </div>
      </Card>
    </DashboardLayout>
  );
}
