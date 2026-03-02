"use client";

import { useEffect, useState } from "react";
import { Card, InputNumber, Button, Radio, Alert, App, Select, Space } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";

export default function AdminCBTExportPage() {
  const { message } = App.useApp();
  const [examId, setExamId] = useState<number | null>(null);
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingSchools(true);
      try {
        const res = await getAdminSchools();
        const data = (res.data as any)?.data ?? res.data;
        const list = Array.isArray(data) ? data : data?.schools ?? [];
        setSchools(
          list.map((s: any) => ({
            id: s.id,
            name: s.name ?? s.school_name ?? s.schoolName ?? `School ${s.id}`,
          }))
        );
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load schools.");
      } finally {
        setLoadingSchools(false);
      }
    })();
  }, []);

  const handleExportExam = async () => {
    if (!examId) {
      message.warning("Enter exam ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cbtAdmin.exportExamResults(examId, format);
      const blob = res.data instanceof Blob ? res.data : new Blob([JSON.stringify(res.data)]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cbt-exam-${examId}-results.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success("Download started.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Export failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const params = schoolId ? { school_id: parseInt(schoolId, 10) } : undefined;
      const res = await cbtAdmin.exportReportsSummary(params);
      const blob = res.data instanceof Blob ? res.data : new Blob([JSON.stringify(res.data)]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cbt-reports-summary.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      message.success("Download started.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Export failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card title="CBT Export">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <div style={{ marginBottom: 24 }}>
          <h4>Export exam results</h4>
          <InputNumber placeholder="Exam ID" min={1} value={examId ?? undefined} onChange={(v) => setExamId(v ?? null)} style={{ width: 120, marginRight: 8 }} />
          <Radio.Group value={format} onChange={(e) => setFormat(e.target.value)} style={{ marginRight: 8 }}>
            <Radio value="csv">CSV</Radio>
            <Radio value="pdf">PDF</Radio>
          </Radio.Group>
          <Button type="primary" onClick={handleExportExam} loading={loading}>Download</Button>
        </div>
        <div>
          <h4>Export full summary</h4>
          <Space style={{ marginBottom: 8 }}>
            <Select
              placeholder="Select school (optional)"
              allowClear
              style={{ width: 220 }}
              value={schoolId}
              onChange={setSchoolId}
              options={schools.map((s) => ({ value: String(s.id), label: s.name }))}
              loading={loadingSchools}
            />
            <Button onClick={handleExportSummary} loading={loading}>Export summary (CSV)</Button>
          </Space>
        </div>
      </Card>
    </DashboardLayout>
  );
}
