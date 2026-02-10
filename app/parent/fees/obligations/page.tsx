"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Select, Table, Space } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Child {
  uuid: string;
  name: string;
  email: string;
  class_name?: string;
}

interface FeeObligation {
  id: number;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: string;
  due_date?: string;
  [key: string]: any;
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

interface Class {
  class_id: number;
  class_name: string;
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

interface ClassResponse {
  status: string;
  student: {
    uuid: string;
    name: string;
  };
  class: {
    class_id: number;
    class_name: string;
  };
  message?: string;
}

interface ApiResponse {
  data: Child[] | FeeObligation[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ParentFeeObligationsPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [obligations, setObligations] = useState<FeeObligation[]>([]);
  const [selectedChildUuid, setSelectedChildUuid] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChildren();
    fetchSessions();
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
    if (selectedSessionId && selectedChildUuid) {
      fetchTerms(selectedSessionId);
      fetchClass(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
      setStudentClass(null);
      setClassId(null);
    }
  }, [selectedSessionId, selectedChildUuid]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedChildUuid && selectedSessionId && selectedTermId && classId) {
      fetchFeeObligations();
    } else {
      setObligations([]);
    }
  }, [selectedChildUuid, selectedSessionId, selectedTermId, classId]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children`,
        getAuthHeaders()
      );

      let childrenData: Child[] = [];
      if (Array.isArray(response.data)) {
        childrenData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        childrenData = response.data.data;
      } else if ((response.data as any).children && Array.isArray((response.data as any).children)) {
        childrenData = (response.data as any).children;
      }

      setChildren(childrenData);
      if (childrenData.length === 1) {
        setSelectedChildUuid(childrenData[0].uuid);
      }
    } catch (err: any) {
      console.error("Error fetching children:", err);
      setError(err.response?.data?.message || "Failed to load children. Please try again.");
    } finally {
      setLoadingChildren(false);
    }
  };

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

  const fetchClass = async (sessionId: number) => {
    if (!selectedChildUuid) return;

    setLoadingClass(true);
    setError("");

    try {
      const response = await axios.get<ClassResponse>(
        `http://127.0.0.1:8000/api/users/${selectedChildUuid}/class/by/session/${sessionId}`,
        getAuthHeaders()
      );

      console.log("Class response:", response.data);

      if (response.data.status === "success" && response.data.class) {
        setStudentClass({
          class_id: response.data.class.class_id,
          class_name: response.data.class.class_name,
        });
        setClassId(response.data.class.class_id);
      }
    } catch (err: any) {
      console.error("Error fetching class:", err);
      setStudentClass(null);
      setClassId(null);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchFeeObligations = async () => {
    if (!selectedChildUuid || !selectedSessionId || !selectedTermId || !classId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/view/child/fees/obligations?student_uuid=${selectedChildUuid}&session_id=${selectedSessionId}&term_id=${selectedTermId}&class_id=${classId}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setObligations(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setObligations(response.data.data);
      } else {
        setObligations([]);
      }
    } catch (err: any) {
      console.error("Error fetching fee obligations:", err);
      setError(err.response?.data?.message || "Failed to load fee obligations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const obligationColumns = [
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => `₦${balance?.toLocaleString() || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => {
        if (!date) return "-";
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return date;
        }
      },
    },
  ];

  return (
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Fee Obligations</h1>
        
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

        <Space orientation="vertical" size="large" style={{ width: "100%", marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Select Child</label>
            <Select
              style={{ width: "100%", maxWidth: 400 }}
              value={selectedChildUuid}
              onChange={setSelectedChildUuid}
              placeholder="Select a child"
              loading={loadingChildren}
              options={children.map((child) => ({
                value: child.uuid,
                label: `${child.name}${child.class_name ? ` (${child.class_name})` : ""}`,
              }))}
            />
          </div>

          {selectedChildUuid && (
            <Space wrap>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Session</label>
                <Select
                  style={{ width: 200 }}
                  value={selectedSessionId}
                  onChange={setSelectedSessionId}
                  placeholder="Select Session"
                  loading={loadingSessions}
                  options={sessions.map((session) => ({
                    value: session.id,
                    label: `${session.name}${session.current ? " (Current)" : ""}`,
                  }))}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Term</label>
                <Select
                  style={{ width: 200 }}
                  value={selectedTermId}
                  onChange={setSelectedTermId}
                  placeholder="Select Term"
                  loading={loadingTerms}
                  disabled={!selectedSessionId || loadingTerms}
                  options={terms.map((term) => ({
                    value: term.id,
                    label: term.name,
                  }))}
                />
              </div>
              {studentClass && (
                <div style={{ padding: "4px 11px", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fafafa", alignSelf: "flex-end" }}>
                  Class: {studentClass.class_name}
                </div>
              )}
            </Space>
          )}
        </Space>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : obligations.length > 0 ? (
          <Table
            dataSource={obligations}
            columns={obligationColumns}
            rowKey="id"
            pagination={false}
          />
        ) : selectedChildUuid && selectedSessionId && selectedTermId && classId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            No fee obligations found.
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}

