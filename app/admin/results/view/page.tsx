"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Space } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

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

interface Result {
  id: number;
  student_id: number;
  subject_id: number;
  term_id: number;
  teacher_id: number;
  ca1: number;
  ca2: number;
  exam_score: number;
  total: number;
  grade: string;
  teacher_comment: string;
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
    code?: string;
  };
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
  classes: Array<{
    class_id: number;
    class_name: string;
  }>;
  message?: string;
}

interface SubjectsResponse {
  status: string;
  class_id: string;
  subjects: Subject[];
}

export default function AdminViewResultsPage() {
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

  useEffect(() => {
    fetchSessions();
    fetchAllSubjects(); // Fetch all subjects on load so subject is available even without class
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
    }
    // Don't clear subjects when class is deselected - keep all subjects available
  }, [selectedClassId]);

  useEffect(() => {
    // Only fetch results when we have term_id and sessions are loaded
    if (selectedTermId && !loadingSessions) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [selectedTermId, selectedSessionId, selectedSubjectId, selectedClassId, loadingSessions]);

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
      const response = await axios.get<ClassesResponse>(
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

  const fetchAllSubjects = async () => {
    setLoadingSubjects(true);
    setError("");

    try {
      const response = await axios.get<any>(
        `http://127.0.0.1:8000/api/admin/subjects`,
        getAuthHeaders()
      );

      let subjectsData: Subject[] = [];
      if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data;
      } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
        subjectsData = response.data.subjects;
      }

      setSubjects(subjectsData);
      
      // Auto-select first subject if none selected (backend may require it for admin)
      if (subjectsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectsData[0].id || subjectsData[0].subject_id);
      }
    } catch (err: any) {
      console.error("Error fetching all subjects:", err);
      // Don't set error here - it's not critical if this fails
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchSubjects = async (classId: number) => {
    setLoadingSubjects(true);
    setError("");

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

      // Update subjects list when class is selected (filtered by class)
      setSubjects(subjectsData);
      
      // Auto-select first subject if none selected
      if (subjectsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectsData[0].subject_id);
      }
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchResults = async () => {
    if (!selectedTermId) {
      return;
    }

    // Wait for session to be loaded if it's being fetched
    if (loadingSessions) {
      return;
    }

    setLoadingResults(true);
    setError("");

    try {
      // API requires term_id (required)
      // For admin, backend requires subject_id (we auto-select first if none selected)
      // session_id and class_id are optional
      const payload: any = {
        term_id: Number(selectedTermId),
      };

      // Include session_id if available (when session is selected)
      if (selectedSessionId) {
        payload.session_id = Number(selectedSessionId);
      }

      // Always include subject_id (backend requires it for admin)
      // We auto-select first subject on page load, so this should always have a value
      if (selectedSubjectId) {
        payload.subject_id = Number(selectedSubjectId);
      } else if (subjects.length > 0) {
        // Fallback: use first subject if somehow none is selected
        payload.subject_id = Number(subjects[0].subject_id || subjects[0].id);
        setSelectedSubjectId(subjects[0].subject_id || subjects[0].id);
      }

      if (selectedClassId) {
        payload.class_id = Number(selectedClassId);
      }

      console.log("Fetching results with payload:", payload);

      let response;
      try {
        response = await axios.post<Result[]>(
          `http://127.0.0.1:8000/api/results/view`,
          payload,
          getAuthHeaders()
        );
      } catch (firstErr: any) {
        // If validation fails and we included session_id, try without it
        if (firstErr.response?.status === 422 && payload.session_id) {
          console.log("Retrying without session_id...");
          const retryPayload: any = {
            term_id: Number(selectedTermId),
          };
          
          if (selectedSubjectId) {
            retryPayload.subject_id = Number(selectedSubjectId);
          } else if (subjects.length > 0) {
            retryPayload.subject_id = Number(subjects[0].subject_id || subjects[0].id);
          }
          
          if (selectedClassId) {
            retryPayload.class_id = Number(selectedClassId);
          }
          
          response = await axios.post<Result[]>(
            `http://127.0.0.1:8000/api/results/view`,
            retryPayload,
            getAuthHeaders()
          );
        } else {
          throw firstErr;
        }
      }

      if (Array.isArray(response.data)) {
        setResults(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setResults(response.data.data);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Handle validation errors
      let errorMessage = "Failed to load results. Please try again.";
      if (err.response?.data) {
        if (err.response.data.errors) {
          // Laravel validation errors
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
          
          // Check if error is about subject_id being required
          const errorText = errorMessages.join(" ").toLowerCase();
          if (errorText.includes("subject") && errorText.includes("required")) {
            errorMessage = "Subject selection is required. Please select a subject from the dropdown above.";
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
          
          // Check if message indicates subject_id is required
          if (errorMessage.toLowerCase().includes("subject") && errorMessage.toLowerCase().includes("required")) {
            errorMessage = "Subject selection is required. Please select a subject from the dropdown above.";
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (Object.keys(err.response.data).length === 0 && err.response.status === 422) {
          // Empty 422 response - backend validation failed
          if (!selectedSubjectId) {
            errorMessage = "Subject selection is required for admin users. Please select a subject from the dropdown above.";
          } else {
            errorMessage = "Validation error: The request was invalid. Please check your selections and try again.";
          }
        }
      } else if (err.response?.status === 422) {
        if (!selectedSubjectId) {
          errorMessage = "Subject selection is required. Please select a subject from the dropdown above.";
        } else {
          errorMessage = "Validation error: The request was invalid. Please check your selections.";
        }
      }
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const columns = [
    {
      title: "Student Name",
      key: "student_name",
      render: (_: any, record: Result) => record.student?.name || "-",
    },
    {
      title: "Subject",
      key: "subject_name",
      render: (_: any, record: Result) => 
        `${record.subject?.name || "-"}${record.subject?.code ? ` (${record.subject.code})` : ""}`,
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
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>View All Results</h1>
        
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
                placeholder="Select Class (Optional)"
                loading={loadingClasses}
                disabled={!selectedSessionId || loadingClasses}
                allowClear
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
                disabled={loadingSubjects}
                allowClear={false}
                options={subjects.map((subject) => ({
                  value: subject.subject_id || subject.id,
                  label: `${subject.subject_name}${subject.subject_code ? ` (${subject.subject_code})` : ""}`,
                }))}
              />
            </div>
          </Space>
        </Space>

        {loadingResults ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={results}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
