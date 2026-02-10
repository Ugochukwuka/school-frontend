"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Alert, 
  Card, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Input,
  InputNumber,
  message
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
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
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
}

interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface Teacher {
  id: number;
  uuid: string;
  name: string;
  email: string;
}

interface StudentScore {
  student_uuid: string;
  student_name: string;
  teacher_id: number;
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

interface StudentsResponse {
  current_page: number;
  data: Student[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface SubjectsResponse {
  status: string;
  class_id: string;
  subjects: Subject[];
}

interface TeachersResponse {
  data: Teacher[];
  [key: string]: any;
}

export default function AdminEnterResultsPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  
  const [scores, setScores] = useState<Record<string, StudentScore>>({});
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState("");

  useEffect(() => {
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
      fetchClasses(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
      setClasses([]);
      setSelectedClassId(null);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects(selectedClassId);
    } else {
      setSubjects([]);
      setSelectedSubjectId(null);
      setSelectedTeacherId(null);
      setSelectedTeacherName("");
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSubjectId && subjects.length > 0) {
      const selectedSubject = subjects.find(
        (s) => s.subject_id === selectedSubjectId
      );
      if (selectedSubject && selectedSubject.teacher_id) {
        setSelectedTeacherId(selectedSubject.teacher_id);
        setSelectedTeacherName(
          selectedSubject.teacher_name || `Teacher ID: ${selectedSubject.teacher_id}`
        );
      } else {
        setSelectedTeacherId(null);
        setSelectedTeacherName("");
        setError("No teacher assigned to this subject");
      }
    } else {
      setSelectedTeacherId(null);
      setSelectedTeacherName("");
    }
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      fetchStudents(selectedClassId);
    } else {
      setStudents([]);
      setScores({});
    }
  }, [selectedClassId, selectedTermId]);

  useEffect(() => {
    // Update teacher_id in all scores when selectedTeacherId changes
    if (selectedTeacherId) {
      setScores((prev) => {
        const updated: Record<string, StudentScore> = {};
        Object.keys(prev).forEach((uuid) => {
          updated[uuid] = {
            ...prev[uuid],
            teacher_id: selectedTeacherId,
          };
        });
        return updated;
      });
    }
  }, [selectedTeacherId]);

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
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await axios.get<TeachersResponse>(
        `http://127.0.0.1:8000/api/admin/teachers`,
        getAuthHeaders()
      );

      let teachersData: Teacher[] = [];
      if (Array.isArray(response.data)) {
        teachersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        teachersData = response.data.data;
      }

      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoadingTeachers(false);
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
      const response = await axios.get<{
        status: string;
        session_id: string;
        classes: Array<{
          class_id: number;
          class_name: string;
        }>;
        message?: string;
      }>(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/classes`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.classes)) {
        const classesData = response.data.classes.map((cls) => ({
          id: cls.class_id,
          name: cls.class_name,
          arm: "",
          displayName: cls.class_name,
        }));
        setClasses(classesData);
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

  const fetchSubjects = async (classId: number) => {
    setLoadingSubjects(true);
    setError("");
    setSubjects([]);
    setSelectedSubjectId(null);
    setSelectedTeacherId(null);
    setSelectedTeacherName("");

    try {
      const response = await axios.get<SubjectsResponse>(
        `http://127.0.0.1:8000/api/classes/${classId}/subjects`,
        getAuthHeaders()
      );

      let subjectsData: Subject[] = [];
      if (response.data.status === "success" && Array.isArray(response.data.subjects)) {
        subjectsData = response.data.subjects;
      } else if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
        subjectsData = response.data.subjects;
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

