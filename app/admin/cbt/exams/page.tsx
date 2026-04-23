"use client";

import { useEffect, useState } from "react";
import { Card, Table, Spin, Alert, Button, Tag, App, Modal, Select, Space } from "antd";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, cbtAdminListExams, getAdminSchools } from "@/app/lib/cbtApi";
import { getApiErrorMessage } from "@/app/lib/api";

export default function AdminCBTExamsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const loadExams = async () => {
    setLoading(true);
    setError("");
    try {
      const params = schoolId ? { school_id: parseInt(schoolId, 10) } : undefined;
      const res = await cbtAdminListExams(params);
      const data = (res.data as any)?.data ?? res.data;
      setExams(Array.isArray(data) ? data : data?.exams ?? []);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to load exams."));
      setExams([]);
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
    loadExams();
  }, [schoolId]);

  const handleLock = (examId: number, title: string) => {
    Modal.confirm({
      title: "Lock exam",
      content: `Lock "${title}"? No further submissions will be allowed.`,
      onOk: async () => {
        setActionLoading(examId);
        try {
          await cbtAdmin.lockExam(examId);
          message.success("Exam locked.");
          loadExams();
        } catch (e: any) {
          message.error(getApiErrorMessage(e, "Failed to lock."));
          if (e?.response?.status === 403) {
            setError(getApiErrorMessage(e, "You are not allowed to lock this exam in the selected school scope."));
          }
          loadExams();
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUnlock = (examId: number, title: string) => {
    Modal.confirm({
      title: "Unlock exam",
      content: `Unlock "${title}"? Submissions will be allowed again.`,
      onOk: async () => {
        setActionLoading(examId);
        try {
          await cbtAdmin.unlockExam(examId);
          message.success("Exam unlocked.");
          loadExams();
        } catch (e: any) {
          message.error(getApiErrorMessage(e, "Failed to unlock."));
          if (e?.response?.status === 403) {
            setError(getApiErrorMessage(e, "You are not allowed to unlock this exam in the selected school scope."));
          }
          loadExams();
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Duration (min)", dataIndex: "duration_minutes", key: "duration_minutes", width: 120 },
    {
      title: "Status",
      key: "status",
      render: (_: any, r: any) => (r.is_locked ? <Tag color="red">Locked</Tag> : <Tag color="green">Open</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: any, r: any) => (
        <>
          {r.is_locked ? (
            <Button size="small" onClick={() => handleUnlock(r.id, r.title)} loading={actionLoading === r.id}>Unlock</Button>
          ) : (
            <Button size="small" danger onClick={() => handleLock(r.id, r.title)} loading={actionLoading === r.id}>Lock</Button>
          )}
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div style={{ display: "flex", justifyContent: "center", minHeight: 280, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const schoolOptions = schools.map((s) => ({ value: String(s.id), label: s.name }));
  return (
    <DashboardLayout role="admin">
      <Card title="CBT Exam Control">
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
          <Button type="primary" onClick={loadExams} loading={loading}>Refresh</Button>
        </Space>
        <Table dataSource={exams} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </DashboardLayout>
  );
}
