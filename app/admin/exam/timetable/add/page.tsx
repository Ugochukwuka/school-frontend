"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Form, Select, Button, Alert, App, Typography, TimePicker, Space, Input, DatePicker } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import dayjs from "dayjs";

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

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
}

interface SubjectsResponse {
  status?: string;
  class_id?: string;
  subjects?: Subject[];
  data?: Subject[];
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

interface ExamTimetableEntry {
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  room_number: string;
}

const EXAM_TYPES = ["Midterm", "Final Exam", "Quiz", "Test", "Assignment"];

export default function AddExamTimetablePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");
    try {
      const response = await api.get<Session[] | { data: Session[] }>("/viewsessions");
      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      }
      sessionsData.sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        return b.name.localeCompare(a.name);
      });
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
    setSubjects([]);
    setError("");
    try {
      const response = await api.get<ClassesResponse>(`/sessions/${sessionId}/classes`);
      if (response.data.status === "success" && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else {
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSubjects = useCallback(async () => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    setLoadingSubjects(true);
    setError("");
    try {
      const response = await api.get<SubjectsResponse | Subject[]>(`/classes/${selectedClassId}/subjects`);
      let subjectsData: Subject[] = [];
      
      // Handle the API response format: { status, class_id, subjects: [...] }
      if (response.data && typeof response.data === 'object' && 'subjects' in response.data && Array.isArray((response.data as any).subjects)) {
        subjectsData = (response.data as any).subjects;
      } else if (Array.isArray(response.data)) {
        // Fallback: Direct array response
        subjectsData = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
        // Fallback: Response with { data: [...] }
        subjectsData = (response.data as any).data;
      } else {
        console.warn("Unexpected subjects response format:", response.data);
        setError("No subjects found for this class. Please ensure subjects are assigned to this class.");
        setSubjects([]);
        return;
      }
      
      console.log("Fetched subjects:", subjectsData);
      if (subjectsData.length === 0) {
        setError("No subjects found for this class. Please assign subjects to this class first.");
      }
      setSubjects(subjectsData);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.message || "Failed to load subjects. Please try again.";
      setError(errorMessage);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [selectedClassId]);

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedClassId(null);
    setClasses([]);
    setSubjects([]);
    form.setFieldsValue({ class_id: undefined, entries: [] });
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setSubjects([]);
    form.setFieldsValue({ entries: [] });
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClassId, fetchSubjects]);

  const handleSubmit = async (values: { entries: ExamTimetableEntry[] }) => {
    if (!values.entries || values.entries.length === 0) {
      setError("Please add at least one exam timetable entry");
      message.warning("Please add at least one exam timetable entry");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/exam/timetable", values.entries);
      
      // Check if the response indicates some entries were skipped
      const responseData = response.data?.data || response.data;
      if (responseData && responseData.status === false) {
        const errorMessage = responseData.message || "Some exam timetable entries already exist and were skipped.";
        const added = responseData.added || 0;
        const skipped = responseData.skipped || 0;
        const detailedMessage = `${errorMessage} (Added: ${added}, Skipped: ${skipped})`;
        
        setError(detailedMessage);
        message.error(detailedMessage);
        setLoading(false);
        
        // Redirect to Admin Dashboard after 5 seconds
        setTimeout(() => {
          try {
            router.replace("/admin/dashboard");
          } catch (redirectErr) {
            // Fallback to window.location if router fails
            window.location.href = "/admin/dashboard";
          }
        }, 5000);
        return;
      }
      
      message.success("Exam timetable added successfully!");
      form.resetFields();
      setSelectedSessionId(null);
      setSelectedClassId(null);
      setClasses([]);
      setSubjects([]);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 5000);
    } catch (err: any) {
      console.error("Error adding exam timetable:", err);
      
      // Check if the error response indicates some entries were skipped (409 Conflict or status: false)
      const errorData = err.response?.data?.data || err.response?.data;
      const isConflictError = err.response?.status === 409;
      const hasSkippedEntries = errorData && (errorData.status === false || errorData.skipped !== undefined);
      
      if ((isConflictError || hasSkippedEntries) && errorData?.message) {
        const errorMessage = errorData.message || "Some exam timetable entries already exist and were skipped.";
        const added = errorData.added || 0;
        const skipped = errorData.skipped || 0;
        const detailedMessage = `${errorMessage} (Added: ${added}, Skipped: ${skipped})`;
        
        setError(detailedMessage);
        message.error(detailedMessage);
        setLoading(false);
        
        // Redirect to Admin Dashboard after 5 seconds
        setTimeout(() => {
          try {
            router.replace("/admin/dashboard");
          } catch (redirectErr) {
            // Fallback to window.location if router fails
            window.location.href = "/admin/dashboard";
          }
        }, 5000);
        return;
      }
      
      let errorMessage = "Failed to add exam timetable. Please try again.";
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
        <Title 
          level={isMobile ? 3 : 1} 
          style={{ 
            marginBottom: isMobile ? "16px" : "24px",
            fontSize: isMobile ? "20px" : undefined,
          }}
        >
          Add Exam Timetable
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: isMobile ? "100%" : 1000 }}
          size={isMobile ? "large" : "middle"}
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
              style={{ width: "100%", maxWidth: isMobile ? "100%" : 400 }}
              size={isMobile ? "large" : "middle"}
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
                style={{ width: "100%", maxWidth: isMobile ? "100%" : 400 }}
                size={isMobile ? "large" : "middle"}
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
              />
            </Form.Item>
          )}

          {selectedClassId && (
            <Form.List name="entries">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      style={{ marginBottom: isMobile ? 12 : 16, border: "1px solid #d9d9d9" }}
                      title={`Exam Timetable Entry ${key + 1}`}
                      size={isMobile ? "small" : "default"}
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            size={isMobile ? "small" : "middle"}
                          />
                        )
                      }
                    >
                      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                        <Form.Item
                          {...restField}
                          name={[name, "class_id"]}
                          label="Class"
                          initialValue={selectedClassId}
                          hidden
                        >
                          <input type="hidden" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "subject_id"]}
                          label="Subject"
                          rules={[{ required: true, message: "Please select a subject" }]}
                        >
                          <Select
                            placeholder="Select subject"
                            loading={loadingSubjects}
                            size={isMobile ? "large" : "middle"}
                            notFoundContent={
                              loadingSubjects 
                                ? "Loading subjects..." 
                                : subjects.length === 0 
                                  ? "No subjects available. Please assign subjects to this class first."
                                  : "No subjects found"
                            }
                            options={subjects.map((subject) => ({
                              value: subject.subject_id,
                              label: subject.subject_name,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "exam_date"]}
                          label="Exam Date"
                          rules={[{ required: true, message: "Please select exam date" }]}
                          getValueProps={(value) => ({
                            value: value ? dayjs(value) : null,
                          })}
                          normalize={(value) => (value ? value.format("YYYY-MM-DD") : null)}
                        >
                          <DatePicker 
                            style={{ width: "100%" }} 
                            size={isMobile ? "large" : "middle"}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "start_time"]}
                          label="Start Time"
                          rules={[{ required: true, message: "Please select start time" }]}
                          getValueProps={(value) => ({
                            value: value ? dayjs(value, "HH:mm") : null,
                          })}
                          normalize={(value) => (value ? value.format("HH:mm") : null)}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            style={{ width: "100%" }} 
                            size={isMobile ? "large" : "middle"}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "end_time"]}
                          label="End Time"
                          rules={[{ required: true, message: "Please select end time" }]}
                          getValueProps={(value) => ({
                            value: value ? dayjs(value, "HH:mm") : null,
                          })}
                          normalize={(value) => (value ? value.format("HH:mm") : null)}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            style={{ width: "100%" }} 
                            size={isMobile ? "large" : "middle"}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "exam_type"]}
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
                          {...restField}
                          name={[name, "room_number"]}
                          label="Room Number"
                          rules={[{ required: true, message: "Please enter room number" }]}
                        >
                          <Input 
                            placeholder="Enter room number" 
                            size={isMobile ? "large" : "middle"}
                          />
                        </Form.Item>
                      </Space>
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size={isMobile ? "large" : "middle"}
                    >
                      Add Exam Timetable Entry
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}

          {selectedClassId && (
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                size={isMobile ? "large" : "large"}
                block={isMobile}
              >
                Submit Exam Timetable
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </DashboardLayout>
  );
}
