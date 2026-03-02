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

interface BookFormData {
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: number;
  selling_price: number;
}

interface BookAddResponse {
  message: string;
  data: {
    book_name: string;
    class_level_id: number;
    term_id: number;
    quantity: number;
    cost_price: number;
    selling_price: number;
    uuid: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export default function AddBookPage() {
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
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchTerms(currentSession.id);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
    }
  }, [selectedSessionId]);

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
      setError(err.response?.data?.message || "Failed to load sessions. Please try again.");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTerms = async (sessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null);

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        if (response.data.terms.length > 0) {
          setSelectedTermId(response.data.terms[0].id);
          form.setFieldsValue({ term_id: response.data.terms[0].id });
        }
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      setError(err.response?.data?.message || "Failed to load terms. Please try again.");
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
      } else {
        setClassLevels([]);
        setError("No class levels found.");
      }
    } catch (err: any) {
      console.error("Error fetching class levels:", err);
      setError(err.response?.data?.message || "Failed to load class levels. Please try again.");
      setClassLevels([]);
    } finally {
      setLoadingClassLevels(false);
    }
  };

  const onFinish = async (values: BookFormData) => {
    if (!selectedSessionId) {
      setError("Please select a session");
      message.error("Please select a session");
      return;
    }

    if (!selectedTermId) {
      setError("Please select a term");
      message.error("Please select a term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<BookAddResponse>(
        "http://127.0.0.1:8000/api/bookshop/books/add",
        {
          book_name: values.book_name,
          class_level_id: values.class_level_id,
          term_id: values.term_id,
          quantity: values.quantity,
          initial_quantity: values.initial_quantity,
          cost_price: values.cost_price,
          selling_price: values.selling_price,
        },
        getAuthHeaders()
      );

      if (response.data.message === "Book added successfully") {
        message.success("Book added successfully!");
        
        // Wait 2 seconds before redirecting
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Error adding book:", err);
      const errorMessage = err.response?.data?.message || "Failed to add book. Please try again.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Add Book</h1>

        {error && (
          <Alert
            message={error}
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
            rules={[{ required: true, message: "Please select a session" }]}
          >
            <Select
              value={selectedSessionId}
              onChange={(value) => {
                setSelectedSessionId(value);
              }}
              placeholder="Select Session"
              loading={loadingSessions}
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.name}${session.current ? " (Current)" : ""}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Term"
            name="term_id"
            rules={[{ required: true, message: "Please select a term" }]}
          >
            <Select
              value={selectedTermId}
              onChange={(value) => {
                setSelectedTermId(value);
                form.setFieldsValue({ term_id: value });
              }}
              placeholder="Select Term"
              loading={loadingTerms}
              disabled={!selectedSessionId || loadingTerms}
              options={terms.map((term) => ({
                value: term.id,
                label: term.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Class Level"
            name="class_level_id"
            rules={[{ required: true, message: "Please select a class level" }]}
          >
            <Select
              placeholder="Select Class Level"
              loading={loadingClassLevels}
              options={classLevels.map((level) => ({
                value: level.id,
                label: level.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Book Name"
            name="book_name"
            rules={[{ required: true, message: "Please enter book name" }]}
          >
            <Input placeholder="Enter book name" />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              { required: true, message: "Please enter quantity" },
              { type: "number", min: 1, message: "Quantity must be at least 1" },
            ]}
          >
            <InputNumber
              placeholder="Enter quantity"
              min={1}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Initial Quantity"
            name="initial_quantity"
            rules={[
              { required: true, message: "Please enter initial quantity" },
              { type: "number", min: 0, message: "Initial quantity must be 0 or greater" },
              { 
                validator: (_, value) => {
                  if (value === undefined || value === null) {
                    return Promise.resolve();
                  }
                  if (Number.isInteger(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Initial quantity must be an integer"));
                }
              },
            ]}
          >
            <InputNumber
              placeholder="Enter initial quantity"
              min={0}
              precision={0}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Cost Price"
            name="cost_price"
            rules={[
              { required: true, message: "Please enter cost price" },
              { type: "number", min: 0, message: "Cost price must be 0 or greater" },
            ]}
          >
            <InputNumber
              placeholder="Enter cost price"
              min={0}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Selling Price"
            name="selling_price"
            rules={[
              { required: true, message: "Please enter selling price" },
              { type: "number", min: 0, message: "Selling price must be 0 or greater" },
            ]}
          >
            <InputNumber
              placeholder="Enter selling price"
              min={0}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Add Book
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
