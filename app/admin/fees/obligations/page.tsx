"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Tag } from "antd";
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

interface Class {
  class_id: number;
  class_name: string;
}

interface Student {
  uuid: string;
  name: string;
  email?: string;
  class_name?: string;
}

interface Fee {
  fee_id: number;
  fee_type: string;
  amount_due: string;
  amount_paid: string;
  status: string;
}

interface FeeObligationsResponse {
  status: boolean;
  type: string;
  student_id: number;
  fees: Fee[];
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

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
  message?: string;
}

interface StudentsResponse {
  data: Student[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function FeeObligationsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [studentUuid, setStudentUuid] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
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
      fetchClasses(sessionId);
    } else {
      setTerms([]);
      setClasses([]);
      setTermId(null);
      setClassId(null);
      setStudents([]);
      setStudentUuid(null);
      setFees([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
    }
  }, [terms, termId]);

  useEffect(() => {
    if (classId && sessionId) {
      fetchStudents();
    } else {
      setStudents([]);
      setStudentUuid(null);
      setFees([]);
    }
  }, [classId, sessionId]);

  useEffect(() => {
    if (studentUuid && sessionId && termId && classId) {
      fetchFeeObligations();
    } else {
      setFees([]);
    }
  }, [studentUuid, sessionId, termId, classId]);

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

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setClassId(null);
    setStudents([]);
    setStudentUuid(null);
    setFees([]);

    try {
      const response = await axios.get<ClassesResponse>(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/classes`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else {
        setClasses([]);
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async () => {
    if (!classId || !sessionId) return;

    setLoadingStudents(true);
    setError("");
    setStudents([]);
    setStudentUuid(null);
    setFees([]);

    try {
      const response = await axios.get<StudentsResponse>(
        `http://127.0.0.1:8000/api/admin/viewstudents?class_id=${classId}`,
        getAuthHeaders()
      );

      let studentsData: Student[] = [];
      if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      }

      setStudents(studentsData);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchFeeObligations = async () => {
    if (!studentUuid || !sessionId || !termId || !classId) return;

    setLoadingFees(true);
    setError("");
    setFees([]);

    try {
      const response = await axios.get<FeeObligationsResponse>(
        `http://127.0.0.1:8000/api/view/child/fees/obligations?student_uuid=${studentUuid}&session_id=${sessionId}&term_id=${termId}&class_id=${classId}`,
        getAuthHeaders()
      );

      if (response.data.status === true && Array.isArray(response.data.fees)) {
        setFees(response.data.fees);
      } else {
        setFees([]);
        setError("No fee obligations found for this student.");
      }
    } catch (err: any) {
      console.error("Error fetching fee obligations:", err);
      const errorMessage = err.response?.data?.message || "Failed to load fee obligations. Please try again.";
      setError(errorMessage);
      setFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "green";
      case "part_paid":
        return "orange";
      case "unpaid":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "Paid";
      case "part_paid":
        return "Part Paid";
      case "unpaid":
        return "Unpaid";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: string | number) => {
        const amountValue = typeof amount === "string" ? parseFloat(amount || "0") : amount || 0;
        return `₦${amountValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
  ];

  if (loadingSessions) {
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

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Session</label>
              <Select
                value={sessionId}
                onChange={(value) => {
                  setSessionId(value);
                  setTermId(null);
                  setClassId(null);
                  setStudents([]);
                  setStudentUuid(null);
                  setFees([]);
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
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Term</label>
              <Select
                value={termId}
                onChange={(value) => {
                  setTermId(value);
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
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Class</label>
              <Select
                value={classId}
                onChange={(value) => {
                  setClassId(value);
                  setStudentUuid(null);
                  setFees([]);
                }}
                style={{ width: 200 }}
                placeholder="Select Class"
                loading={loadingClasses}
                disabled={!sessionId || classes.length === 0}
                options={classes.map((cls) => ({
                  label: cls.class_name,
                  value: cls.class_id,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Student</label>
              <Select
                value={studentUuid}
                onChange={(value) => {
                  setStudentUuid(value);
                }}
                style={{ width: 250 }}
                placeholder="Select Student"
                loading={loadingStudents}
                disabled={!classId || students.length === 0}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={students.map((student) => ({
                  label: student.name,
                  value: student.uuid,
                }))}
              />
            </div>
          </div>
        </div>

        {loadingFees ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : fees.length > 0 ? (
          <Table
            dataSource={fees}
            columns={columns}
            rowKey="fee_id"
            pagination={false}
          />
        ) : studentUuid && sessionId && termId && classId ? (
          <Alert
            title="No fee obligations found for this student"
            type="info"
            showIcon
            style={{ marginTop: "20px" }}
          />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
