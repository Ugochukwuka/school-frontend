"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Button, Space, Typography, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

interface FeeObligation {
  fee_id: number;
  fee_type: string;
  amount_due: string;
  amount_paid: string;
  status: string;
  [key: string]: any;
}

interface FeeObligationsResponse {
  status: boolean;
  type: string;
  student_id: number;
  fees: FeeObligation[];
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Term {
  id: number;
  name: string;
  [key: string]: any;
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

interface Class {
  class_id?: number;
  class_name: string;
  [key: string]: any;
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

export default function FeeObligationsPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [obligations, setObligations] = useState<FeeObligation[]>([]);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingObligations, setLoadingObligations] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  
  const [error, setError] = useState("");

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
      }
    }
  }, [sessions]);

  // Fetch terms and class when session is selected
  useEffect(() => {
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClass(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
      setStudentClass(null);
    }
  }, [selectedSessionId]);

  // Fetch fee obligations when session, term, and class are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && studentClass?.class_id && studentUuid) {
      fetchFeeObligations(selectedSessionId, selectedTermId, studentClass.class_id);
    } else {
      setObligations([]);
    }
  }, [selectedSessionId, selectedTermId, studentClass?.class_id, studentUuid]);

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
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null); // Reset term selection
    setObligations([]); // Clear obligations

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

  const fetchClass = async (sessionId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingClass(true);
    setError("");

    try {
      const response = await axios.get<ClassResponse>(
        `http://127.0.0.1:8000/api/users/${studentUuid}/class/by/session/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && response.data.class) {
        setStudentClass(response.data.class);
      } else if (response.data.message) {
        // Class not found for this session - set to null
        setStudentClass(null);
      } else {
        setStudentClass(null);
      }
    } catch (err: any) {
      console.error("Error fetching class:", err);
      // Don't set error for class fetch failures - just set class to null
      setStudentClass(null);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchFeeObligations = async (sessionId: number, termId: number, classId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingObligations(true);
    setError("");

    try {
      const response = await axios.get<FeeObligationsResponse>(
        `http://127.0.0.1:8000/api/view/child/fees/obligations?student_uuid=${studentUuid}&session_id=${sessionId}&term_id=${termId}&class_id=${classId}`,
        getAuthHeaders()
      );

      if (response.data.status && Array.isArray(response.data.fees)) {
        setObligations(response.data.fees);
      } else {
        setObligations([]);
      }
    } catch (err: any) {
      console.error("Error fetching fee obligations:", err);
      let errorMessage = "Failed to load fee obligations. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No fee obligations found for the selected session and term.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setObligations([]);
    } finally {
      setLoadingObligations(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    // Terms will be fetched automatically in useEffect
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
    // Fee obligations will be fetched automatically in useEffect
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && studentClass?.class_id) {
      fetchFeeObligations(selectedSessionId, selectedTermId, studentClass.class_id);
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
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (amount: string) => `₦${parseFloat(amount || "0").toLocaleString()}`,
    },
    {
      title: "Balance",
      key: "balance",
      render: (_: any, record: FeeObligation) => {
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
        const statusMap: { [key: string]: string } = {
          paid: "Paid",
          part_paid: "Partially Paid",
          unpaid: "Unpaid",
        };
        return statusMap[status] || status;
      },
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingObligations || loadingClass;
  const isInitialLoading = loadingSessions;

  return (
    <DashboardLayout role="student">
      {isInitialLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#001529",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Spin size="large" />
        </div>
      )}
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
            Fee Obligations
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
              options={terms.map((term) => ({
                value: term.id,
                label: term.name,
              }))}
            />
          </div>

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Class
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingClass ? "Loading class..." : "No class assigned"}
              value={studentClass?.class_name || null}
              disabled={true}
              loading={loadingClass}
              options={studentClass ? [{
                value: studentClass.class_name,
                label: studentClass.class_name,
              }] : []}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !obligations.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : "Loading fee obligations..."}
            </div>
          </div>
        )}

        {/* Fee Obligations Table */}
        {!isLoading && selectedSessionId && selectedTermId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={obligations}
              columns={columns}
              rowKey="fee_id"
              scroll={{ x: "max-content" }}
              loading={loadingObligations}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedTermId 
                        ? "Please select a term to view fee obligations"
                        : "No fee obligations found for the selected session and term"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                obligations.length > 0
                  ? {
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "obligation" : "obligations"}`,
                      responsive: true,
                      showQuickJumper: obligations.length > 50,
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
              description="Please select a session to view fee obligations"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && !selectedTermId && terms.length === 0 && (
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

