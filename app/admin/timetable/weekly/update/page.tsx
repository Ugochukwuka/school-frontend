"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, App, Typography, TimePicker, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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

interface TimetableData {
  id: number;
  class_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
}

interface Subject {
  id: number;
  name: string;
}

export default function UpdateWeeklyTimetablePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const timetableId = searchParams.get("id");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);

  useEffect(() => {
    if (timetableId) {
      fetchTimetableData();
    } else {
      setError("Timetable ID is required");
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
      const response = await api.get<TimetableData>(`/students/timetable/edit/${timetableId}`);
      const data = response.data;
      setTimetableData(data);
      
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

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Update Weekly Timetable
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

        {loadingData ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
          >
          <Form.Item name="class_id" label="Class ID" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item
            name="subject_id"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select subject"
              options={subjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
            />
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
            label="Teacher ID"
            rules={[{ required: true, message: "Please enter teacher ID" }]}
          >
            <Select
              placeholder="Select teacher"
              options={[]}
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
            </Space>
          </Form.Item>
        </Form>
        )}
      </Card>
    </DashboardLayout>
  );
}
