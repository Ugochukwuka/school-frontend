"use client";

import { useEffect, useState } from "react";
import { Card, Table, Spin, Alert, Button, Tag, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBackendUtcToLocal } from "@/app/lib/dateUtils";
import DashboardLayout from "@/app/components/DashboardLayout";
import { cbtTeacherListExams, cbtTeacher } from "@/app/lib/cbtApi";

interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
}

export default function TeacherCBTExamsPage() {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ current: 1, pageSize: 15, total: 0 });
  const router = useRouter();

  const load = async (page: number = 1, perPage: number = 15) => {
    setLoading(true);
    setError("");
    try {
      const res = await cbtTeacherListExams({ page, per_page: perPage });
      const payload = res.data?.data;
      const list = payload?.data ?? [];
      setExams(Array.isArray(list) ? list : []);
      if (payload) {
        setPagination({
          current: payload.current_page,
          pageSize: payload.per_page ?? perPage,
          total: payload.total ?? 0,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load exams.");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(pagination.current, pagination.pageSize);
  }, []);

  const publish = async (id: number) => {
    try {
      await cbtTeacher.publishExam(id);
      load(pagination.current, pagination.pageSize);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed.");
    }
  };
  const unpublish = async (id: number) => {
    try {
      await cbtTeacher.unpublishExam(id);
      load(pagination.current, pagination.pageSize);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed.");
    }
  };

  const deleteExam = async (examId: number) => {
    try {
      await cbtTeacher.deleteExam(examId);
      load(pagination.current, pagination.pageSize);
      router.push("/teachers/cbt/exams");
    } catch (e: any) {
      setError(e.response?.data?.message || "Delete failed.");
    }
  };

  const getActionItems = (r: any): MenuProps["items"] => {
    const isPublished = r.status === "published" || r.published_at;
    return [
      {
        key: "edit",
        label: <Link href={`/teachers/cbt/exams/${r.id}`}>Edit Settings</Link>,
      },
      {
        key: "preview",
        label: <Link href={`/teachers/cbt/exams/${r.id}/preview`}>Preview</Link>,
      },
      {
        key: "publish",
        label: isPublished ? "Unpublish" : "Publish",
        onClick: () => {
          modal.confirm({
            title: isPublished ? "Unpublish this exam?" : "Publish this exam?",
            content: isPublished
              ? "Students will no longer be able to take this exam. You can publish it again later."
              : "Students will be able to see and take this exam. Are you sure?",
            okText: isPublished ? "Unpublish" : "Publish",
            okButtonProps: isPublished ? undefined : { type: "primary" },
            onOk: () => (isPublished ? unpublish(r.id) : publish(r.id)),
          });
        },
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete",
        danger: true,
        onClick: () => {
          modal.confirm({
            title: "Delete this exam?",
            content: "This will remove the exam and related data. This cannot be undone.",
            okText: "Delete",
            okButtonProps: { danger: true },
            onOk: () => deleteExam(r.id),
          });
        },
      },
    ];
  };

  const formatDateTime = (value: string | null | undefined) =>
    formatBackendUtcToLocal(value);

  const columns = [
    {
      title: "ID",
      key: "id",
      width: 70,
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Duration (min)", dataIndex: "duration_minutes", key: "duration_minutes", width: 110 },
    {
      title: "Start time",
      dataIndex: "start_time",
      key: "start_time",
      width: 160,
      render: (_: any, r: any) => formatDateTime(r.start_time),
    },
    {
      title: "End time",
      dataIndex: "end_time",
      key: "end_time",
      width: 160,
      render: (_: any, r: any) => formatDateTime(r.end_time),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_: any, r: any) =>
        (r.status === "published" || r.published_at) ? (
          <Tag color="green">Published</Tag>
        ) : (
          <Tag>Draft</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: getActionItems(r) }} trigger={["click"]} placement="bottomRight">
          <Button>Actions</Button>
        </Dropdown>
      ),
    },
  ];

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
      <Card title="My Exams" extra={<Link href="/teachers/cbt/exams/new"><Button type="primary">Create exam</Button></Link>}>
        {error && <Alert type="error" title={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
        <Table
          dataSource={exams}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} exam(s)`,
            onChange: (page, pageSize) => {
              load(page, pageSize ?? pagination.pageSize);
            },
          }}
        />
      </Card>
    </DashboardLayout>
  );
}
