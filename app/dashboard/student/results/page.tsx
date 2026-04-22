"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Button, Empty, Space } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import ResultReportView from "./components/ResultReportView";
import { useSearchParams } from "next/navigation";

interface Result {
  subject: string;
  subject_code: string;
  teacher_name: string;
  ca1: number;
  ca2: number;
  exam_score: number;
  total: number;
  grade: string;
  teacher_comment: string;
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

interface ResultsResponse {
  status: string;
  session_id: number;
  session: string;
  term_id: string;
  class: string;
  results: Result[];
  message?: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [sessionName, setSessionName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  
  // Initialize from URL params if available
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(() => {
    const sid = searchParams.get("session_id");
    return sid ? parseInt(sid, 10) : null;
  });
  const [selectedTermId, setSelectedTermId] = useState<number | null>(() => {
    const tid = searchParams.get("term_id");
    return tid ? parseInt(tid, 10) : null;
  });
  const [selectedTermName, setSelectedTermName] = useState<string>("");
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");
  const [showReportView, setShowReportView] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);

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
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [selectedSessionId, selectedTermId]);

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

  // Auto-select first term and fetch results when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      const firstTerm = terms[0];
      setSelectedTermId(firstTerm.id);
      setSelectedTermName(firstTerm.name);
      if (studentUuid && selectedSessionId) {
        fetchResults(selectedSessionId, firstTerm.id);
      }
    }
  }, [terms]);

  // Fetch results when both session and term are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && studentUuid) {
      fetchResults(selectedSessionId, selectedTermId);
    } else {
      setResults([]);
    }
  }, [selectedSessionId, selectedTermId, studentUuid]);

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
    setResults([]); // Clear results

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

  const fetchResults = async (sessionId: number, termId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingResults(true);
    setError("");

    try {
      const response = await axios.get<ResultsResponse>(
        `http://127.0.0.1:8000/api/student/results?uuid=${studentUuid}&session_id=${sessionId}&term_id=${termId}`,
        getAuthHeaders()
      );

      console.log("Results response:", response.data);

      if (response.data.status === "success" && Array.isArray(response.data.results)) {
        setResults(response.data.results);
        setClassName(response.data.class || "");
        setSessionName(response.data.session || "");
      } else if (response.data.message) {
        setError(response.data.message);
        setResults([]);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      let errorMessage = "Failed to load results. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No results found for the selected session and term.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    fetchTerms(sessionId);
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
    const term = terms.find((t) => t.id === termId);
    setSelectedTermName(term?.name || "");
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId) {
      fetchResults(selectedSessionId, selectedTermId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const handleDownload = () => {
    if (!studentUuid || !selectedSessionId || !selectedTermId || results.length === 0) {
      setError("Please select both session and term to view results.");
      return;
    }
    // Show the report view (preview)
    setShowReportView(true);
  };

  const handleBackToTable = () => {
    setShowReportView(false);
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      sorter: (a: Result, b: Result) => a.subject.localeCompare(b.subject),
    },
    {
      title: "Subject Code",
      dataIndex: "subject_code",
      key: "subject_code",
    },
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher_name",
      render: (teacherName: string) => teacherName || "N/A",
    },
    {
      title: "CA1",
      dataIndex: "ca1",
      key: "ca1",
      sorter: (a: Result, b: Result) => (a.ca1 || 0) - (b.ca1 || 0),
      render: (score: number) => score ?? "N/A",
    },
    {
      title: "CA2",
      dataIndex: "ca2",
      key: "ca2",
      sorter: (a: Result, b: Result) => (a.ca2 || 0) - (b.ca2 || 0),
      render: (score: number) => score ?? "N/A",
    },
    {
      title: "Exam Score",
      dataIndex: "exam_score",
      key: "exam_score",
      sorter: (a: Result, b: Result) => (a.exam_score || 0) - (b.exam_score || 0),
      render: (score: number) => score ?? "N/A",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a: Result, b: Result) => a.total - b.total,
      render: (total: number) => <strong>{total}</strong>,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: string) => (
        <span style={{ fontWeight: 600, color: grade === "A" || grade === "B" ? "#52c41a" : grade === "C" ? "#faad14" : "#f5222d" }}>
          {grade || "N/A"}
        </span>
      ),
    },
    {
      title: "Comment",
      dataIndex: "teacher_comment",
      key: "teacher_comment",
      render: (comment: string) => comment || "N/A",
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingResults;

  // Show report view if toggled (preview)
  if (showReportView && studentUuid && selectedSessionId && selectedTermId && results.length > 0) {
    return (
      <ResultReportView
        studentUuid={studentUuid}
        sessionId={selectedSessionId}
        termId={selectedTermId}
        termName={selectedTermName}
        sessionName={sessionName}
        className={className}
        results={results}
        onBack={handleBackToTable}
      />
    );
  }

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
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 600 }}>My Results</h1>
            {(sessionName || className) && (
              <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                {sessionName && <span>Session: {sessionName}</span>}
                {sessionName && className && <span> • </span>}
                {className && <span>Class: {className}</span>}
              </div>
            )}
          </div>
          <Space size="middle" wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!selectedSessionId || !selectedTermId || results.length === 0}
            >
              Download Result
            </Button>
          </Space>
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
        </Space>

        {/* Loading Spinner */}
        {isLoading && !results.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : "Loading results..."}
            </div>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && selectedSessionId && selectedTermId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={results}
              columns={columns}
              rowKey={(record) => `${record.subject_code}-${record.subject}-${record.teacher_name}`}
              scroll={{ x: "max-content" }}
              loading={loadingResults}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedTermId 
                        ? "Please select a term to view results"
                        : "No results found for the selected session and term"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                results.length > 0
                  ? {
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "subject" : "subjects"}`,
                      responsive: true,
                      showQuickJumper: results.length > 50,
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
              description="Please select a session to view results"
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
