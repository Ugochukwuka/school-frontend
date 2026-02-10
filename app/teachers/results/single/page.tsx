"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

interface Result {
  id: number;
  student_uuid: string;
  student_name: string;
  subject_name: string;
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

export default function ViewSingleResultPage() {
  const { isMobile } = useResponsive();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  
  // Get initial values from URL params
  const urlStudentUuid = searchParams.get("student_uuid");
  const urlTermId = searchParams.get("term_id");
  const urlSubjectId = searchParams.get("subject_id");
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(urlTermId ? parseInt(urlTermId) : null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(urlSubjectId ? parseInt(urlSubjectId) : null);
  const [selectedStudentUuid, setSelectedStudentUuid] = useState<string | null>(urlStudentUuid);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
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
      setSelectedStudentUuid(null);
      setResult(null);
    }
  }, [selectedSessionId, selectedTermId, selectedClassId]);

  // Fetch result when all filters are selected
  useEffect(() => {
    console.log("📊 useEffect triggered - Current selections:", {
      selectedSessionId,
      selectedTermId,
      selectedSubjectId,
      selectedStudentUuid,
      allSelected: !!(selectedSessionId && selectedTermId && selectedSubjectId && selectedStudentUuid),
    });
    
    if (selectedSessionId && selectedTermId && selectedSubjectId && selectedStudentUuid) {
      console.log("✅ All required fields selected, fetching result...");
      fetchSingleResult();
    } else {
      console.log("❌ Missing required fields, clearing result");
      setResult(null);
    }
  }, [selectedSessionId, selectedTermId, selectedSubjectId, selectedStudentUuid]);

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
          // Only auto-select first term if no term was provided via URL
          const urlTermId = searchParams.get("term_id");
          if (urlTermId) {
            const termId = parseInt(urlTermId);
            const termExists = response.data.terms.some(t => t.id === termId);
            if (termExists) {
              setSelectedTermId(termId);
            } else {
              setSelectedTermId(response.data.terms[0].id);
            }
          } else {
            setSelectedTermId(response.data.terms[0].id);
          }
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
      console.log("📚 Fetching subjects for session_id:", sessionId);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/teacher/subjects?session_id=${sessionId}`,
        getAuthHeaders()
      );

      console.log("📚 Subjects API response:", response.data);

      let subjectsData: Subject[] = [];
      
      // Handle paginated response structure (same logic as enter page)
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

      console.log("📚 Processed subjects:", subjectsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        // Only auto-select first subject if no subject was provided via URL
        const urlSubjectId = searchParams.get("subject_id");
        if (urlSubjectId) {
          const subjectId = parseInt(urlSubjectId);
          const subjectExists = subjectsData.some(s => s.subject_id === subjectId);
          if (subjectExists) {
            console.log("📚 Auto-selecting subject from URL:", subjectId);
            setSelectedSubjectId(subjectId);
          } else {
            console.log("📚 URL subject not found, selecting first:", subjectsData[0].subject_id);
            setSelectedSubjectId(subjectsData[0].subject_id);
          }
        } else {
          console.log("📚 Auto-selecting first subject:", subjectsData[0].subject_id);
          setSelectedSubjectId(subjectsData[0].subject_id);
        }
      }
    } catch (err: any) {
      console.error("❌ Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchStudents = async (sessionId: number, classId: number) => {
    setLoadingStudents(true);
    setError("");
    // Don't reset selectedStudentUuid if it was provided via URL
    if (!urlStudentUuid) {
      setSelectedStudentUuid(null);
    }
    setResult(null);

    try {
      console.log("👥 Fetching students for session_id:", sessionId, "class_id:", classId);
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}&class_id=${classId}`,
        getAuthHeaders()
      );

      console.log("👥 Students API response:", response.data);

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

      console.log("👥 Processed students:", studentsData.map(s => ({
        name: s.student.name,
        uuid: s.student.uuid,
        class_id: s.class.id
      })));
      setStudents(studentsData);
    } catch (err: any) {
      console.error("❌ Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSingleResult = async () => {
    if (!selectedStudentUuid || !selectedTermId || !selectedSubjectId || !selectedSessionId) {
      console.log("Missing required parameters:", {
        student_uuid: selectedStudentUuid,
        term_id: selectedTermId,
        subject_id: selectedSubjectId,
        session_id: selectedSessionId,
      });
      return;
    }

    setLoadingResult(true);
    setError("");

    // Ensure all IDs are numbers
    const termId = Number(selectedTermId);
    const subjectId = Number(selectedSubjectId);
    const sessionId = Number(selectedSessionId);

    console.log("Fetching result for:", {
      student_uuid: selectedStudentUuid,
      term_id: termId,
      subject_id: subjectId,
      session_id: sessionId,
    });

    try {
      // Prepare request body as shown in Postman
      const requestBody = {
        term_id: termId,
        subject_id: subjectId,
        session_id: sessionId,
      };

      const url = `http://127.0.0.1:8000/api/results/student/${selectedStudentUuid}`;
      console.log("Request URL:", url);
      console.log("Request body:", requestBody);
      
      // Try POST first (as shown in Postman with body), then fallback to GET
      let response;
      try {
        response = await axios.post<SingleResultResponse>(
          url,
          requestBody,
          getAuthHeaders()
        );
        console.log("POST request successful");
      } catch (postError: any) {
        // If POST fails with 404 or 405, try GET with query parameters
        if (postError.response?.status === 404 || postError.response?.status === 405) {
          console.log("POST failed, trying GET with query parameters...");
          const getUrl = `${url}?term_id=${termId}&subject_id=${subjectId}&session_id=${sessionId}`;
          response = await axios.get<SingleResultResponse>(
            getUrl,
            getAuthHeaders()
          );
          console.log("GET request successful");
        } else {
          throw postError;
        }
      }

      console.log("Result response:", response.data);
      console.log("Response structure:", {
        hasStudent: !!response.data.student,
        hasResults: !!response.data.results,
        resultsLength: response.data.results?.length || 0,
        keys: Object.keys(response.data || {}),
      });

      // Handle the API response structure: { student: {...}, term_id: 1, results: [...] }
      if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        // Find the result that matches the selected subject_id, or use the first one
        const resultData = response.data.results.find(r => r.subject_id === subjectId) || response.data.results[0];
        
        // Get subject name from the subjects list
        const selectedSubject = subjects.find(s => s.subject_id === subjectId || s.subject_id === resultData.subject_id);
        const subjectName = selectedSubject?.subject?.name || selectedSubject?.name || `Subject ID: ${resultData.subject_id}`;
        
        // Map the API response to the Result interface
        const mappedResult: Result = {
          id: resultData.id,
          student_uuid: response.data.student?.uuid || selectedStudentUuid,
          student_name: response.data.student?.name || "Unknown Student",
          subject_name: subjectName,
          subject_id: resultData.subject_id,
          ca1: resultData.ca1,
          ca2: resultData.ca2,
          exam_score: resultData.exam_score,
          total: resultData.total,
          grade: resultData.grade,
          teacher_comment: resultData.teacher_comment,
        };
        
        console.log("Mapped result:", mappedResult);
        setResult(mappedResult);
      } else if (response.data.message) {
        setResult(null);
        setError(response.data.message);
      } else {
        setResult(null);
        setError("No result found for this student, subject, and term combination");
      }
    } catch (err: any) {
      console.error("Error fetching result:", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        url: err.config?.url,
        method: err.config?.method,
      });
      setResult(null);
      if (err.response?.status === 404) {
        setError(`No result found for this student, subject, and term combination. Please verify the student UUID (${selectedStudentUuid}), term ID (${termId}), subject ID (${subjectId}), and session ID (${sessionId}) are correct.`);
      } else if (err.response?.status === 405) {
        setError("Method not allowed. The API endpoint may require a different HTTP method.");
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load result. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setLoadingResult(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && selectedSubjectId && selectedStudentUuid) {
      fetchSingleResult();
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

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingSubjects || loadingStudents || loadingResult;

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
            View Single Result
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
                console.log("🔵 Session selected:", value, "Type:", typeof value);
                setSelectedSessionId(value);
                setSelectedTermId(null);
                setSelectedClassId(null);
                setSelectedSubjectId(null);
                setSelectedStudentUuid(null);
                setResult(null);
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
                console.log("🟢 Term selected:", value, "Type:", typeof value);
                setSelectedTermId(value);
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
                console.log("🟡 Class selected:", value, "Type:", typeof value);
                setSelectedClassId(value);
                setSelectedStudentUuid(null);
                setResult(null);
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
                console.log("🟠 Subject selected:", value, "Type:", typeof value);
                setSelectedSubjectId(value);
                setResult(null);
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

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Student
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingStudents ? "Loading students..." : "Select Student"}
              value={selectedStudentUuid}
              onChange={(value) => {
                console.log("🔴 Student UUID selected:", value, "Type:", typeof value);
                setSelectedStudentUuid(value);
                setResult(null);
              }}
              loading={loadingStudents}
              disabled={loadingStudents || !selectedClassId || students.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={students.map((student) => ({
                value: student.student.uuid,
                label: student.student.name,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !result && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : loadingSubjects ? "Loading subjects..." : loadingStudents ? "Loading students..." : "Loading result..."}
            </div>
          </div>
        )}

        {/* Result Display */}
        {!isLoading && result && (
          <Card 
            title={<span style={{ fontSize: "18px", fontWeight: 600 }}>Result Details</span>} 
            style={{ marginTop: "24px" }}
          >
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
              gap: "24px",
              padding: "16px 0"
            }}>
              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Student Name
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.student_name}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Subject
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.subject_name}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  CA1
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.ca1 ?? "-"}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  CA2
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.ca2 ?? "-"}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Exam Score
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.exam_score ?? "-"}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Total
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.total ?? "-"}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Grade
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.grade ?? "-"}
                </div>
              </div>

              <div style={{ gridColumn: isMobile ? "1" : "span 2" }}>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  marginBottom: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Teacher Comment
                </div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: 500 }}>
                  {result.teacher_comment || "-"}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* No Result Message */}
        {!isLoading && selectedSessionId && selectedTermId && selectedSubjectId && selectedStudentUuid && !result && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No result found for the selected student, subject, and term"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !selectedSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select session, term, class, subject, and student to view result"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

