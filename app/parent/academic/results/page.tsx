"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Spin, Alert, Select, Table, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import ResultReportView from "@/app/dashboard/student/results/components/ResultReportView";

interface Child {
  uuid: string;
  name: string;
  email: string;
  class_name?: string;
}

interface Result {
  id?: number;
  subject: string;
  subject_code: string;
  subject_name?: string; // Fallback for compatibility
  teacher_name?: string;
  ca1?: number;
  ca2?: number;
  exam_score?: number;
  total?: number;
  grade?: string;
  teacher_comment?: string;
  [key: string]: any;
}

interface Term {
  id: number;
  name: string;
}

interface Session {
  id: number;
  name: string;
  current: boolean;
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
  status?: string;
  session_id?: number;
  session?: string;
  term_id?: string;
  class?: string;
  results?: Result[];
  data?: Result[];
  message?: string;
}

interface ApiResponse {
  data: Child[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ParentAcademicResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  // Initialize from URL params if available
  const [selectedChildUuid, setSelectedChildUuid] = useState<string | null>(() => {
    return searchParams.get("child_uuid");
  });
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(() => {
    const sid = searchParams.get("session_id");
    return sid ? parseInt(sid, 10) : null;
  });
  const [selectedTermId, setSelectedTermId] = useState<number | null>(() => {
    const tid = searchParams.get("term_id");
    return tid ? parseInt(tid, 10) : null;
  });
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");
  const [showReportView, setShowReportView] = useState(false);
  const [sessionName, setSessionName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [selectedTermName, setSelectedTermName] = useState<string>("");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChildUuid) {
      params.set("child_uuid", selectedChildUuid);
    }
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
  }, [selectedChildUuid, selectedSessionId, selectedTermId]);

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
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      const firstTerm = terms[0];
      setSelectedTermId(firstTerm.id);
      setSelectedTermName(firstTerm.name);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedChildUuid && selectedTermId && selectedSessionId) {
      fetchResults();
    } else {
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildUuid, selectedTermId, selectedSessionId]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    setError("");

    try {
      const allChildren: Child[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await axios.get<ApiResponse>(
          `http://127.0.0.1:8000/api/parent/children?page=${page}`,
          getAuthHeaders()
        );

        let childrenData: Child[] = [];
        if (Array.isArray(response.data)) {
          childrenData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          childrenData = response.data.data;
          lastPage = response.data.last_page ?? 1;
        } else if ((response.data as any).children && Array.isArray((response.data as any).children)) {
          childrenData = (response.data as any).children;
        }
        allChildren.push(...childrenData);
        page++;
      } while (page <= lastPage);

      setChildren(allChildren);
      if (allChildren.length === 1) {
        setSelectedChildUuid(allChildren[0].uuid);
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

  const fetchResults = useCallback(async () => {
    if (!selectedChildUuid || !selectedTermId || !selectedSessionId) return;

    setLoadingResults(true);
    setError("");

    try {
      const response = await axios.get<ResultsResponse>(
        `http://127.0.0.1:8000/api/student/results?uuid=${selectedChildUuid}&session_id=${selectedSessionId}&term_id=${selectedTermId}`,
        getAuthHeaders()
      );

      console.log("Results response:", response.data);

      if (response.data.results && Array.isArray(response.data.results)) {
        setResults(response.data.results);
        setSessionName(response.data.session || "");
        setClassName(response.data.class || "");
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setResults(response.data.data);
        setSessionName(response.data.session || "");
        setClassName(response.data.class || "");
      } else if (Array.isArray(response.data)) {
        setResults(response.data);
      } else {
        setResults([]);
        setError(response.data.message || "No results found for this term.");
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(err.response?.data?.message || "Failed to load results. Please try again.");
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  }, [selectedChildUuid, selectedTermId, selectedSessionId]);

  const handleDownload = () => {
    if (!selectedChildUuid || !selectedTermId || !selectedSessionId || results.length === 0) {
      setError("Please select child, session, and term to view results.");
      return;
    }
    // Show the report view (preview)
    setShowReportView(true);
  };

  const handleBackToTable = () => {
    setShowReportView(false);
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
    const term = terms.find((t) => t.id === termId);
    setSelectedTermName(term?.name || "");
  };

  // Transform results to match ResultReportView format
  const transformedResults = results.map((result) => ({
    subject: result.subject || result.subject_name || "N/A",
    subject_code: result.subject_code || "",
    teacher_name: result.teacher_name || "N/A",
    ca1: result.ca1 || 0,
    ca2: result.ca2 || 0,
    exam_score: result.exam_score || 0,
    total: result.total || 0,
    grade: result.grade || "N/A",
    teacher_comment: result.teacher_comment || "N/A",
  }));

  // Show report view if toggled (preview)
  if (showReportView && selectedChildUuid && selectedSessionId && selectedTermId && results.length > 0) {
    return (
      <ResultReportView
        studentUuid={selectedChildUuid}
        sessionId={selectedSessionId}
        termId={selectedTermId}
        termName={selectedTermName}
        sessionName={sessionName}
        className={className}
        results={transformedResults}
        onBack={handleBackToTable}
      />
    );
  }

  const columns = [
    {
      title: "Subject",
      key: "subject",
      render: (_: any, record: Result) => {
        const subjectName = record.subject || record.subject_name || "N/A";
        const subjectCode = record.subject_code ? ` (${record.subject_code})` : "";
        return `${subjectName}${subjectCode}`;
      },
    },
    {
      title: "CA1",
      dataIndex: "ca1",
      key: "ca1",
      render: (value: number) => value ?? "-",
    },
    {
      title: "CA2",
      dataIndex: "ca2",
      key: "ca2",
      render: (value: number) => value ?? "-",
    },
    {
      title: "Exam",
      dataIndex: "exam_score",
      key: "exam_score",
      render: (value: number) => value ?? "-",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (value: number) => value ?? "-",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (value: string) => value ?? "-",
    },
    {
      title: "Comment",
      dataIndex: "teacher_comment",
      key: "teacher_comment",
      render: (value: string) => value || "-",
    },
  ];

  return (
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Academic Monitoring - Results</h1>
        
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
            <Space wrap align="end">
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
                  onChange={handleTermChange}
                  placeholder="Select Term"
                  loading={loadingTerms}
                  disabled={!selectedSessionId || loadingTerms}
                  options={terms.map((term) => ({
                    value: term.id,
                    label: term.name,
                  }))}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500, visibility: "hidden" }}>Button</label>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  disabled={!selectedTermId || !selectedSessionId || results.length === 0}
                >
                  Download Result
                </Button>
              </div>
            </Space>
          )}
        </Space>

        {loadingResults ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : results.length > 0 ? (
          <Table
            dataSource={results}
            columns={columns}
            rowKey={(record) => {
              if (record.id) {
                return `result-${record.id}`;
              }
              // Use subject_code as primary key, fallback to subject, then subject_name
              const key = record.subject_code || record.subject || record.subject_name || '';
              return `result-${key}`;
            }}
            pagination={false}
          />
        ) : selectedChildUuid && selectedTermId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            No results found for the selected child and term.
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}

