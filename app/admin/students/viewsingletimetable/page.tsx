"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space, App } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Subject {
  id: number;
  name: string;
  code?: string;
}

interface Teacher {
  id: number;
  name: string;
  email?: string;
}

interface ClassInfo {
  id: number;
  name: string;
  arm?: string;
}

interface TimetableData {
  id: number;
  class_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
  subject?: Subject;
  teacher?: Teacher;
  class?: ClassInfo;
}

export default function ViewSingleTimetablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timetableId = searchParams.get("id");
  const { modal } = App.useApp();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
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
      const response = await api.get<TimetableData | { data: TimetableData }>(`/students/viewsingletimetable/${id}`);
      console.log("Timetable response:", response.data);
      // Handle both direct response and wrapped response
      const timetableData = (response.data as any)?.data || response.data;
      setTimetable(timetableData as TimetableData);
    } catch (err: any) {
      console.error("Error fetching timetable:", err);
      setError(err.response?.data?.message || "Failed to load timetable. Please try again.");
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
      fetchTimetable(inputId);
    }
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Delete Timetable Entry",
      content: "Are you sure you want to delete this timetable entry? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(true);
        setError("");
        setSuccess("");
        try {
          const response = await api.delete(`/timetable/${id}`);
          const messageText = response.data?.message || "Timetable entry deleted successfully";
          
          if (messageText.includes("deleted successfully")) {
            setSuccess(messageText);
            // Redirect after 5 seconds
            setTimeout(() => {
              router.push("/admin/students/viewtimetable");
            }, 5000);
          } else {
            setError(messageText);
          }
        } catch (err: any) {
          console.error("Error deleting timetable:", err);
          const errorMessage = err.response?.data?.message || "Failed to delete timetable entry. Please try again.";
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
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Timetable
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
          />
        )}

        {success && (
          <Alert
            title={success}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess("")}
            style={{ marginBottom: 24 }}
          />
        )}

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Enter Timetable ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onPressEnter={handleView}
            style={{ width: 300, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleView}>
            View
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : timetable ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{timetable.id}</Descriptions.Item>
              <Descriptions.Item label="Class">
                {timetable.class 
                  ? `${timetable.class.name}${timetable.class.arm || ''}` 
                  : `Class ID: ${timetable.class_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Subject">
                {timetable.subject?.name || `Subject ID: ${timetable.subject_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Teacher">
                {timetable.teacher?.name || `Teacher ID: ${timetable.teacher_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Day of Week">{timetable.day_of_week}</Descriptions.Item>
              <Descriptions.Item label="Start Time">{timetable.start_time ? timetable.start_time.substring(0, 5) : timetable.start_time}</Descriptions.Item>
              <Descriptions.Item label="End Time">{timetable.end_time ? timetable.end_time.substring(0, 5) : timetable.end_time}</Descriptions.Item>
            </Descriptions>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/students/timetable/update?id=${timetable.id}`)}
              >
                Edit
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(timetable.id)}
                loading={deleting}
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
