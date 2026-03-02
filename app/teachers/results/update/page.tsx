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
  Typography, 
  Input,
  InputNumber,
  App
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;
const { TextArea } = Input;

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
  subject_id: number; // The actual subject_id from the API
  subject: {
    id: number;
    name: string;
    code?: string;
  };
}

interface Student {
  id: number;
  student_id: number;
  class_id: number;
  session_id: number;
  student: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone?: string;
  };
  class: {
    id: number;
    name: string;
    arm: string;
  };
}

interface StudentScore {
  uuid: string;
  student_name: string;
  ca1?: number;
  ca2?: number;
  exam_score?: number;
  teacher_comment?: string;
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
    data: Student[];
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
  data: Array<{
    student_uuid: string;
    ca1?: number;
    ca2?: number;
    exam_score?: number;
    teacher_comment?: string;
  }>;
}

export default function UpdateResultsPage() {
  const { message } = App.useApp();
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  
  const [scores, setScores] = useState<Record<string, StudentScore>>({});
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingExistingResults, setLoadingExistingResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
      setStudents([]);
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

  // Fetch students when session, term, and class are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && selectedClassId) {
      fetchStudents(selectedSessionId, selectedClassId);
    } else {
      setStudents([]);
      setScores({});
    }
  }, [selectedSessionId, selectedTermId, selectedClassId]);

  // Load existing results when all filters are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && selectedClassId && selectedSubjectId && students.length > 0) {
      loadExistingResults();
    }
  }, [selectedSessionId, selectedTermId, selectedClassId, selectedSubjectId, students]);

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
    setStudents([]);

    try {
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}`,
        getAuthHeaders()
      );

      let studentsData: Student[] = [];
      
      if (response.data.status && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          studentsData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }

      if (studentsData.length > 0) {
        const classMap = new Map<number, Class>();
        
        studentsData.forEach((student: Student) => {
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
        
        if (uniqueClasses.length > 0) {
          setSelectedClassId(uniqueClasses[0].id);
        }
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
      const response = await axios.get(
        `http://127.0.0.1:8000/api/teacher/subjects?session_id=${sessionId}`,
        getAuthHeaders()
      );

      let subjectsData: Subject[] = [];
      
      // Handle paginated response structure
      if (response.data?.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data.map((item: any) => ({
          id: item.subject_id, // Use subject_id as the id for the dropdown
          name: item.subject?.name || "",
          code: item.subject?.code || "",
          subject_id: item.subject_id,
          subject: item.subject,
        }));
      } else if (Array.isArray(response.data)) {
        subjectsData = response.data.map((item: any) => ({
          id: item.subject_id || item.id,
          name: item.subject?.name || item.name || "",
          code: item.subject?.code || item.code || "",
          subject_id: item.subject_id || item.id,
          subject: item.subject || item,
        }));
      }

      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchStudents = async (sessionId: number, classId: number) => {
    setLoadingStudents(true);
    setError("");

    try {
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}&class_id=${classId}`,
        getAuthHeaders()
      );

      let studentsData: Student[] = [];
      
      if (response.data.status && response.data.data && Array.isArray(response.data.data.data)) {
        studentsData = response.data.data.data.filter(
          (student: Student) => student.class.id === classId
        );
      } else if (response.data.status && response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data.filter(
          (student: Student) => student.class.id === classId
        );
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

  const loadExistingResults = async () => {
    if (!selectedTermId || !selectedSubjectId || students.length === 0) return;

    setLoadingExistingResults(true);
    setError("");

    try {
      const payload = {
        term_id: selectedTermId,
        subject_id: selectedSubjectId,
      };

      const response = await axios.post<ResultsResponse>(
        "http://127.0.0.1:8000/api/results/view",
        payload,
        getAuthHeaders()
      );

      let resultsData: any[] = [];
      if (Array.isArray(response.data)) {
        resultsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        resultsData = response.data.data;
      }

      // Initialize scores with existing results
      const initialScores: Record<string, StudentScore> = {};
      students.forEach((student) => {
        const existingResult = resultsData.find(
          (r: any) => r.student_uuid === student.student.uuid
        );
        
        initialScores[student.student.uuid] = {
          uuid: student.student.uuid,
          student_name: student.student.name,
          ca1: existingResult?.ca1,
          ca2: existingResult?.ca2,
          exam_score: existingResult?.exam_score,
          teacher_comment: existingResult?.teacher_comment || "",
        };
      });

      setScores(initialScores);
    } catch (err: any) {
      console.error("Error loading existing results:", err);
      // Don't show error if no results exist yet, just initialize empty scores
      const initialScores: Record<string, StudentScore> = {};
      students.forEach((student) => {
        initialScores[student.student.uuid] = {
          uuid: student.student.uuid,
          student_name: student.student.name,
          ca1: undefined,
          ca2: undefined,
          exam_score: undefined,
          teacher_comment: "",
        };
      });
      setScores(initialScores);
    } finally {
      setLoadingExistingResults(false);
    }
  };

  const handleScoreChange = (studentUuid: string, field: keyof StudentScore, value: any) => {
    setScores((prev) => ({
      ...prev,
      [studentUuid]: {
        ...prev[studentUuid],
        [field]: value,
      },
    }));
  };

  const handleUpdateScores = async () => {
    if (!selectedSessionId || !selectedTermId || !selectedClassId || !selectedSubjectId) {
      message.error("Please select session, term, class, and subject");
      return;
    }

    if (students.length === 0) {
      message.error("No students to update scores for");
      return;
    }

    const studentUuids = students.map((s) => s.student.uuid);
    const results = Object.values(scores)
      .filter((score) => studentUuids.includes(score.uuid))
      .map((score) => ({
        uuid: score.uuid,
        ca1: score.ca1,
        ca2: score.ca2,
        exam_score: score.exam_score,
        teacher_comment: score.teacher_comment || "",
      }));

    // Validate that at least some scores are entered
    const hasScores = results.some((r) => r.ca1 !== undefined || r.ca2 !== undefined || r.exam_score !== undefined);
    if (!hasScores) {
      message.error("Please enter at least one score for at least one student");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        student_uuids: studentUuids,
        term_id: selectedTermId,
        results: results,
      };

      console.log("📤 Updating scores:", payload);

      const response = await axios.put(
        "http://127.0.0.1:8000/api/results/update",
        payload,
        getAuthHeaders()
      );

      console.log("✅ Update response:", response.data);

      if (response.data.status) {
        message.success(response.data.message || "Scores updated successfully");
        // Reload existing results to reflect updates
        loadExistingResults();
      } else {
        throw new Error(response.data.message || "Failed to update scores");
      }
    } catch (err: any) {
      console.error("❌ Error updating scores:", err);
      let errorMessage = "Failed to update scores. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && selectedClassId && selectedSubjectId) {
      loadExistingResults();
    } else if (selectedSessionId && selectedTermId && selectedClassId) {
      fetchStudents(selectedSessionId, selectedClassId);
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
      dataIndex: ["student", "name"],
      key: "name",
      fixed: "left" as const,
      width: 150,
    },
    {
      title: "CA1",
      key: "ca1",
      width: 100,
      render: (_: any, record: Student) => (
        <InputNumber
          min={0}
          max={20}
          value={scores[record.student.uuid]?.ca1}
          onChange={(value) => handleScoreChange(record.student.uuid, "ca1", value)}
          placeholder="0-20"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "CA2",
      key: "ca2",
      width: 100,
      render: (_: any, record: Student) => (
        <InputNumber
          min={0}
          max={20}
          value={scores[record.student.uuid]?.ca2}
          onChange={(value) => handleScoreChange(record.student.uuid, "ca2", value)}
          placeholder="0-20"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Exam Score",
      key: "exam_score",
      width: 120,
      render: (_: any, record: Student) => (
        <InputNumber
          min={0}
          max={60}
          value={scores[record.student.uuid]?.exam_score}
          onChange={(value) => handleScoreChange(record.student.uuid, "exam_score", value)}
          placeholder="0-60"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Comment",
      key: "teacher_comment",
      width: 200,
      render: (_: any, record: Student) => (
        <TextArea
          value={scores[record.student.uuid]?.teacher_comment || ""}
          onChange={(e) => handleScoreChange(record.student.uuid, "teacher_comment", e.target.value)}
          placeholder="Teacher comment"
          rows={2}
          autoSize={{ minRows: 1, maxRows: 3 }}
        />
      ),
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingSubjects || loadingStudents || loadingExistingResults;

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
            Update Results
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            {selectedSessionId && selectedTermId && selectedClassId && selectedSubjectId && students.length > 0 && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateScores}
                loading={submitting}
              >
                Update Scores
              </Button>
            )}
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
              onChange={(value) => {
                setSelectedSessionId(value);
                setSelectedTermId(null);
                setSelectedClassId(null);
                setSelectedSubjectId(null);
                setStudents([]);
                setScores({});
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
              Class
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingClasses ? "Loading classes..." : "Select Class"}
              value={selectedClassId}
              onChange={(value) => {
                setSelectedClassId(value);
                setStudents([]);
                setScores({});
              }}
              loading={loadingClasses}
              disabled={loadingClasses || !selectedSessionId || classes.length === 0}
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
              Subject
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingSubjects ? "Loading subjects..." : "Select Subject"}
              value={selectedSubjectId}
              onChange={(value) => {
                setSelectedSubjectId(value);
                setScores({});
              }}
              loading={loadingSubjects}
              disabled={loadingSubjects || !selectedSessionId || subjects.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={subjects.map((subject) => ({
                value: subject.subject_id, // Use subject_id as the value
                label: `${subject.subject?.name || subject.name}${subject.subject?.code || subject.code ? ` (${subject.subject?.code || subject.code})` : ""}`,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !students.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : loadingSubjects ? "Loading subjects..." : loadingStudents ? "Loading students..." : "Loading existing results..."}
            </div>
          </div>
        )}

        {/* Students Table */}
        {!isLoading && selectedSessionId && selectedTermId && selectedClassId && selectedSubjectId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={students}
              columns={columns}
              rowKey={(record) => record.student.uuid}
              scroll={{ x: "max-content" }}
              loading={loadingStudents || loadingExistingResults}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedClassId 
                        ? "Please select a class to view students"
                        : "No students found for this class"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                students.length > 0
                  ? {
                      pageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "student" : "students"}`,
                      responsive: true,
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
              description="Please select a session to view terms, classes, and subjects"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

