"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Subject {
  id: number;
  name: string;
  code?: string;
  class_name?: string;
  class_id?: number;
  [key: string]: any;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface ApiResponse {
  data: Subject[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function TeacherSubjectsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSessionId(currentSession.id);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (sessionId) {
      fetchSubjects();
    }
  }, [sessionId]);

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

  const fetchSubjects = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/teacher/subjects?session_id=${sessionId}&per_page=20`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setSubjects(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setSubjects(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(
        err.response?.data?.message || "Failed to load subjects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Subject Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
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
    <DashboardLayout role="teacher">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: 0 }}>My Assigned Subjects</h1>
          <Select
            value={sessionId}
            onChange={setSessionId}
            style={{ width: 200 }}
            loading={loadingSessions}
            placeholder="Select Session"
            options={sessions.map((session) => ({
              value: session.id,
              label: `${session.name}${session.current ? " (Current)" : ""}`,
            }))}
          />
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
          dataSource={subjects}
          columns={columns}
          rowKey="id"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 20,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} subjects`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

