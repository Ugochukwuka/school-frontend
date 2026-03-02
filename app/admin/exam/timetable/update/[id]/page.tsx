"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, Typography, TimePicker, Space, Input, DatePicker, App } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import dayjs from "dayjs";

const { Title } = Typography;

const EXAM_TYPES = ["Midterm", "Final Exam", "Quiz", "Test", "Assignment"];

interface ExamTimetableData {
  id: number;
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  room_number: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function UpdateExamTimetablePage() {
  const router = useRouter();
  const params = useParams();
  const { modal, message } = App.useApp();
  const { isMobile } = useResponsive();
  const timetableId = params?.id as string;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [examTimetableData, setExamTimetableData] = useState<ExamTimetableData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (timetableId) {
      fetchTimetableData();
    } else {
      setError("Timetable ID is required");
      setLoadingData(false);
    }
  }, [timetableId]);

  useEffect(() => {
    if (examTimetableData && !loadingData) {
      form.setFieldsValue({
        class_id: examTimetableData.class_id,
        subject_id: examTimetableData.subject_id,
        exam_date: dayjs(examTimetableData.exam_date),
        start_time: dayjs(examTimetableData.start_time, "HH:mm"),
        end_time: dayjs(examTimetableData.end_time, "HH:mm"),
        exam_type: examTimetableData.exam_type,
        room_number: examTimetableData.room_number,
      });
    }
  }, [examTimetableData, loadingData, form]);

  const fetchTimetableData = async () => {
    if (!timetableId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<ExamTimetableData>(`/exam/timetable/edit/${timetableId}`);
      const data = response.data;
      setExamTimetableData(data);
      
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
      console.error("Error fetching exam timetable data:", err);
      setError(err.response?.data?.message || "Failed to load exam timetable data. Please try again.");
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
        exam_date: values.exam_date.format("YYYY-MM-DD"),
        start_time: values.start_time.format("HH:mm"),
        end_time: values.end_time.format("HH:mm"),
        exam_type: values.exam_type,
        room_number: values.room_number,
      };

      await api.put(`/exam/timetable/update/${timetableId}`, payload);
      message.success("Exam timetable updated successfully!");
      setTimeout(() => {
        router.push("/admin/viewexam/timetable");
      }, 5000);
    } catch (err: any) {
      console.error("Error updating exam timetable:", err);
      let errorMessage = "Failed to update exam timetable. Please try again.";
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
          Update Exam Timetable
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

        {loadingData ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: isMobile ? "100%" : 600 }}
            size={isMobile ? "large" : "middle"}
            initialValues={{
              class_id: examTimetableData?.class_id || "",
            }}
          >
          <Form.Item name="class_id" label="Class ID" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="subject_id"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select subject"
              size={isMobile ? "large" : "middle"}
              options={subjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="exam_date"
            label="Exam Date"
            rules={[{ required: true, message: "Please select exam date" }]}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              size={isMobile ? "large" : "middle"}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <TimePicker 
              format="HH:mm" 
              style={{ width: "100%" }} 
              size={isMobile ? "large" : "middle"}
            />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <TimePicker 
              format="HH:mm" 
              style={{ width: "100%" }} 
              size={isMobile ? "large" : "middle"}
            />
          </Form.Item>

          <Form.Item
            name="exam_type"
            label="Exam Type"
            rules={[{ required: true, message: "Please select exam type" }]}
          >
            <Select
              placeholder="Select exam type"
              size={isMobile ? "large" : "middle"}
              options={EXAM_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="room_number"
            label="Room Number"
            rules={[{ required: true, message: "Please enter room number" }]}
          >
            <Input 
              placeholder="Enter room number" 
              size={isMobile ? "large" : "middle"}
            />
          </Form.Item>

          <Form.Item>
            <Space 
              orientation={isMobile ? "vertical" : "horizontal"}
              style={{ width: isMobile ? "100%" : "auto" }}
              size={isMobile ? "small" : "middle"}
            >
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                size={isMobile ? "large" : "large"}
                block={isMobile}
              >
                Update Exam Timetable
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                size={isMobile ? "large" : "large"}
                block={isMobile}
              >
                Go Back
              </Button>
              {timetableId && examTimetableData && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(Number(timetableId))}
                  loading={deleting}
                  size={isMobile ? "large" : "large"}
                  block={isMobile}
                >
                  Delete
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
        )}
      </Card>
    </DashboardLayout>
  );
}