  const fetchStudents = async (classId: number) => {
    setLoadingStudents(true);
    setError("");
    setStudents([]);
    setScores({});

    try {
      const response = await axios.get<StudentsResponse>(
        `http://127.0.0.1:8000/api/admin/viewstudents?class_id=${classId}`,
        getAuthHeaders()
      );

      let studentsData: Student[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      }

      setStudents(studentsData);
      
      // Initialize scores for each student
      const initialScores: Record<string, StudentScore> = {};
      studentsData.forEach((student) => {
        initialScores[student.uuid] = {
          student_uuid: student.uuid,
          student_name: student.name,
          teacher_id: selectedTeacherId || 0,
        };
      });
      setScores(initialScores);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleScoreChange = (studentUuid: string, field: keyof StudentScore, value: any) => {
    setScores((prev) => ({
      ...prev,
      [studentUuid]: {
        ...prev[studentUuid],
        [field]: value,
        teacher_id: selectedTeacherId || prev[studentUuid]?.teacher_id || 0,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId || !selectedTermId || !selectedTeacherId) {
      setError("Please select subject, term, and ensure teacher is assigned");
      return;
    }

    const results = Object.values(scores)
      .filter((score) => score.ca1 !== undefined || score.ca2 !== undefined || score.exam_score !== undefined)
      .map((score) => {
        const result: any = {
          student_uuid: String(score.student_uuid),
          teacher_id: Number(selectedTeacherId),
        };
        
        // Only include fields that have values
        if (score.ca1 !== undefined && score.ca1 !== null) {
          result.ca1 = Number(score.ca1);
        }
        if (score.ca2 !== undefined && score.ca2 !== null) {
          result.ca2 = Number(score.ca2);
        }
        if (score.exam_score !== undefined && score.exam_score !== null) {
          result.exam_score = Number(score.exam_score);
        }
        if (score.teacher_comment && score.teacher_comment.trim()) {
          result.teacher_comment = String(score.teacher_comment.trim());
        }
        
        return result;
      });

    if (results.length === 0) {
      setError("Please enter at least one score");
      return;
    }

    // Validate that each result has at least one score
    const validResults = results.filter((result) => 
      result.ca1 !== undefined || result.ca2 !== undefined || result.exam_score !== undefined
    );

    if (validResults.length === 0) {
      setError("Please enter at least one score for at least one student");
      return;
    }

    const payload = {
      subject_id: Number(selectedSubjectId),
      term_id: Number(selectedTermId),
      results: validResults,
    };

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));
    console.log("Payload details:", {
      subject_id: payload.subject_id,
      term_id: payload.term_id,
      results_count: payload.results.length,
      results: payload.results
    });

    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/results/enter`,
        payload,
        getAuthHeaders()
      );

      // Check if response indicates no results were entered
      if (response.data?.message === "No results were entered" || response.data?.skipped) {
        const skipped = response.data.skipped || [];
        let errorDetails = response.data.message || "No results were entered";
        
        if (skipped.length > 0) {
          // Map UUIDs to student names
          const skippedReasons = skipped.map((item: any) => {
            const student = students.find((s) => s.uuid === item.student_uuid);
            const studentName = student ? student.name : item.student_uuid;
            return `${studentName}: ${item.reason}`;
          }).join("\n");
          errorDetails = `${errorDetails}\n\nSkipped:\n${skippedReasons}`;
        }
        
        setError(errorDetails);
        message.warning(response.data.message || "No results were entered");
        
        // Redirect to admin dashboard after 12 seconds (10 more seconds) so admin can see skipped students
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 12000);
      } else {
        message.success("Results entered successfully! Redirecting to admin dashboard...");
        
        // Redirect to admin dashboard after 1.5 seconds
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error entering results:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);
      console.error("Request payload that failed:", err.config?.data);
      
      // Handle validation errors
      let errorMessage = "Failed to enter results. Please try again.";
      if (err.response?.data) {
        console.error("Full error response data:", JSON.stringify(err.response.data, null, 2));
        // Check for "No results were entered" response
        if (err.response.data.message === "No results were entered" || err.response.data.skipped) {
          const skipped = err.response.data.skipped || [];
          errorMessage = err.response.data.message || "No results were entered";
          
          if (skipped.length > 0) {
            // Map UUIDs to student names
            const skippedDetails = skipped.map((item: any) => {
              const student = students.find((s) => s.uuid === item.student_uuid);
              const studentName = student ? student.name : item.student_uuid;
              return `${studentName}: ${item.reason}`;
            }).join("\n");
            errorMessage = `${errorMessage}\n\nSkipped:\n${skippedDetails}`;
          }
          
          // Redirect to admin dashboard after 12 seconds (10 more seconds) so admin can see skipped students
          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 12000);
        } else if (err.response.data.errors) {
          // Laravel validation errors
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (Object.keys(err.response.data).length > 0) {
          // Try to extract any error message from the response
          const errorKeys = Object.keys(err.response.data);
          errorMessage = `Validation error: ${errorKeys.join(", ")}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
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
          max={30}
          value={scores[record.uuid]?.ca1}
          onChange={(value) => handleScoreChange(record.uuid, "ca1", value || undefined)}
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
          max={30}
          value={scores[record.uuid]?.ca2}
          onChange={(value) => handleScoreChange(record.uuid, "ca2", value || undefined)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Exam",
      key: "exam_score",
      width: 100,
      render: (_: any, record: Student) => (
        <InputNumber
          min={0}
          max={70}
          value={scores[record.uuid]?.exam_score}
          onChange={(value) => handleScoreChange(record.uuid, "exam_score", value || undefined)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Comment",
      key: "comment",
      width: 200,
      render: (_: any, record: Student) => (
        <TextArea
          rows={2}
          value={scores[record.uuid]?.teacher_comment}
          onChange={(e) => handleScoreChange(record.uuid, "teacher_comment", e.target.value)}
          placeholder="Teacher comment"
        />
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card>
        <Title level={2} style={{ marginBottom: 24, fontSize: isMobile ? "20px" : "24px" }}>
          Enter Results (on behalf of teacher)
        </Title>
        
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
          <Space wrap>
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
                onChange={setSelectedTermId}
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
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Class</label>
              <Select
                style={{ width: 200 }}
                value={selectedClassId}
                onChange={setSelectedClassId}
                placeholder="Select Class"
                loading={loadingClasses}
                disabled={!selectedSessionId || loadingClasses}
                options={classes.map((cls) => ({
                  value: cls.id,
                  label: cls.displayName,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Subject</label>
              <Select
                style={{ width: 200 }}
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                placeholder="Select Subject"
                loading={loadingSubjects}
                disabled={!selectedClassId || loadingSubjects}
                options={subjects.map((subject) => ({
                  value: subject.subject_id,
                  label: `${subject.subject_name}${subject.subject_code ? ` (${subject.subject_code})` : ""}`,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Teacher</label>
              <Select
                style={{ width: 200 }}
                value={selectedTeacherId}
                placeholder="Teacher (auto-selected)"
                disabled={true}
                loading={loadingSubjects}
                options={selectedTeacherId ? [{
                  value: selectedTeacherId,
                  label: selectedTeacherName,
                }] : []}
              />
            </div>
          </Space>
        </Space>

        {loadingStudents ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : students.length > 0 && selectedSubjectId && selectedTermId && selectedTeacherId ? (
          <>
            <Table
              dataSource={students}
              columns={columns}
              rowKey={(record) => record.uuid}
              scroll={{ x: isMobile ? 800 : undefined }}
              pagination={false}
              style={{ marginBottom: 24 }}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              size="large"
            >
              Save Results
            </Button>
          </>
        ) : selectedClassId && selectedSessionId && selectedTermId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            {!selectedSubjectId ? "Please select a subject" : !selectedTeacherId ? "No teacher assigned to selected subject" : "No students found for this class."}
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}

