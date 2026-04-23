"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, App, Typography } from "antd";
import { useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/app/lib/api";
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

interface Subject {
  id?: number;
  name?: string;
  subject_id?: number;
  subject_name?: string;
  code?: string;
  subject_code?: string;
}

export default function AssignSubjectPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [debouncedTeacherSearch, setDebouncedTeacherSearch] = useState("");
  const [debouncedSubjectSearch, setDebouncedSubjectSearch] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchSessions();
  }, [debouncedTeacherSearch, debouncedSubjectSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTeacherSearch(teacherSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [teacherSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSubjectSearch(subjectSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [subjectSearch]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    setError("");
    try {
      const teacherQuery = debouncedTeacherSearch
        ? `?search=${encodeURIComponent(debouncedTeacherSearch)}`
        : "";
      const response = await api.get<any>(`/admin/teachers${teacherQuery}`);
      console.log("Teachers response:", response.data);
      
      let teachersData: Teacher[] = [];
      if (Array.isArray(response.data)) {
        teachersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        teachersData = response.data.data;
      } else {
        console.warn("Unexpected teachers response format:", response.data);
      }
      
      console.log("Teachers data:", teachersData);
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

  const fetchSubjectsByClassAndTeacher = async (classId: number, teacherUuid?: string | null) => {
    setLoadingSubjects(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (debouncedSubjectSearch) {
        params.search = debouncedSubjectSearch;
      }
      if (teacherUuid) {
        params.teacher_uuid = teacherUuid;
      }
      const response = await api.get<any>(`/admin/classes/${classId}/subjectsbyteacher`, { params });
      
      let subjectsData: Subject[] = [];
      if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data;
      } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
        subjectsData = response.data.subjects;
      }
      setSubjects(subjectsData);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to load subjects. Please try again."));
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleTeacherChange = (teacherUuid: string) => {
    setSelectedTeacherUuid(teacherUuid);
    form.setFieldsValue({ subject_id: undefined });
    const selectedClass = form.getFieldValue("class_id");
    if (selectedClass) {
      fetchSubjectsByClassAndTeacher(selectedClass, teacherUuid);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setClasses([]);
    form.setFieldsValue({ class_id: undefined, subject_id: undefined });
    // Fetch classes for the selected session
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    form.setFieldsValue({ class_id: classId, subject_id: undefined });
    fetchSubjectsByClassAndTeacher(classId, selectedTeacherUuid);
  };

  const handleSubmit = async (values: {
    class_id: number;
    subject_id: number;
    session_id: number;
  }) => {
    if (!selectedTeacherUuid) {
      setError("Please select a teacher first");
      message.warning("Please select a teacher first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        `/admin/teachers/${selectedTeacherUuid}/assign-subject`,
        {
          class_id: values.class_id,
          subject_id: values.subject_id,
          session_id: values.session_id,
        }
      );

      if (response.data && response.data.message) {
        message.success(response.data.message);
      } else {
        message.success("Subject assigned successfully!");
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
      console.error("Error assigning subject:", err);
      console.error("Error response:", err.response?.data);

      // Handle validation errors
      let errorMessage = getApiErrorMessage(err, "Failed to assign subject. Please try again.");
      if (err?.response?.status === 403) {
        errorMessage = getApiErrorMessage(err, "You are not allowed to assign subjects.");
      } else if (err?.response?.status === 409) {
        errorMessage = getApiErrorMessage(err, "This subject is already assigned for the selected class/session.");
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
          Assign Subject to Teacher
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
                onChange={handleClassChange}
                style={{ width: "100%", maxWidth: 400 }}
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
              />
            </Form.Item>
          )}

          {selectedSessionId && (
            <Form.Item
              name="subject_id"
              label="Select Subject"
              rules={[{ required: true, message: "Please select a subject" }]}
            >
              <Select
                placeholder="Select subject"
                loading={loadingSubjects}
                onSearch={setSubjectSearch}
                showSearch
                filterOption={false}
                disabled={!form.getFieldValue("class_id")}
                style={{ width: "100%", maxWidth: 400 }}
                options={subjects.map((subject) => ({
                  value: subject.id ?? subject.subject_id,
                  label: `${subject.name ?? subject.subject_name ?? "Subject"}${subject.code || subject.subject_code ? ` (${subject.code ?? subject.subject_code})` : ""}`,
                }))}
              />
            </Form.Item>
          )}

          {selectedTeacherUuid && selectedSessionId && classes.length > 0 && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Assign Subject
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </DashboardLayout>
  );
}
