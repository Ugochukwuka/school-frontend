"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Result {
  id: number;
  subject_name: string;
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

export default function ChildResultsPage() {
  const params = useParams();
  const childUuid = params.uuid as string;
  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [error, setError] = useState("");
  const [termId, setTermId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch sessions on mount
  useEffect(() => {
    if (childUuid) {
      fetchSessions();
    }
  }, [childUuid]);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchTerms(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch terms when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setTermId(null);
    }
  }, [selectedSessionId]);

  // Auto-select first term when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms]);

  // Fetch results when term is selected
  useEffect(() => {
    if (childUuid && termId) {
      fetchResults();
    }
  }, [childUuid, termId]);

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

  const fetchResults = async () => {
    if (!childUuid || !termId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ResultsResponse>(
        `http://127.0.0.1:8000/api/student/results?uuid=${childUuid}&term_id=${termId}`,
        getAuthHeaders()
      );

      console.log("Results response:", response.data);

      // Handle different response structures
      if (response.data.results && Array.isArray(response.data.results)) {
        setResults(response.data.results);
        setTotal(response.data.results.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setResults(response.data.data);
        setTotal(response.data.data.length);
      } else if (Array.isArray(response.data)) {
        setResults(response.data);
        setTotal(response.data.length);
      } else {
        setResults([]);
        setError(response.data.message || "No results found for this term.");
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(
        err.response?.data?.message || "Failed to load results. Please try again."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/student/downloadresult?uuid=${childUuid}&selected_term=${termId}`,
        {
          responseType: "blob",
          ...getAuthHeaders(),
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `result_term_${termId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error("Error downloading result:", err);
      setError("Failed to download result. Please try again.");
    }
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "CA1",
      dataIndex: "ca1",
      key: "ca1",
    },
    {
      title: "CA2",
      dataIndex: "ca2",
      key: "ca2",
    },
    {
      title: "Exam",
      dataIndex: "exam_score",
      key: "exam_score",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Comment",
      dataIndex: "teacher_comment",
      key: "teacher_comment",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0 }}>Child Results</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Select
              value={selectedSessionId}
              onChange={setSelectedSessionId}
              style={{ width: 200 }}
              placeholder="Select Session"
              loading={loadingSessions}
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.name}${session.current ? " (Current)" : ""}`,
              }))}
            />
            <Select
              value={termId}
              onChange={setTermId}
              style={{ width: 200 }}
              placeholder="Select Term"
              loading={loadingTerms}
              disabled={!selectedSessionId || loadingTerms}
              options={terms.map((term) => ({
                value: term.id,
                label: term.name,
              }))}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!termId}
            >
              Download PDF
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

        <Table
          dataSource={results}
          columns={columns}
          rowKey="id"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} results`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

