"use client";

import { useEffect, useState } from "react";
import { Card, Table, Spin, Alert, Select, Button, Space } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools, getAdminSchoolExams } from "@/app/lib/cbtApi";

export default function AdminCBTReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [examId, setExamId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [exams, setExams] = useState<{ id: number; title: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (schoolId) params.school_id = schoolId;
      if (examId) params.exam_id = examId;
      const res = await cbtAdmin.getReports(params);
      const data = (res.data as any)?.data ?? res.data;
      setReports(Array.isArray(data) ? data : data?.results ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports.");
      setReports([]);
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
    if (!schoolId) {
      setExams([]);
      setExamId(undefined);
      return;
    }
    (async () => {
      setLoadingExams(true);
      setExamId(undefined);
      setExams([]);
      try {
        const res = await getAdminSchoolExams(schoolId);
        const payload = res.data as any;
        const list = payload?.exams ?? [];
        setExams(list.map((e: any) => ({ id: e.id, title: e.title ?? `Exam ${e.id}` })));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load exams.");
      } finally {
        setLoadingExams(false);
      }
    })();
  }, [schoolId]);

  useEffect(() => {
    loadReports();
  }, []);

  const schoolOptions = schools.map((s) => ({ value: String(s.id), label: s.name }));
  const examOptions = exams.map((e) => ({ value: String(e.id), label: e.title }));

  return (
    <DashboardLayout role="admin">
      <Card title="CBT Reports">
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
          <Select
            placeholder="Select exam"
            allowClear
            style={{ width: 280 }}
            value={examId}
            onChange={setExamId}
            options={examOptions}
            loading={loadingExams}
            disabled={!schoolId}
          />
          <Button type="primary" onClick={loadReports} loading={loading}>Apply filters</Button>
        </Space>
        <Table
          dataSource={reports}
          rowKey={(r) => r.id ?? r.attempt_id ?? Math.random()}
          loading={loading}
          pagination={{ pageSize: 10 }}
          columns={reports.length ? Object.keys(reports[0]).map((k) => ({ title: k, dataIndex: k, key: k })) : []}
        />
      </Card>
    </DashboardLayout>
  );
}
