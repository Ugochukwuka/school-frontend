"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Alert, 
  Card, 
  Empty, 
  Button, 
  Select, 
  Space, 
  Typography
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import api from "@/app/lib/api";

const { Title } = Typography;

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
  email: string;
  phone?: string;
  class_name?: string;
}

interface Result {
  id: number;
  student_uuid: string;
  student_name: string;
  subject_name: string;
  subject_code?: string;
  subject_id: number;
  ca1?: number;
  ca2?: number;
  exam_score?: number;
  total?: number;
  grade?: string;
  teacher_comment?: string;
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

interface SingleResultResponse {
  status?: boolean;
  data?: Result;
  message?: string;
  student?: {
    uuid: string;
    name: string;
  };
  term_id?: number;
  results?: Array<{
    id: number;
    student_id: number;
    subject_id: number;
    term_id: number;
    teacher_id: number;
    ca1?: number;
    ca2?: number;
    exam_score?: number;
    total?: number;
    grade?: string;
    teacher_comment?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

export default function AdminSingleResultPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentUuid, setSelectedStudentUuid] = useState<string | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  
  const [error, setError] = useState("");

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchTerms(currentSession.id);
        fetchClasses(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch terms when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
    }
  }, [selectedSessionId]);

  // Fetch classes when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchClasses(selectedSessionId);
    } else {
      setClasses([]);
      setSelectedClassId(null);
      setStudents([]);
    }
  }, [selectedSessionId]);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    } else {
      setStudents([]);
      setSelectedStudentUuid(null);
      setResults([]);
    }
  }, [selectedClassId]);

  // Fetch result when student is selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && selectedStudentUuid) {
      fetchSingleResult();
    } else {
      setResults([]);
    }
  }, [selectedSessionId, selectedTermId, selectedStudentUuid]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await api.get<SessionsResponse | Session[]>(
        "/viewsessions"
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

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setSelectedClassId(null);
    setStudents([]);

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
    setSelectedStudentUuid(null);
    setResults([]);

    try {
      const response = await api.get<StudentsResponse>(
        `/admin/viewstudents?class_id=${classId}`
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

  const fetchSingleResult = async () => {
    if (!selectedStudentUuid || !selectedTermId || !selectedSessionId) {
      return;
    }

    setLoadingResult(true);
    setError("");

    const termId = Number(selectedTermId);
    const sessionId = Number(selectedSessionId);

    try {
      // The API endpoint expects term_id, subject_id, and session_id
      // Since we're viewing all results for a student, we'll fetch without subject_id filter
      // or we can make subject_id optional
      const requestBody = {
        term_id: termId,
        session_id: sessionId,
      };

      const url = `http://127.0.0.1:8000/api/results/student/${selectedStudentUuid}`;
      
      // Try POST first, then fallback to GET
      let response;
      try {
        response = await axios.post<SingleResultResponse>(
          url,
          requestBody,
          getAuthHeaders()
        );
      } catch (postError: any) {
        if (postError.response?.status === 404 || postError.response?.status === 405) {
          const getUrl = `${url}?term_id=${termId}&session_id=${sessionId}`;
          response = await axios.get<SingleResultResponse>(
            getUrl,
            getAuthHeaders()
          );
        } else {
          throw postError;
        }
      }

      // Handle the API response structure
      if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        // For admin view, we might want to show all results or just the first one
        // Let's show all results in a table format
        const resultsData = response.data.results;
        
        // Map results to display format
        const mappedResults: Result[] = resultsData.map((r: any) => ({
          id: r.id,
          student_uuid: response.data.student?.uuid || selectedStudentUuid,
          student_name: response.data.student?.name || "Unknown Student",
          subject_name: r.subject?.name || `Subject ID: ${r.subject_id}`,
          subject_code: r.subject?.code || "",
          subject_id: r.subject_id,
          ca1: r.ca1,
          ca2: r.ca2,
          exam_score: r.exam_score,
          total: r.total,
          grade: r.grade,
          teacher_comment: r.teacher_comment,
        }));
        
        // Store all results and display them in a table
        setResults(mappedResults);
      } else if (response.data.message) {
        setResults([]);
        setError(response.data.message);
      } else {
        setResults([]);
        setError("No result found for this student and term combination");
      }
    } catch (err: any) {
      console.error("Error fetching result:", err);
      setResults([]);
      if (err.response?.status === 404) {
        setError(`No result found for this student and term combination.`);
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load result. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setLoadingResult(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && selectedStudentUuid) {
      fetchSingleResult();
    } else if (selectedSessionId && selectedClassId) {
      fetchStudents(selectedClassId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClasses(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingStudents || loadingResult;

  const columns = [
    {
      title: "Subject",
      key: "subject",
      render: (_: any, record: Result) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.subject_name}</div>
          {record.subject_code && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              {record.subject_code}
            </div>
          )}
        </div>
      ),
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
      title: "Exam Score",
      dataIndex: "exam_score",
      key: "exam_score",
      render: (value: number) => value ?? "-",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (value: number) => <strong>{value ?? "-"}</strong>,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: string) => (
        <span style={{ fontWeight: 600, color: grade === "A" || grade === "B" ? "#52c41a" : grade === "C" ? "#faad14" : "#f5222d" }}>
          {grade || "-"}
        </span>
      ),
    },
    {
      title: "Comment",
      dataIndex: "teacher_comment",
      key: "teacher_comment",
      render: (comment: string) => comment || "-",
    },
  ];

  return (
    <DashboardLayout role="admin">
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
            View Single Student Result
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
              onChange={(value) => {
                setSelectedSessionId(value);
                setSelectedTermId(null);
                setSelectedClassId(null);
                setSelectedStudentUuid(null);
                setResults([]);
              }}
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
              onChange={(value) => {
                setSelectedTermId(value);
                setResults([]);
              }}
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
              placeholder={loadingClasses ? "Loading classes..." : "Select Class"}
              value={selectedClassId}
              onChange={(value) => {
                setSelectedClassId(value);
                setSelectedStudentUuid(null);
                setResults([]);
              }}
              loading={loadingClasses}
              disabled={loadingClasses || !selectedSessionId || classes.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={classes.map((cls) => ({
                value: cls.class_id,
                label: cls.class_name,
              }))}
            />
          </div>

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Student
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingStudents ? "Loading students..." : "Select Student"}
              value={selectedStudentUuid}
              onChange={(value) => {
                setSelectedStudentUuid(value);
                setResults([]);
              }}
              loading={loadingStudents}
              disabled={loadingStudents || !selectedClassId || students.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={students.map((student) => ({
                value: student.uuid,
                label: student.name,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && results.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : loadingStudents ? "Loading students..." : "Loading results..."}
            </div>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && selectedSessionId && selectedTermId && selectedStudentUuid && results.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Card 
              title={
                <span style={{ fontSize: "18px", fontWeight: 600 }}>
                  Results for {results[0]?.student_name || "Student"}
                </span>
              }
            >
              <Table
                dataSource={results}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </Card>
          </div>
        )}

        {/* No Result Message */}
        {!isLoading && selectedSessionId && selectedTermId && selectedStudentUuid && results.length === 0 && !loadingResult && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No results found for the selected student and term"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !selectedSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select session, term, class, and student to view results"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
