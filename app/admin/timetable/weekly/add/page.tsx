"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Form, Select, Button, Alert, App, Typography, TimePicker, Space, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
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
  class_teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

interface SubjectsResponse {
  status?: string;
  class_id?: string;
  subjects?: Subject[];
  data?: Subject[];
}

interface TimetableEntry {
  class_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddWeeklyTimetablePage() {
  const router = useRouter();
  const { message } = App.useApp();
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
        console.warn("Response type:", typeof response.data);
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

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClassId, fetchSubjects]);

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
    fetchSubjects();
  };

  const handleSubmit = async (values: { entries: TimetableEntry[] }) => {
    if (!values.entries || values.entries.length === 0) {
      setError("Please add at least one timetable entry");
      message.warning("Please add at least one timetable entry");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const latestSubjectsResponse = await api.get<SubjectsResponse | Subject[]>(`/classes/${selectedClassId}/subjects`);
      const latestSubjects =
        Array.isArray(latestSubjectsResponse.data)
          ? latestSubjectsResponse.data
          : Array.isArray((latestSubjectsResponse.data as SubjectsResponse)?.subjects)
          ? (latestSubjectsResponse.data as SubjectsResponse).subjects || []
          : [];
      const invalidEntry = values.entries.find((entry) => {
        const subject = latestSubjects.find((s) => s.subject_id === Number(entry.subject_id));
        return !subject?.teacher_id || Number(entry.teacher_id) !== Number(subject.teacher_id);
      });
      if (invalidEntry) {
        setLoading(false);
        setError("Selected teacher is not the assigned teacher for one or more subject/class mappings. Refresh and try again.");
        message.error("Invalid teacher selection for selected subject.");
        return;
      }

      const response = await api.post("/students/timetable", values.entries);
      
      // Check if the response indicates some entries were skipped
      const responseData = response.data?.data || response.data;
      if (responseData && responseData.status === false) {
        const errorMessage = responseData.message || "Some timetable entries already exist and were skipped.";
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
          } catch (err) {
            // Fallback to window.location if router fails
            window.location.href = "/admin/dashboard";
          }
        }, 5000);
        return;
      }
      
      message.success("Weekly timetable added successfully!");
      form.resetFields();
      setSelectedSessionId(null);
      setSelectedClassId(null);
      setClasses([]);
      setSubjects([]);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 5000);
    } catch (err: any) {
      console.error("Error adding timetable:", err);
      
      // Check if the error response indicates some entries were skipped (409 Conflict or status: false)
      const errorData = err.response?.data?.data || err.response?.data;
      const isConflictError = err.response?.status === 409;
      const hasSkippedEntries = errorData && (errorData.status === false || errorData.skipped !== undefined);
      
      if ((isConflictError || hasSkippedEntries) && errorData?.message) {
        const errorMessage = errorData.message || "Some timetable entries already exist and were skipped.";
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
      
      let errorMessage = "Failed to add timetable. Please try again.";
      if (err.response?.status === 422 && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
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

  const selectedClass = classes.find((c) => c.class_id === selectedClassId);

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Add Weekly Timetable
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
          style={{ maxWidth: 1000 }}
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

          {selectedClassId && (
            <Form.List name="entries">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      style={{ marginBottom: 16, border: "1px solid #d9d9d9" }}
                      title={`Timetable Entry ${key + 1}`}
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
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
                          <InputNumber />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "subject_id"]}
                          label="Subject"
                          rules={[{ required: true, message: "Please select a subject" }]}
                        >
                          <Select
                            placeholder="Select subject"
                            onChange={(value) => {
                              const selectedSubject = subjects.find((subject) => subject.subject_id === value);
                              form.setFieldValue(["entries", name, "teacher_id"], selectedSubject?.teacher_id || undefined);
                            }}
                            loading={loadingSubjects}
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
                          name={[name, "day_of_week"]}
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
                          {...restField}
                          name={[name, "start_time"]}
                          label="Start Time"
                          rules={[{ required: true, message: "Please select start time" }]}
                          getValueProps={(value) => ({
                            value: value ? dayjs(value, "HH:mm") : null,
                          })}
                          normalize={(value) => (value ? value.format("HH:mm") : null)}
                        >
                          <TimePicker format="HH:mm" style={{ width: "100%" }} />
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
                          <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>

                        {selectedClass?.class_teacher && (
                          <Form.Item
                            {...restField}
                            name={[name, "teacher_id"]}
                            label="Teacher"
                            rules={[{ required: true, message: "Please select a teacher" }]}
                          >
                            <Select
                              placeholder="Select teacher"
                              disabled
                              options={[
                                (() => {
                                  const selectedSubjectId = form.getFieldValue(["entries", name, "subject_id"]);
                                  const selectedSubject = subjects.find((subject) => subject.subject_id === selectedSubjectId);
                                  if (selectedSubject?.teacher_id) {
                                    return {
                                      value: selectedSubject.teacher_id,
                                      label: selectedSubject.teacher_name || `Teacher ${selectedSubject.teacher_id}`,
                                    };
                                  }
                                  return {
                                    value: selectedClass.class_teacher?.id,
                                    label: selectedClass.class_teacher?.name || "Class Teacher",
                                  };
                                })(),
                              ]}
                            />
                          </Form.Item>
                        )}
                      </Space>
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Timetable Entry
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}

          {selectedClassId && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Submit Timetable
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </DashboardLayout>
  );
}
