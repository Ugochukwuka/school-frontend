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
  id: number;
  name: string;
  arm: string;
  displayName: string;
}

interface Subject {
  id: number;
  name: string;
  code?: string;
}

interface Result {
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
  student?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
    code?: string;
  };
  // Legacy fields for backward compatibility
  student_uuid?: string;
  student_name?: string;
  subject_name?: string;
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

interface TeacherClassesResponse {
  status: boolean;
  data: {
    current_page: number;
    data: any[];
    total: number;
    last_page: number;
  };
}

interface SubjectsResponse {
  data: Subject[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

interface ResultsResponse {
  data: Result[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ViewResultsPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
        fetchSubjects(currentSession.id);
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
    }
  }, [selectedSessionId]);

  // Fetch subjects when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchSubjects(selectedSessionId);
    } else {
      setSubjects([]);
      setSelectedSubjectId(null);
    }
  }, [selectedSessionId]);

  // Fetch results when term is selected
  useEffect(() => {
    if (selectedTermId && selectedSessionId) {
      fetchResults(selectedSessionId, selectedTermId);
    } else {
      setResults([]);
    }
  }, [selectedTermId, selectedSubjectId, selectedSessionId]);

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

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setSelectedClassId(null);

    try {
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}`,
        getAuthHeaders()
      );

      let studentsData: any[] = [];
      
      if (response.data.status && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          studentsData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }

      if (studentsData.length > 0) {
        const classMap = new Map<number, Class>();
        
        studentsData.forEach((student: any) => {
          if (student.class && student.class.id) {
            const classId = student.class.id;
            if (!classMap.has(classId)) {
              classMap.set(classId, {
                id: classId,
                name: student.class.name,
                arm: student.class.arm || "",
                displayName: `${student.class.name}${student.class.arm || ""}`,
              });
            }
          }
        });

        const uniqueClasses = Array.from(classMap.values());
        setClasses(uniqueClasses);
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

  const fetchSubjects = async (sessionId: number) => {
    setLoadingSubjects(true);
    setError("");
    setSubjects([]);
    setSelectedSubjectId(null);

    try {
      const response = await axios.get<SubjectsResponse>(
        `http://127.0.0.1:8000/api/teacher/subjects?session_id=${sessionId}`,
        getAuthHeaders()
      );

      let subjectsData: Subject[] = [];
      if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data;
      }

      setSubjects(subjectsData);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchResults = async (sessionId?: number, termId?: number) => {
    const currentSessionId = sessionId ?? selectedSessionId;
    const currentTermId = termId ?? selectedTermId;

    if (!currentTermId || !currentSessionId) {
      return;
    }

    setLoadingResults(true);
    setError("");

    try {
      // API requires session_id and term_id, subject_id and class_id are optional
      const payload: any = {
        session_id: Number(currentSessionId),
        term_id: Number(currentTermId),
      };

      if (selectedSubjectId) {
        payload.subject_id = Number(selectedSubjectId);
      }

      if (selectedClassId) {
        payload.class_id = Number(selectedClassId);
      }

      const response = await axios.post<ResultsResponse>(
        "http://127.0.0.1:8000/api/results/view",
        payload,
        getAuthHeaders()
      );

      let resultsData: Result[] = [];
      if (Array.isArray(response.data)) {
        resultsData = response.data;
        setTotal(response.data.length);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        resultsData = response.data.data;
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        resultsData = [];
      }

      // Filter by class if selected
      if (selectedClassId && classes.length > 0) {
        // Note: This assumes results have class information or we need to filter differently
        // You may need to adjust this based on your API response structure
      }

      setResults(resultsData);
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(err.response?.data?.message || "Failed to load results. Please try again.");
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRefresh = () => {
    if (selectedTermId && selectedSessionId) {
      fetchResults(selectedSessionId, selectedTermId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClasses(selectedSessionId);
      fetchSubjects(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const columns = [
    {
      title: "Student Name",
      key: "student_name",
      render: (_: any, record: Result) => {
        // Support both nested and flat structure
        if (record.student?.name) {
          return record.student.name;
        }
        return record.student_name || "-";
      },
      sorter: (a: Result, b: Result) => {
        const nameA = a.student?.name || a.student_name || "";
        const nameB = b.student?.name || b.student_name || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Subject Code",
      key: "subject_code",
      render: (_: any, record: Result) => {
        // Display subject code (e.g., MATH101) if available, otherwise fallback to name
        if (record.subject?.code) {
          return record.subject.code;
        }
        if (record.subject?.name) {
          return record.subject.name;
        }
        return record.subject_name || "-";
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
      render: (value: string) => value ?? "-",
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingSubjects || loadingResults;

  return (
    <DashboardLayout role="teacher">
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
            View Student Results
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
                setSelectedSubjectId(null);
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
              onChange={setSelectedTermId}
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
              Class (Optional)
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingClasses ? "Loading classes..." : "Select Class (Optional)"}
              value={selectedClassId}
              onChange={setSelectedClassId}
              loading={loadingClasses}
              disabled={loadingClasses || !selectedSessionId || classes.length === 0}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={classes.map((cls) => ({
                value: cls.id,
                label: cls.displayName,
              }))}
            />
          </div>

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Subject (Optional)
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingSubjects ? "Loading subjects..." : "Select Subject (Optional)"}
              value={selectedSubjectId}
              onChange={setSelectedSubjectId}
              loading={loadingSubjects}
              disabled={loadingSubjects || !selectedSessionId || subjects.length === 0}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={subjects.map((subject) => ({
                value: subject.id,
                label: `${subject.name}${subject.code ? ` (${subject.code})` : ""}`,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !results.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : loadingSubjects ? "Loading subjects..." : "Loading results..."}
            </div>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && selectedTermId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={results}
              columns={columns}
              rowKey="id"
              scroll={{ x: "max-content" }}
              loading={loadingResults}
              locale={{
                emptyText: (
                  <Empty
                    description="No results found for the selected term"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                totalPages > 1
                  ? {
                      current: currentPage,
                      total: total,
                      pageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} results`,
                      responsive: true,
                    }
                  : results.length > 0
              }
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !selectedSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select a session and term to view results"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && !selectedTermId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select a term to view results"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

