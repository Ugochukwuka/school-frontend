"use client";

import { useEffect, useState } from "react";
import { Form, Button, Card, Select, Alert, Spin, Table, Tag, Space } from "antd";
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
  student_fee_id: number;
  fee_id: number;
  fee_name: string;
  amount_due: string;
  amount_paid: string;
  status: string;
  payments: string[];
  term_id?: number | null;
  class_id?: number | null;
  last_payment_date?: string | null;
}

interface PaymentHistoryResponse {
  status: boolean;
  type: string;
  student: {
    id: number;
    uuid: string;
    name: string;
  };
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

export default function PaymentHistoryPage() {
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
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
    } else {
      setTerms([]);
      setTermId(null);
      setClasses([]);
      setClassId(null);
      setStudents([]);
      setStudentUuid(null);
      setPaymentHistory(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (terms.length > 0 && termId === null) {
      const firstTerm = terms[0];
      setTermId(firstTerm.id);
    }
  }, [terms, termId]);

  useEffect(() => {
    if (sessionId && termId) {
      fetchClasses(sessionId);
    } else {
      setClasses([]);
      setClassId(null);
      setStudents([]);
      setStudentUuid(null);
      setPaymentHistory(null);
    }
  }, [sessionId, termId]);

  useEffect(() => {
    if (classId) {
      fetchStudents(classId);
    } else {
      setStudents([]);
      setStudentUuid(null);
      setPaymentHistory(null);
    }
  }, [classId]);

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
    setClasses([]);
    setClassId(null);
    setStudents([]);
    setStudentUuid(null);
    setPaymentHistory(null);

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
    setPaymentHistory(null);

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

  const fetchStudents = async (classId: number) => {
    setLoadingStudents(true);
    setError("");
    setStudents([]);
    setStudentUuid(null);
    setPaymentHistory(null);

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
      } else {
        studentsData = [];
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

  const fetchPaymentHistory = async () => {
    if (!studentUuid || !sessionId || !termId) {
      setError("Please select all required fields: Session, Term, and Student");
      return;
    }

    setLoadingHistory(true);
    setError("");

    try {
      const payload: Record<string, string | number> = {
        student_uuid: studentUuid,
        session_id: sessionId,
        term_id: termId,
      };
      if (classId) {
        payload.class_id = classId;
      }
      const response = await axios.post<PaymentHistoryResponse>(
        `http://127.0.0.1:8000/api/view/child/payment/history`,
        payload,
        getAuthHeaders()
      );

      if (response.data.status === true && response.data.type === "payment_history") {
        setPaymentHistory(response.data);
      } else {
        setError("Invalid response from server");
        setPaymentHistory(null);
      }
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Failed to load payment history. Please try again.");
      setPaymentHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSessionChange = (value: number) => {
    setSessionId(value);
    setTermId(null);
    setClassId(null);
    setStudentUuid(null);
    setPaymentHistory(null);
  };

  const handleTermChange = (value: number) => {
    setTermId(value);
    setClassId(null);
    setStudentUuid(null);
    setPaymentHistory(null);
  };

  const handleClassChange = (value: number) => {
    setClassId(value);
    setStudentUuid(null);
    setPaymentHistory(null);
  };

  const handleStudentChange = (value: string) => {
    setStudentUuid(value);
    setPaymentHistory(null);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      paid: { color: "green", text: "Paid" },
      part_paid: { color: "orange", text: "Part Paid" },
      unpaid: { color: "red", text: "Unpaid" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const feeColumns = [
    {
      title: "Fee Name",
      dataIndex: "fee_name",
      key: "fee_name",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: string) => {
        const numAmount = parseFloat(amount);
        return `₦${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: string) => {
        const numAmount = parseFloat(amount);
        return `₦${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Payment References",
      dataIndex: "payments",
      key: "payments",
      render: (payments: string[]) => (
        <Space wrap>
          {payments.map((payment, index) => (
            <Tag key={index}>{payment}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Term/Class",
      key: "term_class",
      render: (_: any, record: Fee) =>
        `${record.term_id ?? "-"} / ${record.class_id ?? "-"}`,
    },
    {
      title: "Last Payment Date",
      dataIndex: "last_payment_date",
      key: "last_payment_date",
      render: (value?: string | null) => value || "-",
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
        <h1 style={{ marginBottom: "24px" }}>Payment History</h1>

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
          onFinish={fetchPaymentHistory}
          style={{ marginBottom: "24px" }}
        >
          <Space wrap size="large" style={{ width: "100%", marginBottom: "20px" }}>
            <Form.Item
              label="Session"
              name="session_id"
              style={{ marginBottom: 0 }}
            >
              <Select
                value={sessionId}
                onChange={handleSessionChange}
                style={{ width: 200 }}
                placeholder="Select Session"
                loading={loadingSessions}
                options={sessions.map((session) => ({
                  label: `${session.name}${session.current ? " (Current)" : ""}`,
                  value: session.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Term"
              name="term_id"
              style={{ marginBottom: 0 }}
            >
              <Select
                value={termId}
                onChange={handleTermChange}
                style={{ width: 200 }}
                placeholder="Select Term"
                loading={loadingTerms}
                disabled={!sessionId || terms.length === 0}
                options={terms.map((term) => ({
                  label: term.name,
                  value: term.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Class"
              name="class_id"
              style={{ marginBottom: 0 }}
            >
              <Select
                value={classId}
                onChange={handleClassChange}
                style={{ width: 200 }}
                placeholder="Select Class"
                loading={loadingClasses}
                disabled={!sessionId || !termId || classes.length === 0}
                options={classes.map((cls) => ({
                  label: cls.class_name,
                  value: cls.class_id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Student"
              name="student_uuid"
              style={{ marginBottom: 0 }}
            >
              <Select
                value={studentUuid}
                onChange={handleStudentChange}
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
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: "30px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingHistory}
                disabled={!studentUuid || !sessionId || !termId}
              >
                View Payment History
              </Button>
            </Form.Item>
          </Space>
        </Form>

        {loadingHistory && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        )}

        {paymentHistory && !loadingHistory && (
          <Card title={`Payment History - ${paymentHistory.student.name}`} style={{ marginTop: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p><strong>Student ID:</strong> {paymentHistory.student.id}</p>
              <p><strong>Student UUID:</strong> {paymentHistory.student.uuid}</p>
            </div>

            {paymentHistory.fees && paymentHistory.fees.length > 0 ? (
              <Table
                dataSource={paymentHistory.fees}
                columns={feeColumns}
                rowKey="student_fee_id"
                pagination={false}
              />
            ) : (
              <Alert
                title="No payment exist"
                type="info"
                showIcon
              />
            )}
          </Card>
        )}
      </Card>
    </DashboardLayout>
  );
}
