"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Select, InputNumber, Alert, Spin, App } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useRouter } from "next/navigation";

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
  id: number;
  name: string;
}

interface ClassLevel {
  id: number;
  name: string;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface TermsResponse {
  status: string;
  session_id: string;
  terms: Term[];
  message?: string;
}

interface ClassLevelsResponse {
  status: string;
  class_levels: ClassLevel[];
}

interface FeeCreateResponse {
  message: string;
}

export default function AddFeePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
        form.setFieldsValue({ session_id: currentSession.id });
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
      form.setFieldsValue({ term_id: undefined });
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
      form.setFieldsValue({ term_id: firstTerm.id });
    }
  }, [terms, termId]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await axios.get<SessionsResponse | Session[]>(
        "http://127.0.0.1:8000/api/viewsessions",
        getAuthHeaders()
      );

      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      } else if (response.data?.status === "error") {
        throw new Error(response.data.message || "Failed to fetch sessions");
      }

      sessionsData.sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        return b.name.localeCompare(a.name);
      });

      setSessions(sessionsData);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      let errorMessage = "Failed to load sessions. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTerms = async (sessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setTermId(null);
    form.setFieldsValue({ term_id: undefined });

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      let errorMessage = "Failed to load terms. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No terms found for this session.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTerms([]);
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchClassLevels = async () => {
    setLoadingClassLevels(true);
    setError("");

    try {
      const response = await axios.get<ClassLevelsResponse>(
        "http://127.0.0.1:8000/api/class-levels",
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.class_levels)) {
        setClassLevels(response.data.class_levels);
      } else if (response.data.class_levels && Array.isArray(response.data.class_levels)) {
        // Handle case where status might not be "success" but data exists
        setClassLevels(response.data.class_levels);
      } else {
        setClassLevels([]);
        setError("No class levels found.");
      }
    } catch (err: any) {
      console.error("Error fetching class levels:", err);
      let errorMessage = "Failed to load class levels. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setClassLevels([]);
    } finally {
      setLoadingClassLevels(false);
    }
  };

  const onFinish = async (values: {
    class_id: number;
    session_id: number;
    fee_type: string;
    amount_due: number;
    term_id: number;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<FeeCreateResponse>(
        "http://127.0.0.1:8000/api/admin/fees",
        {
          class_id: values.class_id.toString(),
          session_id: values.session_id.toString(),
          fee_type: values.fee_type,
          amount_due: values.amount_due.toString(),
          term_id: values.term_id.toString(),
        },
        getAuthHeaders()
      );

      if (response.data.message === "Fee created") {
        message.success("Fee created successfully!");
        form.resetFields();
        setSessionId(null);
        setTermId(null);
        setClassId(null);
        // Wait 5 seconds then redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 5000);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Error creating fee:", err);
      const errorMessage = err.response?.data?.message || "Failed to create fee. Please try again.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSessions || loadingClassLevels) {
    return (
      <DashboardLayout role="admin">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Add Fee</h1>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Session"
            name="session_id"
            rules={[{ required: true, message: "Please select a session" }]}
          >
            <Select
              placeholder="Select Session"
              loading={loadingSessions}
              value={sessionId}
              onChange={(value) => {
                setSessionId(value);
                setTermId(null);
                setClassId(null);
                form.setFieldsValue({ term_id: undefined, class_id: undefined });
              }}
              options={sessions.map((session) => ({
                label: `${session.name}${session.current ? " (Current)" : ""}`,
                value: session.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Term"
            name="term_id"
            rules={[{ required: true, message: "Please select a term" }]}
          >
            <Select
              placeholder="Select Term"
              loading={loadingTerms}
              disabled={!sessionId || terms.length === 0}
              value={termId}
              onChange={(value) => {
                setTermId(value);
              }}
              options={terms.map((term) => ({
                label: term.name,
                value: term.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Class"
            name="class_id"
            rules={[{ required: true, message: "Please select a class" }]}
          >
            <Select
              placeholder="Select Class"
              loading={loadingClassLevels}
              value={classId}
              onChange={(value) => {
                setClassId(value);
              }}
              options={classLevels.map((level) => ({
                label: level.name,
                value: level.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Fee Type"
            name="fee_type"
            rules={[{ required: true, message: "Please enter fee type" }]}
          >
            <Input
              placeholder="Enter fee type (e.g., Bus, Tuition, etc.)"
            />
          </Form.Item>

          <Form.Item
            label="Amount Due"
            name="amount_due"
            rules={[
              { required: true, message: "Please enter amount due" },
              { type: "number", min: 0, message: "Amount must be 0 or greater" },
            ]}
          >
            <InputNumber
              placeholder="Enter amount due"
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/₦\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Create Fee
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              onClick={() => {
                form.resetFields();
                setSessionId(null);
                setTermId(null);
                setClassId(null);
              }}
            >
              Reset
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              onClick={() => router.push("/admin/fees")}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
