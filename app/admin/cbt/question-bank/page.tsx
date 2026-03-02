"use client";

import { useEffect, useState } from "react";
import { Card, Table, Spin, Alert, Button, Popconfirm, Select, Space } from "antd";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtAdmin, getAdminSchools } from "@/app/lib/cbtApi";

export default function AdminCBTQuestionBankPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = schoolId ? { school_id: parseInt(schoolId, 10) } : undefined;
      const res = await cbtAdmin.listQuestionBank(params);
      const data = (res.data as any)?.data ?? res.data;
      setList(Array.isArray(data) ? data : data?.questions ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load question bank.");
      setList([]);
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
    load();
  }, [schoolId]);

  const handleDelete = async (id: number) => {
    try {
      await cbtAdmin.deleteQuestionBank(id);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Delete failed.");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Subject ID", dataIndex: "subject_id", key: "subject_id", width: 100 },
    { title: "Type", dataIndex: "question_type", key: "question_type", width: 80 },
    { title: "Question", dataIndex: "question_text", key: "question_text", ellipsis: true },
    { title: "Marks", dataIndex: "marks", key: "marks", width: 70 },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this question?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
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
      <Card title="CBT Question Bank" extra={<Link href="/admin/cbt/question-bank/create"><Button type="primary">Create</Button></Link>}>
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
          <Button onClick={load} loading={loading}>Refresh</Button>
        </Space>
        <Table dataSource={list} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </DashboardLayout>
  );
}
