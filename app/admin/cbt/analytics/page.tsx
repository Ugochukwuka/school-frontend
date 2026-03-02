"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Row, Col, Statistic, Select, Space, Button } from "antd";
import { FileTextOutlined, TrophyOutlined, UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";

export default function AdminCBTAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const params = schoolId ? { school_id: parseInt(schoolId, 10) } : undefined;
      const res = await cbtAdmin.getAnalytics(params);
      const payload = (res.data as any)?.data ?? res.data;
      setData(payload ?? {});
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadAnalytics();
  }, [schoolId]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data && typeof data === "object" ? data : {};
  const schoolOptions = schools.map((s) => ({ value: String(s.id), label: s.name }));
  return (
    <DashboardLayout role="admin">
      <Card title="CBT Analytics">
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select school"
            allowClear
            style={{ width: 220 }}
            value={schoolId}
            onChange={setSchoolId}
            options={schoolOptions}
            loading={loadingSchools}
          />
          <Button type="primary" onClick={loadAnalytics} loading={loading}>Apply</Button>
        </Space>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="Exams" value={stats.total_exams ?? 0} prefix={<FileTextOutlined />} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="Attempts" value={stats.total_attempts ?? 0} prefix={<UserOutlined />} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="Submissions" value={stats.submissions ?? 0} prefix={<CheckCircleOutlined />} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="Other" value={stats.other ?? 0} prefix={<TrophyOutlined />} /></Card>
          </Col>
        </Row>
      </Card>
    </DashboardLayout>
  );
}
