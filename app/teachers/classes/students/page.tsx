"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Input } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class_name?: string;
  [key: string]: any;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface ApiResponse {
  data: Student[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ClassStudentsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      fetchStudents();
    }
  }, [sessionId, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sessionId, debouncedSearch]);

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

  const fetchStudents = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        session_id: String(sessionId),
        per_page: "20",
        page: String(currentPage),
      });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?${params.toString()}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setStudents(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setStudents(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(
        err.response?.data?.message || "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0 }}>Students in My Classes</h1>
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
        <Input
          placeholder="Search students"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 320, marginBottom: 16 }}
        />
        
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
          dataSource={students}
          columns={columns}
          rowKey="uuid"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 20,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} students`,
                  onChange: (page) => setCurrentPage(page),
                }
              : false
          }
          locale={{ emptyText: "No results found" }}
        />
      </Card>
    </DashboardLayout>
  );
}

