"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, Typography, TimePicker, Space, Descriptions, Input, App } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import dayjs from "dayjs";

const { Title } = Typography;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ClassInfo {
  id: number;
  name: string;
  arm?: string;
}

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

interface TimetableData {
  id: number;
  class_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
  class?: ClassInfo;
  subject?: Subject;
  teacher?: Teacher;
}

export default function UpdateWeeklyTimetablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modal, message } = App.useApp();
  const timetableId = searchParams.get("id");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (timetableId) {
      fetchTimetableData();
    } else {
      setError("Timetable ID is required. Please select a timetable to update.");
      setLoadingData(false);
    }
  }, [timetableId]);

  useEffect(() => {
    if (timetableData && !loadingData) {
      form.setFieldsValue({
        class_id: timetableData.class_id,
        subject_id: timetableData.subject_id,
        day_of_week: timetableData.day_of_week,
        start_time: dayjs(timetableData.start_time, "HH:mm"),
        end_time: dayjs(timetableData.end_time, "HH:mm"),
        teacher_id: timetableData.teacher_id,
      });
    }
  }, [timetableData, loadingData, form]);

  const fetchTimetableData = async () => {
    if (!timetableId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<TimetableData | { data: TimetableData }>(`/students/viewsingletimetable/${timetableId}`);
      console.log("Timetable response:", response.data);
      // Handle both direct response and wrapped response
      const data = (response.data as any)?.data || response.data;
      setTimetableData(data as TimetableData);
      
      // Fetch subjects for the class
      const subjectsResponse = await api.get<Subject[] | { data: Subject[] }>(
        `/classes/${data.class_id}/subjects`
      );
      let subjectsData: Subject[] = [];
      if (Array.isArray(subjectsResponse.data)) {
        subjectsData = subjectsResponse.data;
      } else if (subjectsResponse.data?.data && Array.isArray(subjectsResponse.data.data)) {
        subjectsData = subjectsResponse.data.data;
      }
      setSubjects(subjectsData);

      // Fetch teachers
      const teachersResponse = await api.get<any>("/admin/teachers");
      let teachersData: Teacher[] = [];
      if (Array.isArray(teachersResponse.data)) {
        teachersData = teachersResponse.data;
      } else if (teachersResponse.data?.data && Array.isArray(teachersResponse.data.data)) {
        teachersData = teachersResponse.data.data;
      }
      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Error fetching timetable data:", err);
      setError(err.response?.data?.message || "Failed to load timetable data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        class_id: values.class_id,
        subject_id: values.subject_id,
        day_of_week: values.day_of_week,
        start_time: values.start_time.format("HH:mm"),
        end_time: values.end_time.format("HH:mm"),
        teacher_id: values.teacher_id,
      };

      await api.put(`/students/timetable/update/${timetableId}`, payload);
      message.success("Timetable updated successfully!");
      setTimeout(() => {
        router.push("/admin/students/viewtimetable");
      }, 5000);
    } catch (err: any) {
      console.error("Error updating timetable:", err);
      let errorMessage = "Failed to update timetable. Please try again.";
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat() as string[];
        errorMessage = errorMessages.join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
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
          Update Weekly Timetable
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
            action={
              !timetableId ? (
                <Button size="small" onClick={() => router.push("/admin/students/viewtimetable")}>
                  Go to Timetable List
                </Button>
              ) : undefined
            }
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

        {loadingData ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        ) : !timetableId ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Button type="primary" size="large" onClick={() => router.push("/admin/students/viewtimetable")}>
              Go to Timetable List
            </Button>
          </div>
        ) : (
          <>
            {timetableData && (
              <Descriptions bordered column={1} style={{ marginBottom: 24, maxWidth: 600 }}>
                <Descriptions.Item label="Class">
                  {timetableData.class 
                    ? `${timetableData.class.name}${timetableData.class.arm || ''}` 
                    : `Class ID: ${timetableData.class_id}`}
                </Descriptions.Item>
                <Descriptions.Item label="Current Subject">
                  {timetableData.subject?.name || `Subject ID: ${timetableData.subject_id}`}
                </Descriptions.Item>
                <Descriptions.Item label="Current Teacher">
                  {timetableData.teacher?.name || `Teacher ID: ${timetableData.teacher_id}`}
                </Descriptions.Item>
              </Descriptions>
            )}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 600 }}
              initialValues={{
                class_id: timetableData?.class_id || "",
                subject_id: timetableData?.subject_id || "",
              }}
            >
            <Form.Item name="class_id" label="Class ID" hidden>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item name="subject_id" label="Subject ID" hidden>
              <Input type="hidden" />
            </Form.Item>

          <Form.Item
            name="day_of_week"
            label="Day of Week"
            rules={[{ required: true, message: "Please select a day" }]}
          >
            <Select
              placeholder="Select day"
              options={DAYS_OF_WEEK.map((day) => ({
                value: day,
                label: day,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="teacher_id"
            label="Teacher"
            rules={[{ required: true, message: "Please select a teacher" }]}
          >
            <Select
              placeholder="Select teacher"
              options={teachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                size="large"
              >
                Go Back
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Update Timetable
              </Button>
              {timetableId && timetableData && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(Number(timetableId))}
                  loading={deleting}
                  size="large"
                >
                  Delete
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
