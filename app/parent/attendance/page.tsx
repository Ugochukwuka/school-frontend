"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Select, Table, Space, Descriptions } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Child {
  uuid: string;
  name: string;
  email: string;
  class_name?: string;
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  term_id: number;
  session_id: number;
  date: string;
  status: string;
  teacher_id: number;
  created_at: string;
  updated_at: string;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface StudentAttendance {
  id: number;
  name: string;
  uuid: string;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
}

interface AttendanceResponse {
  status: boolean;
  students: StudentAttendance[];
  message?: string;
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

interface ApiResponse {
  data: Child[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ParentAttendancePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [selectedChildUuid, setSelectedChildUuid] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");

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
      setSelectedTermId(terms[0].id);
    }
  }, [terms]);

  useEffect(() => {
    if (selectedChildUuid && selectedSessionId && selectedTermId) {
      fetchAttendance();
    } else {
      setAttendanceRecords([]);
      setAttendanceSummary(null);
    }
  }, [selectedChildUuid, selectedSessionId, selectedTermId]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children`,
        getAuthHeaders()
      );

      let childrenData: Child[] = [];
      if (Array.isArray(response.data)) {
        childrenData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        childrenData = response.data.data;
      } else if ((response.data as any).children && Array.isArray((response.data as any).children)) {
        childrenData = (response.data as any).children;
      }

      setChildren(childrenData);
      if (childrenData.length === 1) {
        setSelectedChildUuid(childrenData[0].uuid);
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

  const fetchAttendance = async () => {
    if (!selectedChildUuid || !selectedSessionId || !selectedTermId) return;

    setLoadingAttendance(true);
    setError("");

    try {
      const response = await axios.get<AttendanceResponse>(
        `http://127.0.0.1:8000/api/parent/children/${selectedChildUuid}/attendance?session_id=${selectedSessionId}&term_id=${selectedTermId}`,
        getAuthHeaders()
      );

      console.log("Attendance response:", response.data);

      if (response.data.status && response.data.students && response.data.students.length > 0) {
        const studentData = response.data.students[0];
        setAttendanceRecords(studentData.records || []);
        setAttendanceSummary(studentData.summary || null);
      } else {
        setAttendanceRecords([]);
        setAttendanceSummary(null);
        setError(response.data.message || "No attendance records found for this term.");
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      setError(err.response?.data?.message || "Failed to load attendance. Please try again.");
      setAttendanceRecords([]);
      setAttendanceSummary(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => {
        if (!date) return "-";
        try {
          return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return date;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ 
          color: status === "present" ? "green" : status === "absent" ? "red" : status === "late" ? "orange" : "#666",
          fontWeight: 500,
          textTransform: "capitalize"
        }}>
          {status || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Attendance Tracking - History</h1>
        
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
            </Space>
          )}
        </Space>

        {attendanceSummary && (
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Attendance Summary</h3>
            <Descriptions bordered column={4}>
              <Descriptions.Item label="Present">{attendanceSummary.present}</Descriptions.Item>
              <Descriptions.Item label="Absent">{attendanceSummary.absent}</Descriptions.Item>
              <Descriptions.Item label="Late">{attendanceSummary.late}</Descriptions.Item>
              <Descriptions.Item label="Total">{attendanceSummary.total}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {loadingAttendance ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : attendanceRecords.length > 0 ? (
          <Table
            dataSource={attendanceRecords}
            columns={columns}
            rowKey={(record) => `attendance-${record.id}`}
            pagination={false}
          />
        ) : selectedChildUuid && selectedSessionId && selectedTermId ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            No attendance records found for the selected child, session, and term.
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}

