"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface TimetableData {
  id: number;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
  teacher_name?: string;
}

export default function ViewSingleTimetablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timetableId = searchParams.get("id");
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(timetableId || "");

  const fetchTimetable = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<TimetableData>(`/students/viewsingletimetable/${id}`);
      setTimetable(response.data);
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

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Timetable
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
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
              <Descriptions.Item label="Class">{timetable.class_name || timetable.class_id}</Descriptions.Item>
              <Descriptions.Item label="Subject">{timetable.subject_name || timetable.subject_id}</Descriptions.Item>
              <Descriptions.Item label="Day of Week">{timetable.day_of_week}</Descriptions.Item>
              <Descriptions.Item label="Start Time">{timetable.start_time}</Descriptions.Item>
              <Descriptions.Item label="End Time">{timetable.end_time}</Descriptions.Item>
              <Descriptions.Item label="Teacher">{timetable.teacher_name || timetable.teacher_id}</Descriptions.Item>
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
                onClick={() => router.push(`/admin/timetable/weekly/update?id=${timetable.id}`)}
              >
                Edit
              </Button>
            </Space>
          </>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
