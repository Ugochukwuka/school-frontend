"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Spin, Alert, Card, Select, Space, Input } from "antd";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class_name?: string;
  [key: string]: any;
}

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Class {
  class_id: number;
  class_name: string;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
  message?: string;
}

interface ApiResponse {
  data: Student[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ViewStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState("");
  // Initialize from URL params if available
  const [sessionId, setSessionId] = useState<number | null>(() => {
    const sid = searchParams.get("session_id");
    return sid ? parseInt(sid, 10) : null;
  });
  const [classId, setClassId] = useState<number | undefined>(() => {
    const cid = searchParams.get("class_id");
    return cid ? parseInt(cid, 10) : undefined;
  });
  const [termId, setTermId] = useState<number | undefined>(() => {
    const tid = searchParams.get("term_id");
    return tid ? parseInt(tid, 10) : undefined;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (sessionId) {
      params.set("session_id", sessionId.toString());
    }
    if (classId !== undefined) {
      params.set("class_id", classId.toString());
    }
    if (termId !== undefined) {
      params.set("term_id", termId.toString());
    }
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [sessionId, classId, termId]);

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
      fetchClasses(sessionId);
    } else {
      setClasses([]);
      setClassId(undefined);
    }
  }, [sessionId]);

  useEffect(() => {
    if (classId !== undefined || termId !== undefined) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [classId, termId, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [classId, termId, debouncedSearch]);

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

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setClassId(undefined);

    try {
      const response = await api.get<ClassesResponse>(
        `/sessions/${sessionId}/classes`
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

  const fetchStudents = async () => {
    if (classId === undefined && termId === undefined) return;

    setLoading(true);
    setError("");

    try {
      let url = `/admin/viewstudents`;
      const params: string[] = [];
      
      if (classId) params.push(`class_id=${classId}`);
      if (termId) params.push(`term_id=${termId}`);
      params.push(`page=${currentPage}`);
      params.push("per_page=10");
      if (debouncedSearch) params.push(`search=${encodeURIComponent(debouncedSearch)}`);
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await api.get<ApiResponse>(url);

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
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
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
  ];

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>View Students (Filtered)</h1>
        
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
                value={sessionId}
                onChange={setSessionId}
                placeholder="Select Session"
                loading={loadingSessions}
                options={sessions.map((session) => ({
                  value: session.id,
                  label: `${session.name}${session.current ? " (Current)" : ""}`,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Class</label>
              <Select
                style={{ width: 200 }}
                value={classId}
                onChange={setClassId}
                placeholder="Select Class"
                allowClear
                loading={loadingClasses}
                disabled={!sessionId || loadingClasses}
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Term</label>
              <Select
                style={{ width: 200 }}
                value={termId}
                onChange={setTermId}
                placeholder="Select Term"
                allowClear
                options={[
                  { value: 1, label: "First Term" },
                  { value: 2, label: "Second Term" },
                  { value: 3, label: "Third Term" },
                ]}
              />
            </div>
          </Space>
          <Input
            placeholder="Search students"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />
        </Space>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={students}
            columns={columns}
            rowKey="uuid"
            pagination={
              totalPages > 1
                ? {
                    current: currentPage,
                    total: total,
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} students`,
                    onChange: (page) => setCurrentPage(page),
                  }
                : false
            }
            locale={{ emptyText: "No results found" }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}

