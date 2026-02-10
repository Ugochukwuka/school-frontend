"use client";

import { useEffect, useState } from "react";
import { Card, Select, Alert, Spin, App, Table } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

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

interface Book {
  id: number;
  branch_id: number;
  uuid: string;
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: string;
  selling_price: string;
  created_at: string;
  updated_at: string;
  class_level: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  term: {
    id: number;
    academic_session_id: number;
    name: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
  };
}

interface BookStatusResponse {
  status: boolean;
  data: Book[];
}

export default function BookStatusPage() {
  const { message } = App.useApp();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classLevelId, setClassLevelId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchClassLevels();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
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
    setTermId(null);

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

  const handleStatusChange = async (statusValue: string) => {
    if (!classLevelId || !termId) {
      message.warning("Please select class level and term first");
      return;
    }

    setSelectedStatus(statusValue);

    // Make API call with the selected status
    setLoading(true);
    setError("");
    setSuccess(false);
    setBooks([]);

    try {
      const response = await axios.get<BookStatusResponse>(
        `http://127.0.0.1:8000/api/bookshop/books/status?class_level_id=${classLevelId}&term_id=${termId}&status=${statusValue}`,
        getAuthHeaders()
      );

      if (response.data.status === true && Array.isArray(response.data.data)) {
        setBooks(response.data.data);
        setSuccess(true);
        if (response.data.data.length > 0) {
          message.success(`Successfully retrieved ${response.data.data.length} book(s)`);
        } else {
          message.info("No books found for the selected criteria");
        }
      } else if (response.data.status === true && response.data.data && response.data.data.length === 0) {
        // Handle empty array response
        setBooks([]);
        setSuccess(true);
        message.info("No books found for the selected criteria");
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Error fetching book status:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch book status. Please try again.";
      setError(errorMessage);
      setBooks([]);
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
    <App>
      <DashboardLayout role="admin">
        <Card>
        <h1 style={{ marginBottom: "24px" }}>Book Status</h1>

        {error && !success && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        {success && books.length > 0 && (
          <Alert
            title={`Success! Found ${books.length} book(s) with the selected status.`}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess(false)}
            style={{ marginBottom: 20 }}
          />
        )}

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: 500 }}>Session</label>
              <Select
                value={sessionId}
                onChange={(value) => {
                  setSessionId(value);
                  setTermId(null);
                  setSelectedStatus(null);
                  setSuccess(false);
                  setBooks([]);
                }}
                style={{ width: 200 }}
                placeholder="Select Session"
                loading={loadingSessions}
                options={sessions.map((session) => ({
                  label: `${session.name}${session.current ? " (Current)" : ""}`,
                  value: session.id,
                }))}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: 500 }}>Term</label>
              <Select
                value={termId}
                onChange={(value) => {
                  setTermId(value);
                  setSelectedStatus(null);
                  setSuccess(false);
                  setBooks([]);
                }}
                style={{ width: 200 }}
                placeholder="Select Term"
                loading={loadingTerms}
                disabled={!sessionId || terms.length === 0}
                options={terms.map((term) => ({
                  label: term.name,
                  value: term.id,
                }))}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: 500 }}>Class Level</label>
              <Select
                value={classLevelId}
                onChange={(value) => {
                  setClassLevelId(value);
                  setSelectedStatus(null);
                  setSuccess(false);
                  setBooks([]);
                }}
                style={{ width: 200 }}
                placeholder="Select Class Level"
                loading={loadingClassLevels}
                options={classLevels.map((level) => ({
                  label: level.name,
                  value: level.id,
                }))}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: 500 }}>Status</label>
              <Select
                value={selectedStatus}
                onChange={(value) => {
                  if (value) {
                    handleStatusChange(value);
                  } else {
                    setSelectedStatus(null);
                  }
                }}
                style={{ width: 200 }}
                placeholder="Select Status"
                loading={loading}
                disabled={!classLevelId || !termId}
                allowClear
                options={[
                  { 
                    label: "Purchased", 
                    value: "bought" 
                  },
                  { 
                    label: "In Stock", 
                    value: "not_bought" 
                  }
                ]}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        )}

        {!loading && books.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3 style={{ marginBottom: "16px" }}>Books List</h3>
            <Table
              dataSource={books}
              rowKey="uuid"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} book(s)`,
              }}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Book Name",
                  dataIndex: "book_name",
                  key: "book_name",
                  width: 200,
                },
                {
                  title: "Class Level",
                  dataIndex: ["class_level", "name"],
                  key: "class_level",
                  width: 120,
                },
                {
                  title: "Term",
                  dataIndex: ["term", "name"],
                  key: "term",
                  width: 120,
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 100,
                  align: "center" as const,
                },
                {
                  title: "Initial Quantity",
                  dataIndex: "initial_quantity",
                  key: "initial_quantity",
                  width: 130,
                  align: "center" as const,
                },
                {
                  title: "Cost Price",
                  dataIndex: "cost_price",
                  key: "cost_price",
                  width: 120,
                  align: "right" as const,
                  render: (price: string) => {
                    const numPrice = parseFloat(price);
                    return `₦${numPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
                  },
                },
                {
                  title: "Selling Price",
                  dataIndex: "selling_price",
                  key: "selling_price",
                  width: 130,
                  align: "right" as const,
                  render: (price: string) => {
                    const numPrice = parseFloat(price);
                    return `₦${numPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
                  },
                },
              ]}
            />
          </div>
        )}

        {!loading && selectedStatus && books.length === 0 && (
          <Alert
            title="No books found for the selected criteria"
            type="info"
            showIcon
            style={{ marginTop: "20px" }}
          />
        )}
        </Card>
      </DashboardLayout>
    </App>
  );
}
