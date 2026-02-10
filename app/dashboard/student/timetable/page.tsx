"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

interface TimetableEntry {
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  subject_code: string;
  teacher_name: string;
}

interface CurrentSessionResponse {
  status: string;
  current_session: {
    id: number;
    name: string;
    current: boolean;
  };
  message?: string;
}

interface Term {
  id: number;
  name: string;
}

interface TermsResponse {
  status: string;
  session_id: string;
  terms: Term[];
  message?: string;
}

interface TimetableResponse {
  status: string;
  session: string;
  class: string;
  timetable: TimetableEntry[];
  message?: string;
}

export default function TimetablePage() {
  const { isMobile } = useResponsive();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  
  const [loadingCurrentSession, setLoadingCurrentSession] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
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

  // Fetch current session on mount
  useEffect(() => {
    if (studentUuid) {
      fetchCurrentSession();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoadingCurrentSession(false);
    }
  }, [studentUuid]);

  // Fetch terms when session ID is available
  useEffect(() => {
    if (currentSessionId) {
      fetchTerms(currentSessionId);
    }
  }, [currentSessionId]);

  // Auto-select first term and fetch timetable when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      const firstTerm = terms[0];
      setSelectedTermId(firstTerm.id);
      if (studentUuid) {
        fetchTimetable(firstTerm.id);
      }
    }
  }, [terms]);

  // Fetch timetable when term is selected
  useEffect(() => {
    if (selectedTermId && studentUuid) {
      fetchTimetable(selectedTermId);
    } else {
      setTimetable([]);
    }
  }, [selectedTermId, studentUuid]);

  const fetchCurrentSession = async () => {
    setLoadingCurrentSession(true);
    setError("");

    try {
      const response = await axios.get<CurrentSessionResponse>(
        "http://127.0.0.1:8000/api/sessions/current",
        getAuthHeaders()
      );

      if (response.data.status === "success" && response.data.current_session) {
        setCurrentSessionId(response.data.current_session.id);
        setSessionName(response.data.current_session.name);
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        throw new Error("Failed to fetch current session");
      }
    } catch (err: any) {
      console.error("Error fetching current session:", err);
      let errorMessage = "Failed to load current session. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingCurrentSession(false);
    }
  };

  const fetchTerms = async (sessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null); // Reset term selection
    setTimetable([]); // Clear timetable

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

  const fetchTimetable = async (termId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingTimetable(true);
    setError("");

    try {
      const response = await axios.get<TimetableResponse>(
        `http://127.0.0.1:8000/api/student/timetable?uuid=${studentUuid}&term_id=${termId}`,
        getAuthHeaders()
      );

      console.log("Timetable response:", response.data);

      if (response.data.status === "success" && Array.isArray(response.data.timetable)) {
        setTimetable(response.data.timetable);
        setClassName(response.data.class || "");
        if (response.data.session) {
          setSessionName(response.data.session);
        }
      } else if (response.data.message) {
        setError(response.data.message);
        setTimetable([]);
      } else {
        setTimetable([]);
      }
    } catch (err: any) {
      console.error("Error fetching timetable:", err);
      let errorMessage = "Failed to load timetable. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No timetable found for the selected term.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimetable([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
  };

  const handleRefresh = () => {
    if (selectedTermId) {
      fetchTimetable(selectedTermId);
    } else if (currentSessionId) {
      fetchTerms(currentSessionId);
    } else {
      fetchCurrentSession();
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    // Format time from "08:00:00" to "08:00 AM"
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const columns = [
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
      sorter: (a: TimetableEntry, b: TimetableEntry) => {
        const dayOrder: { [key: string]: number } = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
          Sunday: 7,
        };
        return (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      },
    },
    {
      title: "Time",
      key: "time",
      render: (_: any, record: TimetableEntry) => (
        <span>
          {formatTime(record.start_time)} - {formatTime(record.end_time)}
        </span>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      sorter: (a: TimetableEntry, b: TimetableEntry) => a.subject.localeCompare(b.subject),
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
  ];

  const isLoading = loadingCurrentSession || loadingTerms || loadingTimetable;

  // Show full-screen loading before rendering layout on initial load
  if (loadingCurrentSession && !currentSessionId) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        gap: "16px",
        backgroundColor: "#f0f2f5"
      }}>
        <Spin size="large" />
        <div style={{ color: "#666", fontSize: "14px" }}>Loading session...</div>
      </div>
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
            <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 600 }}>My Timetable</h1>
            {(sessionName || className) && (
              <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                {sessionName && <span>Session: {sessionName}</span>}
                {sessionName && className && <span> • </span>}
                {className && <span>Class: {className}</span>}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <Select
              value={selectedTermId}
              onChange={handleTermChange}
              style={{ width: isMobile ? "100%" : 200 }}
              placeholder={loadingTerms ? "Loading terms..." : "Select Term"}
              loading={loadingTerms}
              disabled={loadingTerms || !currentSessionId || terms.length === 0}
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
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
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

        {/* Loading Spinner */}
        {isLoading && !timetable.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingCurrentSession ? "Loading session..." : loadingTerms ? "Loading terms..." : "Loading timetable..."}
            </div>
          </div>
        )}

        {/* Timetable Table */}
        {!isLoading && selectedTermId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={timetable}
              columns={columns}
              rowKey={(record) => `${record.day}-${record.start_time}-${record.subject_code}-${record.subject}`}
              scroll={{ x: "max-content" }}
              loading={loadingTimetable}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedTermId 
                        ? "Please select a term to view timetable"
                        : "No timetable entries found for the selected term"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                timetable.length > 0
                  ? {
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "entry" : "entries"}`,
                      responsive: true,
                      showQuickJumper: timetable.length > 50,
                    }
                  : false
              }
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !currentSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Loading session information..."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && currentSessionId && !selectedTermId && terms.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No terms available for the current session"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
