"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Spin, Alert, Card, Button, Select, Space, Typography, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import { useSearchParams } from "next/navigation";

const { Title } = Typography;

interface Fee {
  id: number;
  class_id: number;
  session_id: number;
  fee_type: string;
  amount_due: string;
  term_id: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: number;
  student_id: number;
  fee_id: number;
  amount_due: string;
  amount_paid: string;
  status: string;
  created_at: string;
  updated_at: string;
  fee: Fee;
}

interface PaymentTableRow extends Payment {
  _rowKey: string;
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
  id?: number;
  term_id?: number;
  name?: string;
  term_name?: string;
  term?: string;
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

interface PaymentHistoryResponse {
  status: boolean;
  type: string;
  student_id: number;
  fees: Payment[];
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

export default function PaymentHistoryPage() {
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Initialize from URL params if available
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(() => {
    const sid = searchParams.get("session_id");
    return sid ? parseInt(sid, 10) : null;
  });
  const [selectedTermId, setSelectedTermId] = useState<number | null>(() => {
    const tid = searchParams.get("term_id");
    return tid ? parseInt(tid, 10) : null;
  });
  const [classId, setClassId] = useState<number | null>(() => {
    const cid = searchParams.get("class_id");
    return cid ? parseInt(cid, 10) : null;
  });
  const [className, setClassName] = useState<string>("");
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [error, setError] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Get UUID from localStorage (stored during login)
  const getStudentUuid = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.uuid || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const studentUuid = getStudentUuid();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSessionId) {
      params.set("session_id", selectedSessionId.toString());
    }
    if (selectedTermId) {
      params.set("term_id", selectedTermId.toString());
    }
    if (classId) {
      params.set("class_id", classId.toString());
    }
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [selectedSessionId, selectedTermId, classId]);

  // Fetch sessions on mount
  useEffect(() => {
    if (studentUuid) {
      fetchSessions();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoadingSessions(false);
    }
  }, [studentUuid]);

