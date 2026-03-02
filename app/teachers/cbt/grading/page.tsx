"use client";

import { useEffect, useState } from "react";
import { Card, Table, Spin, Alert, Button } from "antd";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtTeacherListExams } from "@/app/lib/cbtApi";

export default function TeacherCBTGradingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await cbtTeacherListExams();
        const payload = (res.data as any)?.data ?? res.data;
        const list = payload?.data ?? payload;
        setExams(Array.isArray(list) ? list : Array.isArray(payload?.exams) ? payload.exams : []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load exams.");
        setExams([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Card title="Grading & Review">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <p>Select an exam to view attempts and mark theory questions.</p>
        <Table
          dataSource={exams}
          rowKey="id"
          columns={[
            { title: "ID", dataIndex: "id", width: 70 },
            { title: "Title", dataIndex: "title" },
            {
              title: "Actions",
              key: "actions",
              render: (_: any, r: any) => (
                <Link href={`/teachers/cbt/exams/${r.id}`}><Button size="small">View attempts</Button></Link>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </DashboardLayout>
  );
}
