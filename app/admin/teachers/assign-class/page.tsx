"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, App, Typography } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Teacher {
  uuid: string;
  name: string;
  email: string;
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Class {
  class_id: number;
  class_name: string;
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

export default function AssignClassPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [debouncedTeacherSearch, setDebouncedTeacherSearch] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, [debouncedTeacherSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTeacherSearch(teacherSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [teacherSearch]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    setError("");
    try {
      const query = debouncedTeacherSearch
        ? `?search=${encodeURIComponent(debouncedTeacherSearch)}`
        : "";
      const response = await api.get<any>(`/admin/teachers/all${query}`);
      let teachersData: Teacher[] = [];
      if (Array.isArray(response.data)) {
        teachersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        teachersData = response.data.data;
      } else {
        console.warn("Unexpected teachers response format:", response.data);
      }
      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || "Failed to load teachers. Please try again.");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");
    try {
      const response = await api.get<Session[]>("/viewsessions");
      const sessionsData = Array.isArray(response.data) ? response.data : [];
      setSessions(sessionsData);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.response?.data?.message || "Failed to load sessions. Please try again.");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setClasses([]);
    setError("");
    try {
      const response = await api.get<ClassesResponse>(`/sessions/${sessionId}/classes`);
      if (response.data.status === "success" && response.data.classes) {
        setClasses(response.data.classes);
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleTeacherChange = (teacherUuid: string) => {
    setSelectedTeacherUuid(teacherUuid);
    setSelectedSessionId(null);
    setClasses([]);
    form.setFieldsValue({ session_id: undefined, class_id: undefined });
    // Fetch sessions when teacher is selected
    fetchSessions();
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setClasses([]);
    form.setFieldsValue({ class_id: undefined });
    // Fetch classes for the selected session
    fetchClasses(sessionId);
  };

  const handleSubmit = async (values: { class_id: number }) => {
    if (!selectedTeacherUuid) {
      setError("Please select a teacher first");
      message.warning("Please select a teacher first");
      return;
    }

    if (!values.class_id) {
      setError("Please select a class");
      message.warning("Please select a class");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.put(
        `/admin/teachers/${values.class_id}/assign-class`,
        {
          teacher_uuid: selectedTeacherUuid,
        }
      );

      console.log("Assign class response:", response.data);

      if (response.data && response.data.message) {
        message.success(response.data.message);
      } else {
        message.success("Form teacher assigned successfully!");
      }

      form.resetFields();
      setSelectedTeacherUuid(null);
      setSelectedSessionId(null);
      setClasses([]);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error("Error assigning class:", err);
      console.error("Error response:", err.response?.data);

      // Handle validation errors
      let errorMessage = "Failed to assign class. Please try again.";

      if (err.response?.data) {
        // Laravel validation errors
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
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
          Assign Class to Teacher
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Select Teacher"
            required
          >
            <Select
              placeholder="Select a teacher"
              loading={loadingTeachers}
              value={selectedTeacherUuid}
              onChange={handleTeacherChange}
              onSearch={setTeacherSearch}
              showSearch
              filterOption={false}
              style={{ width: "100%", maxWidth: 400 }}
              options={teachers.map((teacher) => ({
                value: teacher.uuid,
                label: `${teacher.name} (${teacher.email})`,
              }))}
            />
          </Form.Item>

          {selectedTeacherUuid && (
            <Form.Item
              name="session_id"
              label="Select Academic Session"
              rules={[{ required: true, message: "Please select a session" }]}
            >
              <Select
                placeholder="Select academic session"
                loading={loadingSessions}
                value={selectedSessionId}
                onChange={handleSessionChange}
                style={{ width: "100%", maxWidth: 400 }}
                options={sessions.map((session) => ({
                  value: session.id,
                  label: `${session.name}${session.current ? " (Current)" : ""}`,
                }))}
              />
            </Form.Item>
          )}

          {selectedSessionId && (
            <Form.Item
              name="class_id"
              label="Select Class"
              rules={[{ required: true, message: "Please select a class" }]}
            >
              <Select
                placeholder="Select class"
                loading={loadingClasses}
                style={{ width: "100%", maxWidth: 400 }}
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
              />
            </Form.Item>
          )}

          {selectedTeacherUuid && selectedSessionId && classes.length > 0 && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Assign Class
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </DashboardLayout>
  );
}
