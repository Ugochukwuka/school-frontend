"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space, App } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
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

interface ExamTimetableData {
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

export default function ViewSingleExamTimetablePage() {
  const router = useRouter();
  const params = useParams();
  const { isMobile, isTablet } = useResponsive();
  const { modal } = App.useApp();
  const timetableId = params?.id as string;
  const [timetable, setTimetable] = useState<ExamTimetableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inputId, setInputId] = useState(timetableId || "");
  const [deleting, setDeleting] = useState(false);

  const fetchTimetable = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<ExamTimetableData | { data: ExamTimetableData }>(`/students/viewsingleexamtimetable/${id}`);
      // Handle both direct response and wrapped response
      const timetableData = (response.data as any)?.data || response.data;
      setTimetable(timetableData as ExamTimetableData);
    } catch (err: any) {
      console.error("Error fetching exam timetable:", err);
      setError(err.response?.data?.message || "Failed to load exam timetable. Please try again.");
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timetableId) {
      fetchTimetable(timetableId);
    }
  }, [timetableId]);

  const handleView = () => {
    if (inputId) {
      router.push(`/admin/students/viewsingleexamtimetable/${inputId}`);
    }
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
          View Single Exam Timetable
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

        <div style={{ 
          marginBottom: isMobile ? 16 : 24,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 8 : 0,
        }}>
          <Input
            placeholder="Enter Exam Timetable ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onPressEnter={handleView}
            style={{ 
              width: isMobile ? "100%" : 300, 
              marginRight: isMobile ? 0 : 8,
              marginBottom: isMobile ? 8 : 0,
            }}
            size={isMobile ? "large" : "middle"}
          />
          <Button 
            type="primary" 
            onClick={handleView}
            size={isMobile ? "large" : "middle"}
            block={isMobile}
          >
            View
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : timetable ? (
          <>
            <Descriptions 
              bordered 
              column={isMobile ? 1 : isTablet ? 1 : 2} 
              style={{ marginBottom: isMobile ? 16 : 24 }}
              size={isMobile ? "small" : "middle"}
            >
              <Descriptions.Item label="ID">{timetable.id}</Descriptions.Item>
              <Descriptions.Item label="Class">
                {timetable.class ? `${timetable.class.name}${timetable.class.arm ? timetable.class.arm : ""}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Subject">
                {timetable.subject ? timetable.subject.name : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Exam Date">{timetable.exam_date}</Descriptions.Item>
              <Descriptions.Item label="Start Time">{timetable.start_time}</Descriptions.Item>
              <Descriptions.Item label="End Time">{timetable.end_time}</Descriptions.Item>
              <Descriptions.Item label="Exam Type">{timetable.exam_type}</Descriptions.Item>
              <Descriptions.Item label="Room Number">{timetable.room_number}</Descriptions.Item>
            </Descriptions>
            <Space 
              orientation={isMobile ? "vertical" : "horizontal"}
              style={{ width: isMobile ? "100%" : "auto" }}
              size={isMobile ? "small" : "middle"}
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                size={isMobile ? "large" : "middle"}
                block={isMobile}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/exam/timetable/update/${timetable.id}`)}
                size={isMobile ? "large" : "middle"}
                block={isMobile}
              >
                Edit
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(timetable.id)}
                loading={deleting}
                size={isMobile ? "large" : "middle"}
                block={isMobile}
              >
                Delete
              </Button>
            </Space>
          </>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
