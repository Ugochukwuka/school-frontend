"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button, App, Dropdown } from "antd";
import { EyeOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

interface Class {
  id: number;
  name: string;
  arm?: string | null;
  class_level_id?: number | null;
  class_teacher_id?: number | null;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  uuid: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

interface ExamTimetableEntry {
  id: number;
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  room_number: string;
  created_at: string;
  updated_at: string;
  class: Class | null;
  subject: Subject | null;
}

export default function ViewExamTimetablePage() {
  const router = useRouter();
  const { modal } = App.useApp();
  const { isMobile, isTablet } = useResponsive();
  const [timetable, setTimetable] = useState<ExamTimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<ExamTimetableEntry[] | { data: ExamTimetableEntry[] }>(
        "/viewexam/timetable"
      );
      let timetableData: ExamTimetableEntry[] = [];
      if (Array.isArray(response.data)) {
        timetableData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        timetableData = response.data.data;
      }
      setTimetable(timetableData);
    } catch (err: any) {
      console.error("Error fetching exam timetable:", err);
      setError(err.response?.data?.message || "Failed to load exam timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/students/viewsingleexamtimetable/${id}`);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Delete Exam Timetable Entry",
      content: "Are you sure you want to delete this exam timetable entry? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(true);
        setError("");
        setSuccess("");
        try {
          const response = await api.delete(`/exam/timetable/${id}`);
          const messageText = response.data?.message || "Exam timetable entry deleted successfully";
          
          if (messageText.includes("deleted successfully")) {
            setSuccess(messageText);
            // Refresh the timetable list
            await fetchTimetable();
            // Redirect after 5 seconds
            setTimeout(() => {
              router.push("/admin/viewexam/timetable");
            }, 5000);
          } else {
            setError(messageText);
          }
        } catch (err: any) {
          console.error("Error deleting exam timetable:", err);
          const errorMessage = err.response?.data?.message || "Failed to delete exam timetable entry. Please try again.";
          setError(errorMessage);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "S/N",
      key: "sn",
      width: 60,
      align: "center" as const,
      render: (_: any, __: ExamTimetableEntry, index: number) => {
        return index + 1;
      },
    },
    {
      title: "Class",
      key: "class",
      render: (_: any, record: ExamTimetableEntry) => {
        if (record.class) {
          return `${record.class.name}${record.class.arm ? record.class.arm : ""}`;
        }
        return "-";
      },
    },
    {
      title: "Subject",
      key: "subject",
      render: (_: any, record: ExamTimetableEntry) => {
        if (record.subject) {
          return record.subject.name;
        }
        return "-";
      },
    },
    {
      title: "Exam Date",
      dataIndex: "exam_date",
      key: "exam_date",
      responsive: ["md"] as any,
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
      responsive: ["lg"] as any,
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
      responsive: ["lg"] as any,
    },
    {
      title: "Exam Type",
      dataIndex: "exam_type",
      key: "exam_type",
      responsive: ["md"] as any,
    },
    {
      title: "Room",
      dataIndex: "room_number",
      key: "room_number",
      responsive: ["sm"] as any,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      fixed: isMobile ? "right" : undefined,
      render: (_: any, record: ExamTimetableEntry) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "View",
            icon: <EyeOutlined />,
            onClick: () => handleView(record.id),
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]} disabled={deleting}>
            <Button icon={<MoreOutlined />} size={isMobile ? "small" : "middle"} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title 
          level={isMobile ? 3 : 1} 
          style={{ 
            marginBottom: isMobile ? "16px" : "24px",
            fontSize: isMobile ? "20px" : undefined,
          }}
        >
          View Exam Timetable
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: isMobile ? 16 : 24 }}
          />
        )}

        {success && (
          <Alert
            title={success}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess("")}
            style={{ marginBottom: isMobile ? 16 : 24 }}
          />
        )}

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={timetable}
            rowKey="id"
            pagination={{ 
              pageSize: isMobile ? 10 : isTablet ? 15 : 20,
              showSizeChanger: !isMobile,
              showTotal: (total) => `Total ${total} entries`,
              simple: isMobile,
              size: isMobile ? "small" : "default",
            }}
            scroll={{ x: isMobile ? 800 : true }}
            size={isMobile ? "small" : "default"}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
