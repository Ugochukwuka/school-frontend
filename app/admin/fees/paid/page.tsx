"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  parent_id: number;
  created_at: string;
  updated_at: string;
}

interface PaidFeesResponse {
  status: boolean;
  type: string;
  total: number;
  students: Student[];
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
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

export default function AdminPaidFeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
        fetchTerms(currentSession.id);
      } else if (sessions.length > 0) {
        setSessionId(sessions[0].id);
        fetchTerms(sessions[0].id);
      }
    }
  }, [sessions]);

  // Fetch terms when session changes
  useEffect(() => {
    if (sessionId) {
      fetchTerms(sessionId);
    } else {
      setTerms([]);
      setTermId(null);
    }
  }, [sessionId]);

  // Auto-select first term when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms]);

  // Fetch paid fees when both session and term are selected
  useEffect(() => {
    if (sessionId && termId) {
      fetchPaidFees();
    } else {
      setStudents([]);
      setTotal(0);
    }
  }, [sessionId, termId]);

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

  const fetchTerms = async (selectedSessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setTermId(null);

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${selectedSessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        if (response.data.terms.length > 0) {
          setTermId(response.data.terms[0].id);
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

  const fetchPaidFees = async () => {
    if (!sessionId || !termId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<PaidFeesResponse>(
        `http://127.0.0.1:8000/api/admin/fees/paid?session_id=${sessionId}&term_id=${termId}`,
        getAuthHeaders()
      );

      if (response.data.status && response.data.students) {
        setStudents(response.data.students);
        setTotal(response.data.total || response.data.students.length);
      } else {
        setStudents([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error("Error fetching paid fees:", err);
      setError(
        err.response?.data?.message || "Failed to load paid fees. Please try again."
      );
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
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
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h1 style={{ margin: 0 }}>Students Who Fully Paid Fees</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              value={sessionId}
              onChange={(value) => setSessionId(value)}
              style={{ width: 200 }}
              loading={loadingSessions}
              placeholder="Select Session"
              options={sessions.map((session) => ({
                label: `${session.name}${session.current ? " (Current)" : ""}`,
                value: session.id,
              }))}
            />
            <Select
              value={termId}
              onChange={(value) => setTermId(value)}
              style={{ width: 200 }}
              loading={loadingTerms}
              placeholder="Select Term"
              disabled={!sessionId || terms.length === 0}
              options={terms.map((term) => ({
                label: term.name,
                value: term.id,
              }))}
            />
          </div>
        </div>

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

        {sessionId && termId && (
          <div style={{ marginBottom: 16 }}>
            <strong>Total: {total} student{total !== 1 ? "s" : ""}</strong>
          </div>
        )}

        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={
            students.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} students`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}