  // Auto-select current session and fetch terms when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchTerms(currentSession.id);
        fetchClass(currentSession.id);
      }
    }
  }, [sessions]);

  // Auto-select first term when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !selectedTermId && selectedSessionId && classId) {
      const firstTerm = terms[0];
      const termId = firstTerm.id || firstTerm.term_id || 0;
      setSelectedTermId(termId);
    }
  }, [terms, selectedSessionId, classId]);

  // Fetch payment history when both session and term are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && classId && studentUuid) {
      fetchPaymentHistory(selectedSessionId, selectedTermId);
    } else {
      setPayments([]);
    }
  }, [selectedSessionId, selectedTermId, classId, studentUuid]);

  // Debug: Log payments changes
  useEffect(() => {
    console.log("Payments state updated:", payments);
    console.log("Payments count:", payments.length);
  }, [payments]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await axios.get<SessionsResponse | Session[]>(
        "http://127.0.0.1:8000/api/viewsessions",
        getAuthHeaders()
      );

      // Handle both array response and object with data property
      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      } else if (response.data?.status === "error") {
        throw new Error(response.data.message || "Failed to fetch sessions");
      }

      // Sort: current session first, then by name descending (newest first)
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
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null); // Reset term selection
    setPayments([]); // Clear payments

    try {
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      console.log("Terms response:", response.data);

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        // Ensure term IDs are numbers and log them
        const termsData = response.data.terms.map((term: any) => {
          const termId = typeof term.id === 'string' ? parseInt(term.id, 10) : term.id;
          const termIdAlt = term.term_id ? (typeof term.term_id === 'string' ? parseInt(term.term_id, 10) : term.term_id) : null;
          
          console.log(`Term: ${term.name}, ID: ${termId}, term_id field: ${termIdAlt}`);
          
          return {
            id: termId || termIdAlt || term.id,
            name: term.name || term.term_name || term.term,
          };
        });
        
        console.log("Processed terms:", termsData);
        setTerms(termsData);
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      console.error("Error response:", err.response?.data);
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

  const fetchClass = async (sessionId: number) => {
    if (!studentUuid) {
      return;
    }

    setLoadingClass(true);
    setClassId(null);
    setClassName("");
    setPayments([]); // Clear payments when class changes

    try {
      const response = await axios.get<ClassResponse>(
        `http://127.0.0.1:8000/api/users/${studentUuid}/class/by/session/${sessionId}`,
        getAuthHeaders()
      );

      console.log("Class response:", response.data);

      if (response.data.status === "success" && response.data.class) {
        setClassId(response.data.class.class_id);
        setClassName(response.data.class.class_name);
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        setError("No class found for this session.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to load class. Please try again.";

      if (err.response?.status === 404) {
        errorMessage = "No class found for this session.";
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setClassId(null);
      setClassName("");
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchPaymentHistory = async (sessionId: number, termId: number) => {
    if (!studentUuid || !classId) {
      setError("Student UUID or Class ID not found. Please try again.");
      return;
    }

    // Ensure termId is a number
    const numericTermId = typeof termId === 'string' ? parseInt(termId, 10) : termId;
    const numericSessionId = typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId;
    const numericClassId = typeof classId === 'string' ? parseInt(classId, 10) : classId;

    console.log("Fetching payment history with:", {
      student_uuid: studentUuid,
      session_id: numericSessionId,
      term_id: numericTermId,
      class_id: numericClassId,
    });

    setLoadingPayments(true);
    setError("");

    try {
      const response = await axios.post<PaymentHistoryResponse>(
        `http://127.0.0.1:8000/api/view/child/payment/history`,
        {
          student_uuid: studentUuid,
          session_id: numericSessionId,
          term_id: numericTermId,
          class_id: numericClassId,
        },
        getAuthHeaders()
      );

      console.log("Payment history response:", response.data);

      let paymentsData: Payment[] = [];

      // Handle the actual response structure: { status: true, type: "payment_history", student_id: 5, fees: [...] }
      if (response.data && response.data.status === true && Array.isArray(response.data.fees)) {
        paymentsData = response.data.fees;
      } else if (Array.isArray(response.data)) {
        // Fallback: direct array response
        paymentsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Check for other possible structures
        if (Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        } else if (Array.isArray(response.data.payments)) {
          paymentsData = response.data.payments;
        } else if (Array.isArray(response.data.fees)) {
          paymentsData = response.data.fees;
        } else if (Array.isArray(response.data.history)) {
          paymentsData = response.data.history;
        }
      }

      console.log("Extracted payments data:", paymentsData);
      console.log("Payments count:", paymentsData.length);

      if (paymentsData.length > 0) {
        setPayments(paymentsData);
        setTotal(paymentsData.length);
        setCurrentPage(1);
        setTotalPages(1);
      } else {
        console.warn("No payments data found in response");
        setPayments([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      console.error("Error response:", err.response?.data);
      console.error("Request payload was:", {
        student_uuid: studentUuid,
        session_id: numericSessionId,
        term_id: numericTermId,
        class_id: numericClassId,
      });
      let errorMessage = "Failed to load payment history. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    fetchTerms(sessionId);
    fetchClass(sessionId);
  };

  const handleTermChange = (termId: number | string) => {
    // Ensure termId is always a number
    const numericTermId = typeof termId === 'string' ? parseInt(termId, 10) : termId;
    console.log("Term changed to:", numericTermId);
    setSelectedTermId(numericTermId);
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && classId) {
      fetchPaymentHistory(selectedSessionId, selectedTermId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClass(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const columns = [
    {
      title: "Fee Type",
      key: "fee_type",
      render: (record: Payment) => record.fee?.fee_type || "N/A",
    },
    {
      title: "Amount Due",
      key: "amount_due",
      render: (record: Payment) => `₦${parseFloat(record.amount_due || "0").toLocaleString()}`,
    },
    {
      title: "Amount Paid",
      key: "amount_paid",
      render: (record: Payment) => `₦${parseFloat(record.amount_paid || "0").toLocaleString()}`,
    },
    {
      title: "Balance",
      key: "balance",
      render: (record: Payment) => {
        const due = parseFloat(record.amount_due || "0");
        const paid = parseFloat(record.amount_paid || "0");
        const balance = due - paid;
        return `₦${balance.toLocaleString()}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
          paid: { text: "Paid", color: "green" },
          part_paid: { text: "Partially Paid", color: "orange" },
          unpaid: { text: "Unpaid", color: "red" },
        };
        const statusInfo = statusMap[status] || { text: status, color: "default" };
        return <span style={{ color: statusInfo.color, fontWeight: 500 }}>{statusInfo.text}</span>;
      },
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => {
        if (!date) return "N/A";
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return date;
        }
      },
    },
  ];

  const paymentTableData = useMemo<PaymentTableRow[]>(() => {
    const keyCount: Record<string, number> = {};

    return payments.map((payment) => {
      const baseKey = [
        payment.id ?? "no-id",
        payment.fee_id ?? "no-fee",
        payment.created_at ?? "no-created",
        payment.updated_at ?? "no-updated",
        payment.amount_due ?? "no-due",
        payment.amount_paid ?? "no-paid",
        payment.status ?? "no-status",
      ].join("-");

      const occurrence = keyCount[baseKey] ?? 0;
      keyCount[baseKey] = occurrence + 1;

      return {
        ...payment,
        _rowKey: `${baseKey}-${occurrence}`,
      };
    });
  }, [payments]);

  const isLoading = loadingSessions || loadingTerms || loadingClass || loadingPayments;

  return (
    <DashboardLayout role="student">
      <Card>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          marginBottom: "24px",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "16px" : "0"
        }}>
          <Title level={2} style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 600 }}>
            Payment History
          </Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        </div>

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

        {/* Selection Filters */}
        <Space 
          orientation={isMobile ? "vertical" : "horizontal"} 
          size="large" 
          style={{ 
            width: "100%", 
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap"
          }}
        >
          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Academic Session
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Session"
              value={selectedSessionId}
              onChange={handleSessionChange}
              loading={loadingSessions}
              disabled={loadingSessions || sessions.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.name}${session.current ? " (Current)" : ""}`,
              }))}
            />
          </div>

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Term
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingTerms ? "Loading terms..." : "Select Term"}
              value={selectedTermId}
              onChange={handleTermChange}
              loading={loadingTerms}
              disabled={loadingTerms || !selectedSessionId || terms.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={terms.map((term) => {
                const termId = term.id || term.term_id || 0;
                const termName = term.name || term.term_name || term.term || "Unknown Term";
                return {
                  value: termId,
                  label: termName,
                };
              })}
            />
          </div>

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Class
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingClass ? "Loading class..." : "Select Class"}
              value={classId}
              loading={loadingClass}
              disabled={true}
              options={classId && className ? [{
                value: classId,
                label: className,
              }] : []}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !payments.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingClass ? "Loading class..." : loadingTerms ? "Loading terms..." : "Loading payment history..."}
            </div>
          </div>
        )}

        {/* Payment History Table */}
        {selectedSessionId && selectedTermId && classId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={paymentTableData}
              columns={columns}
              rowKey={(record) => record._rowKey}
              scroll={{ x: "max-content" }}
              loading={loadingPayments}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      loadingPayments
                        ? "Loading payment history..."
                        : "No payment history found for this session and term"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                payments.length > 0
                  ? {
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "payment" : "payments"}`,
                      responsive: true,
                      showQuickJumper: payments.length > 50,
                    }
                  : false
              }
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !selectedSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select a session to view payment history"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && !classId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No class found for the selected session"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && classId && !selectedTermId && terms.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No terms available for the selected session"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

