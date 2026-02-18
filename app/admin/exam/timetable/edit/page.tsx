"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
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

export default function EditExamTimetablePage() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const [timetable, setTimetable] = useState<ExamTimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleEdit = (id: number) => {
    router.push(`/admin/exam/timetable/update/${id}`);
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
      width: 80,
      fixed: isMobile ? ("right" as const) : undefined,
      render: (_: any, record: ExamTimetableEntry) => (
        <Button
          type="link"
          icon={isMobile ? <EditOutlined /> : undefined}
          size={isMobile ? "small" : "middle"}
          onClick={() => handleEdit(record.id)}
        >
          {isMobile ? "" : "Edit"}
        </Button>
      ),
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
          Edit Exam Timetable
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
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
              size: isMobile ? "small" : "middle",
            }}
            scroll={{ x: isMobile ? 800 : true }}
            size={isMobile ? "small" : "middle"}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
