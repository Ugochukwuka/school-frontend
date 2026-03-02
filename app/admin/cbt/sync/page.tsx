"use client";

import { useEffect, useState } from "react";
import { Card, Button, Spin, Alert, App, Select, Space } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";

export default function AdminCBTSyncPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

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

  const runSync = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = schoolId ? { school_id: parseInt(schoolId, 10) } : {};
      const res = await cbtAdmin.sync(body);
      const data = (res.data as any)?.data ?? res.data;
      setResult(data);
      message.success("Sync completed.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const schoolOptions = schools.map((s) => ({ value: String(s.id), label: s.name }));
  return (
    <DashboardLayout role="admin">
      <Card title="CBT Sync">
        <p>Sync subjects and classes for CBT. Optional: select a school to sync for that school only.</p>
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select school (optional)"
            allowClear
            style={{ width: 220 }}
            value={schoolId}
            onChange={setSchoolId}
            options={schoolOptions}
            loading={loadingSchools}
          />
          <Button type="primary" onClick={runSync} loading={loading}>Run Sync</Button>
        </Space>
        {result && (
          <pre style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </Card>
    </DashboardLayout>
  );
}
