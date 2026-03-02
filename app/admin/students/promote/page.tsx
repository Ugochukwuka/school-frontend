"use client";

import { useEffect, useState } from "react";
import { Card, Form, Select, Button, Alert, App, Table, Space, Checkbox, Spin, Typography } from "antd";
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

interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

interface StudentsResponse {
  current_page: number;
  data: Student[];
  total: number;
  per_page: number;
  last_page: number;
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

interface NextSessionClass {
  id: number;
  name: string;
  arm?: string;
}

interface NextSessionClassesResponse {
  status: string;
  current_session: string;
  next_session: string;
  next_session_id: number;
  classes: NextSessionClass[];
}

export default function PromoteStudentsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [nextSessionClasses, setNextSessionClasses] = useState<NextSessionClass[]>([]);
  const [nextSessionId, setNextSessionId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Array of student UUIDs
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingNextClasses, setLoadingNextClasses] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
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
    setStudents([]);
    setSelectedClassId(null);
    setSelectedStudents([]);
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

  const fetchStudents = async (classId: number) => {
    setLoadingStudents(true);
    setStudents([]);
    setSelectedStudents([]);
    setError("");
    try {
      const response = await api.get<StudentsResponse>(`/admin/viewstudents?class_id=${classId}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        setStudents(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchNextSessionClasses = async (sessionId: number) => {
    if (!sessionId) {
      console.error("Cannot fetch next session classes: sessionId is null or undefined");
      return;
    }
    
    setLoadingNextClasses(true);
    setError("");
    try {
      console.log("Fetching next session classes for session ID:", sessionId);
      const response = await api.get<NextSessionClassesResponse>(`/next/session/classes/${sessionId}`);
      console.log("Next session classes response:", response.data);
      
      if (response.data && response.data.status === "success") {
        if (response.data.classes && Array.isArray(response.data.classes)) {
          setNextSessionClasses(response.data.classes);
          console.log("Next session classes loaded:", response.data.classes.length, "classes");
        } else {
          console.warn("No classes array in response");
          setNextSessionClasses([]);
        }
        
        // Store the next_session_id from the response
        if (response.data.next_session_id) {
          setNextSessionId(response.data.next_session_id);
          console.log("Next session ID set to:", response.data.next_session_id);
        } else {
          console.warn("No next_session_id in response");
        }
      } else {
        console.warn("Unexpected response format:", response.data);
        setNextSessionClasses([]);
        setNextSessionId(null);
      }
    } catch (err: any) {
      console.error("Error fetching next session classes:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMsg = err.response?.data?.message || "Failed to load next session classes. Please try again.";
      setError(errorMsg);
      setNextSessionClasses([]);
      setNextSessionId(null);
    } finally {
      setLoadingNextClasses(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedClassId(null);
    setSelectedStudents([]);
    setStudents([]);
    setNextSessionClasses([]);
    setNextSessionId(null);
    form.setFieldsValue({ class_id: undefined, new_class_id: undefined, next_session_id: undefined });
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setSelectedStudents([]);
    setNextSessionClasses([]);
    setNextSessionId(null);
    form.setFieldsValue({ new_class_id: undefined, next_session_id: undefined });
    fetchStudents(classId);
    
    // Fetch next session classes immediately when class is selected
    // This way classes are ready when students are selected
    if (selectedSessionId) {
      console.log("Class selected, fetching next session classes for session:", selectedSessionId);
      fetchNextSessionClasses(selectedSessionId);
    }
  };

  const handleStudentSelection = (studentUuid: string, checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedStudents, studentUuid];
      setSelectedStudents(newSelected);
      
      // Fetch next session classes when first student is selected
      if (newSelected.length === 1 && selectedSessionId) {
        console.log("First student selected, fetching next session classes for session:", selectedSessionId);
        fetchNextSessionClasses(selectedSessionId);
      }
    } else {
      const remaining = selectedStudents.filter((uuid) => uuid !== studentUuid);
      setSelectedStudents(remaining);
      
      // Clear next session classes if no students selected
      if (remaining.length === 0) {
        setNextSessionClasses([]);
        setNextSessionId(null);
        form.setFieldsValue({ new_class_id: undefined, next_session_id: undefined });
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allStudentUuids = students.map((student) => student.uuid);
      setSelectedStudents(allStudentUuids);
      
      // Fetch next session classes when selecting all
      if (selectedSessionId && allStudentUuids.length > 0) {
        console.log("Selecting all students, fetching next session classes for session:", selectedSessionId);
        fetchNextSessionClasses(selectedSessionId);
      }
    } else {
      setSelectedStudents([]);
      setNextSessionClasses([]);
      setNextSessionId(null);
      form.setFieldsValue({ new_class_id: undefined, next_session_id: undefined });
    }
  };

  const handleSubmit = async (values: { new_class_id: number }) => {
    // Validate all required fields
    if (!selectedStudents || selectedStudents.length === 0) {
      setError("Please select at least one student to promote");
      message.warning("Please select at least one student to promote");
      return;
    }

    if (!selectedSessionId) {
      setError("Please select a session");
      message.warning("Please select a session");
      return;
    }

    if (!values.new_class_id) {
      setError("Please select a class for the next session");
      message.warning("Please select a class for the next session");
      return;
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setLoading(true);
    setError("");

    // Prepare request payload - using student_uuids, new_class_id, and next_session_id
    const newClassId = parseInt(String(values.new_class_id), 10);
    
    if (!nextSessionId) {
      setError("Next session ID not found. Please try selecting the class again.");
      message.error("Next session ID not found. Please try selecting the class again.");
      setSubmitting(false);
      setLoading(false);
      return;
    }
    
    const payload = {
      student_uuids: selectedStudents, // Array of student UUIDs (strings)
      new_class_id: newClassId, // Integer (class id from next session classes)
      session_id: nextSessionId, // Integer (next_session_id from the response)
    };

    console.log("Promoting students with payload:", JSON.stringify(payload, null, 2));
    console.log("Payload types:", {
      student_uuids: Array.isArray(payload.student_uuids),
      new_class_id: typeof payload.new_class_id,
      session_id: typeof payload.session_id,
    });
    console.log("Payload values:", {
      student_uuids: payload.student_uuids,
      new_class_id: payload.new_class_id,
      session_id: payload.session_id,
    });

    try {
      const response = await api.post("/admin/students/promote", payload);
      
      console.log("Promotion response status:", response.status);
      console.log("Promotion response data:", response.data);
      console.log("Full response:", response);

      // Verify response status is success (200-299)
      if (response.status >= 200 && response.status < 300) {
        // Check for success message
        if (response.data && response.data.message) {
          message.success(response.data.message);
        } else {
          message.success("Students promoted successfully!");
        }
        
        // Clear form and selections after a brief delay
        setTimeout(() => {
          form.resetFields();
          setSelectedStudents([]);
          setSelectedClassId(null);
          setNextSessionClasses([]);
          setNextSessionId(null);
          setSubmitting(false);
          setLoading(false);
          
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 3000);
        }, 500);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error promoting students:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Handle validation errors from backend
      let errorMessage = "Failed to promote students. Please try again.";
      
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
      setSubmitting(false);
      setLoading(false);
    }
  };

  const studentColumns = [
    {
      title: (
        <Checkbox
          checked={selectedStudents.length === students.length && students.length > 0}
          indeterminate={
            selectedStudents.length > 0 && selectedStudents.length < students.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: "checkbox",
      width: 50,
      render: (_: any, record: Student) => (
        <Checkbox
          checked={selectedStudents.includes(record.uuid)}
          onChange={(e) => handleStudentSelection(record.uuid, e.target.checked)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Promote Students
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
          onFinish={handleSubmit}
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            label="Select Session"
            required
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Select
                placeholder="Select a session"
                loading={loadingSessions}
                value={selectedSessionId}
                onChange={handleSessionChange}
                style={{ width: "100%", maxWidth: 400 }}
                options={sessions.map((session) => ({
                  value: session.id,
                  label: `${session.name}${session.current ? " (Current)" : ""}`,
                }))}
              />
              {selectedSessionId && (
                <input type="hidden" value={selectedSessionId} />
              )}
            </div>
          </Form.Item>

          {selectedSessionId && (
            <Form.Item
              label="Select Class"
              required
            >
              <Select
                placeholder="Select a class"
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

          {selectedStudents.length > 0 && (
            <>
              {/* Hidden field to store next_session_id */}
              {nextSessionId && (
                <Form.Item name="next_session_id" hidden initialValue={nextSessionId}>
                  <input type="hidden" value={nextSessionId} />
                </Form.Item>
              )}
              
              <Form.Item
                name="new_class_id"
                label="Select Class for Next Session"
                rules={[{ required: true, message: "Please select a class for the next session" }]}
                help={
                  loadingNextClasses 
                    ? "Loading classes..." 
                    : nextSessionClasses.length === 0 
                    ? "No classes available for next session" 
                    : `${nextSessionClasses.length} class(es) available`
                }
              >
                <Select
                  placeholder={
                    loadingNextClasses 
                      ? "Loading classes..." 
                      : nextSessionClasses.length === 0 
                      ? "No classes available" 
                      : "Select class for next session"
                  }
                  loading={loadingNextClasses}
                  style={{ width: "100%", maxWidth: 400 }}
                  disabled={loadingNextClasses || nextSessionClasses.length === 0}
                  notFoundContent={loadingNextClasses ? "Loading..." : "No classes found"}
                  options={nextSessionClasses.map((cls) => ({
                    value: cls.id,
                    label: cls.arm ? `${cls.name} ${cls.arm}` : cls.name,
                  }))}
                />
              </Form.Item>
            </>
          )}

          {selectedStudents.length > 0 && (
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || submitting}
                disabled={submitting}
                size="large"
              >
                Promote {selectedStudents.length} Student{selectedStudents.length !== 1 ? "s" : ""}
              </Button>
            </Form.Item>
          )}
        </Form>

        {loadingStudents ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Spin size="large" />
          </div>
        ) : selectedClassId && students.length > 0 ? (
          <div>
            <Title level={4} style={{ marginBottom: "16px" }}>
              Students in Selected Class ({students.length} total)
            </Title>
            <Table
              dataSource={students}
              columns={studentColumns}
              rowKey="uuid"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} students`,
              }}
            />
          </div>
        ) : selectedClassId && students.length === 0 ? (
          <Alert
            title="No students found in this class"
            type="info"
            style={{ marginTop: 24 }}
          />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
