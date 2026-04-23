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
  App
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

interface StudentScore {
  student_uuid: string;
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

interface ResultsResponse {
  data: Array<{
    student_uuid: string;
    ca1?: number;
    ca2?: number;
    exam_score?: number;
    teacher_comment?: string;
  }>;
}

interface UpdateResponse {
  message: string;
  updated: number;
  skipped: any[];
}

export default function AdminUpdateResultsPage() {
  const { message } = App.useApp();
  const router = useRouter();
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

  useEffect(() => {
    fetchSessions();
  }, []);

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
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      fetchStudents(selectedClassId);
    } else {
      setStudents([]);
      setScores({});
    }
  }, [selectedClassId, selectedTermId]);

  useEffect(() => {
    if (selectedClassId && selectedTermId && selectedSubjectId && students.length > 0) {
      loadExistingResults();
    }
  }, [selectedClassId, selectedTermId, selectedSubjectId, students]);

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

    try {
      const response = await axios.get<{
        status: string;
        class_id: string;
        subjects: Subject[];
      }>(
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
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadExistingResults = async () => {
    if (!selectedTermId || !selectedSubjectId || !selectedSessionId || students.length === 0) return;

    setLoadingExistingResults(true);
    setError("");

    try {
      // Build payload - session_id might be optional, so try without it if validation fails
      // Try with session_id first (as it's used in view page)
      const payload: any = {
        term_id: Number(selectedTermId),
        subject_id: Number(selectedSubjectId),
      };
      
      if (selectedSessionId) {
        payload.session_id = Number(selectedSessionId);
      }

      console.log("Loading existing results with payload:", payload);

      let response;
      try {
        response = await axios.post<ResultsResponse>(
          "http://127.0.0.1:8000/api/results/view",
          payload,
          getAuthHeaders()
        );
      } catch (firstErr: any) {
        // If validation fails and we included session_id, try without it
        if (firstErr.response?.status === 422 && payload.session_id) {
          console.log("Retrying without session_id...");
          const retryPayload = {
            term_id: Number(selectedTermId),
            subject_id: Number(selectedSubjectId),
          };
          response = await axios.post<ResultsResponse>(
            "http://127.0.0.1:8000/api/results/view",
            retryPayload,
            getAuthHeaders()
          );
        } else {
          throw firstErr;
        }
      }

      let resultsData: any[] = [];
      if (Array.isArray(response.data)) {
        resultsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        resultsData = response.data.data;
      }

      // Initialize scores with existing results
      const initialScores: Record<string, StudentScore> = {};
      students.forEach((student) => {
        // Try to find result by student_uuid or uuid field
        const existingResult = resultsData.find(
          (r: any) => r.student_uuid === student.uuid || r.uuid === student.uuid || (r.student && r.student.uuid === student.uuid)
        );
        
        initialScores[student.uuid] = {
          student_uuid: student.uuid,
          student_name: student.name,
          ca1: existingResult?.ca1,
          ca2: existingResult?.ca2,
          exam_score: existingResult?.exam_score,
          teacher_comment: existingResult?.teacher_comment || "",
        };
      });

      setScores(initialScores);
    } catch (err: any) {
      console.error("Error loading existing results:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      
      // Log validation errors for debugging
      if (err.response?.status === 422) {
        console.warn("Validation error loading results:", err.response?.data?.errors || err.response?.data?.message);
        // If it's a validation error, try without session_id as it might not be required
        if (err.response?.data?.errors) {
          console.log("Trying to load results without session_id...");
          // Don't retry automatically, just log the error
        }
      }
      
      // Don't show error to user if it's just validation (no results exist yet)
      // Just initialize empty scores
      const initialScores: Record<string, StudentScore> = {};
      students.forEach((student) => {
        initialScores[student.uuid] = {
          student_uuid: student.uuid,
          student_name: student.name,
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

  const handleSubmit = async () => {
    if (!selectedTermId || !selectedClassId || !selectedSubjectId) {
      setError("Please select term, class, and subject");
      message.error("Please select term, class, and subject");
      return;
    }

    if (students.length === 0) {
      setError("No students to update scores for");
      message.error("No students to update scores for");
      return;
    }

    const studentUuids = students.map((s) => s.uuid);
    
    // Build results array - only include students with at least one score entered
    const resultsWithScores = Object.values(scores)
      .filter((score) => {
        if (!studentUuids.includes(score.student_uuid)) return false;
        // Include if at least one score is entered
        return score.ca1 !== undefined || score.ca2 !== undefined || score.exam_score !== undefined;
      });

    if (resultsWithScores.length === 0) {
      setError("Please enter at least one score for at least one student");
      message.error("Please enter at least one score for at least one student");
      return;
    }

    // Map results ensuring all required fields are present
    // The API requires ca1, ca2, and exam_score to be present in every result object
    // Based on Postman examples, all fields should be numbers
    const results = resultsWithScores.map((score) => {
      const result: any = {
        student_uuid: score.student_uuid,
        ca1: score.ca1 !== undefined && score.ca1 !== null ? Number(score.ca1) : 0,
        ca2: score.ca2 !== undefined && score.ca2 !== null ? Number(score.ca2) : 0,
        exam_score: score.exam_score !== undefined && score.exam_score !== null ? Number(score.exam_score) : 0,
      };
      
      // Include teacher_comment if provided
      if (score.teacher_comment && score.teacher_comment.trim()) {
        result.teacher_comment = String(score.teacher_comment.trim());
      }
      
      return result;
    });

    setSubmitting(true);
    setError("");

    try {
      // Ensure results array only contains students from student_uuids
      const validResults = results.filter((r) => studentUuids.includes(r.student_uuid));
      
      if (validResults.length === 0) {
        setError("No valid results to update");
        message.error("No valid results to update");
        setSubmitting(false);
        return;
      }

      const payload = {
        student_uuids: studentUuids,
        term_id: selectedTermId,
        results: validResults,
      };

      console.log("Submitting update payload:", JSON.stringify(payload, null, 2));
      console.log("Results count:", validResults.length, "Student UUIDs count:", studentUuids.length);

      const response = await axios.put<UpdateResponse>(
        "http://127.0.0.1:8000/api/results/update",
        payload,
        getAuthHeaders()
      );

      console.log("Update response:", response.data);

      const updated = Number((response.data as any)?.updated ?? (response.data as any)?.inserted ?? 0);
      const skipped = Array.isArray((response.data as any)?.skipped) ? (response.data as any).skipped : [];
      const skippedDetails = skipped.map((item: any) => {
        const student = students.find((s) => s.uuid === item.student_uuid);
        return `${student?.name || item.student_uuid || "Unknown student"}: ${item.reason || "Skipped by backend"}`;
      });

      if (updated > 0 && skipped.length > 0) {
        const msg = `Results processed. Updated: ${updated}, Skipped: ${skipped.length}.`;
        setError(`${msg}\n\nSkipped rows:\n${skippedDetails.join("\n")}`);
        message.warning(msg);
      } else if (updated > 0) {
        message.success(response.data.message || `Results updated successfully (${updated}).`);
      } else if (skipped.length > 0) {
        const msg = response.data.message || "No results were updated.";
        setError(`${msg}\n\nSkipped rows:\n${skippedDetails.join("\n")}`);
        message.warning(msg);
      } else {
        message.success(response.data.message || "Results updated successfully.");
      }

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error("Error updating results:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      
      let errorMessage = "Failed to update results. Please try again.";
      
      if (err.response?.data) {
        // Handle Laravel validation errors
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.entries(errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field.replace(/\./g, ' ');
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          errorMessage = `Validation errors:\n${errorMessages}`;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      message.error(errorMessage);
      setError(errorMessage);
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
          Update Results
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
          </Space>
        </Space>

        {loadingStudents || loadingExistingResults ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : students.length > 0 && selectedClassId && selectedTermId && selectedSubjectId ? (
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
              Update Results
            </Button>
          </>
        ) : selectedClassId && selectedSessionId && selectedTermId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            {!selectedSubjectId ? "Please select a subject" : "No students found for this class."}
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
