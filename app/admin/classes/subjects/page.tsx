"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, Typography, Checkbox, Spin, App } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

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
  id: number;
  name: string;
  code?: string;
}

export default function ClassSubjectsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchSubjects();
  }, []);

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
    setSelectedClassId(null);
    setSelectedSubjects([]);
    setError("");
    try {
      const response = await api.get<ClassesResponse>(`/sessions/${sessionId}/classes`);
      if (response.data.status === "success" && response.data.classes) {
        setClasses(response.data.classes);
      } else {
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      if (err.response?.status === 404) {
        setError("Classes endpoint not found. Please check if the session has classes configured.");
      } else {
        setError(err.response?.data?.message || "Failed to load classes. Please try again.");
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError("");
    try {
      const response = await api.get<any>("/admin/subjects");
      console.log("Subjects response:", response.data);
      
      let subjectsData: Subject[] = [];
      if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data;
      } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
        subjectsData = response.data.subjects;
      } else {
        console.warn("Unexpected subjects response format:", response.data);
      }
      
      console.log("Subjects data:", subjectsData);
      setSubjects(subjectsData);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedClassId(null);
    setSelectedSubjects([]);
    form.setFieldsValue({ class_id: undefined });
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setSelectedSubjects([]);
  };

  const handleSubjectSelection = (subjectId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(subjects.map((subject) => subject.id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClassId) {
      setError("Please select a class");
      message.warning("Please select a class");
      return;
    }

    if (!selectedSubjects || selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      message.warning("Please select at least one subject");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        `/admin/classes/${selectedClassId}/subjects`,
        {
          subject_ids: selectedSubjects,
        }
      );

      console.log("Add subjects response:", response.data);

      if (response.data && response.data.message) {
        message.success(response.data.message);
      } else {
        message.success("Subject(s) added to class successfully!");
      }

      form.resetFields();
      setSelectedSessionId(null);
      setSelectedClassId(null);
      setSelectedSubjects([]);
      setClasses([]);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error("Error adding subjects to class:", err);
      console.error("Error response:", err.response?.data);

      // Handle validation errors
      let errorMessage = "Failed to add subjects to class. Please try again.";

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
          Add Subjects to Class
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

        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600, marginBottom: 24 }}
        >
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

          {selectedSessionId && (
            <Form.Item
              name="class_id"
              label="Select Class"
              rules={[{ required: true, message: "Please select a class" }]}
            >
              <Select
                placeholder="Select class"
                loading={loadingClasses}
                value={selectedClassId}
                onChange={handleClassChange}
                style={{ width: "100%", maxWidth: 400 }}
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
              />
            </Form.Item>
          )}
        </Form>

        {selectedClassId && (
          <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Title level={4} style={{ margin: 0 }}>
                Select Subjects ({selectedSubjects.length} selected)
              </Title>
              <Checkbox
                checked={selectedSubjects.length === subjects.length && subjects.length > 0}
                indeterminate={selectedSubjects.length > 0 && selectedSubjects.length < subjects.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select All
              </Checkbox>
            </div>

            {loadingSubjects ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                <Spin size="large" />
              </div>
            ) : subjects.length > 0 ? (
              <div style={{ 
                border: "1px solid #d9d9d9", 
                borderRadius: "4px", 
                padding: "16px",
                maxHeight: "400px",
                overflowY: "auto",
                marginBottom: 24
              }}>
                {subjects.map((subject) => (
                  <div key={subject.id} style={{ marginBottom: 12 }}>
                    <Checkbox
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={(e) => handleSubjectSelection(subject.id, e.target.checked)}
                    >
                      {subject.name}
                      {subject.code && <span style={{ color: "#666", marginLeft: 8 }}>({subject.code})</span>}
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <Alert
                title="No subjects available"
                type="info"
                style={{ marginBottom: 24 }}
              />
            )}

            {selectedSubjects.length > 0 && (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                size="large"
                block
              >
                Add {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? "s" : ""} to Class
              </Button>
            )}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
