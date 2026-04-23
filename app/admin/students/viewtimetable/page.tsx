"use client";

import { useEffect, useState } from "react";
import { Card, Table, Select, Alert, Spin, Typography, Space, Button, App, Dropdown, Input } from "antd";
import { EyeOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Session {
  id: number;
  name: string;
  current: boolean;
}

interface Class {
  class_id: number;
  class_name: string;
}

interface ClassesResponse {
  status: string;
  session_id: string;
  classes: Class[];
}

interface Subject {
  id: number;
  name: string;
  code?: string;
}

interface Teacher {
  id: number;
  name: string;
  email?: string;
}

interface ClassInfo {
  id: number;
  name: string;
  arm?: string;
}

interface TimetableEntry {
  id: number;
  class_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
  subject?: Subject;
  teacher?: Teacher;
  class?: ClassInfo;
}

export default function ViewWeeklyTimetablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modal } = App.useApp();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  // Initialize from URL params if available
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(() => {
    const sessionId = searchParams.get("session_id");
    return sessionId ? parseInt(sessionId, 10) : null;
  });
  const [selectedClassId, setSelectedClassId] = useState<number | null>(() => {
    const classId = searchParams.get("class_id");
    return classId ? parseInt(classId, 10) : null;
  });
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSessionId) {
      params.set("session_id", selectedSessionId.toString());
    }
    if (selectedClassId) {
      params.set("class_id", selectedClassId.toString());
    }
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [selectedSessionId, selectedClassId]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable();
    } else {
      setTimetable([]);
    }
  }, [selectedClassId, debouncedSearch]);

  // Restore filters from URL on mount and when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && selectedSessionId) {
      // Verify session exists and fetch classes
      const sessionExists = sessions.some(s => s.id === selectedSessionId);
      if (sessionExists) {
        fetchClasses(selectedSessionId);
      } else {
        // Session from URL doesn't exist, clear it
        setSelectedSessionId(null);
        setSelectedClassId(null);
      }
    }
  }, [sessions]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");
    try {
      const response = await api.get<Session[] | { data: Session[] }>("/viewsessions");
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

  const fetchClasses = async (sessionId: number) => {
    setLoadingClasses(true);
    setClasses([]);
    setSelectedClassId(null);
    setTimetable([]);
    setError("");
    try {
      const response = await api.get<ClassesResponse>(`/sessions/${sessionId}/classes`);
      if (response.data.status === "success" && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else {
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ class_id: String(selectedClassId) });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const response = await api.get<TimetableEntry[] | { data: TimetableEntry[] }>(
        `/students/viewtimetable?${params.toString()}`
      );
      let timetableData: TimetableEntry[] = [];
      if (Array.isArray(response.data)) {
        timetableData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        timetableData = response.data.data;
      }
      setTimetable(timetableData);
    } catch (err: any) {
      console.error("Error fetching timetable:", err);
      setError(err.response?.data?.message || "Failed to load timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedClassId(null);
    setClasses([]);
    setTimetable([]);
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleView = (id: number) => {
    router.push(`/admin/students/viewsingletimetable?id=${id}`);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Delete Timetable Entry",
      content: "Are you sure you want to delete this timetable entry? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(true);
        setError("");
        setSuccess("");
        try {
          const response = await api.delete(`/timetable/${id}`);
          const messageText = response.data?.message || "Timetable entry deleted successfully";
          
          if (messageText.includes("deleted successfully")) {
            setSuccess(messageText);
            // Refresh the timetable list
            await fetchTimetable();
            // Redirect after 5 seconds
            setTimeout(() => {
              router.push("/admin/students/viewtimetable");
            }, 5000);
          } else {
            setError(messageText);
          }
        } catch (err: any) {
          console.error("Error deleting timetable:", err);
          const errorMessage = err.response?.data?.message || "Failed to delete timetable entry. Please try again.";
          setError(errorMessage);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Day",
      dataIndex: "day_of_week",
      key: "day_of_week",
    },
    {
      title: "Subject",
      key: "subject",
      render: (_: any, record: TimetableEntry) => record.subject?.name || `Subject ID: ${record.subject_id}`,
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
      render: (time: string) => time ? time.substring(0, 5) : time, // Format to HH:mm
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
      render: (time: string) => time ? time.substring(0, 5) : time, // Format to HH:mm
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (_: any, record: TimetableEntry) => record.teacher?.name || `Teacher ID: ${record.teacher_id}`,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: TimetableEntry) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "View",
            icon: <EyeOutlined />,
            onClick: () => handleView(record.id),
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]} disabled={deleting}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Weekly Timetable
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
          />
        )}

        {success && (
          <Alert
            title={success}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess("")}
            style={{ marginBottom: 24 }}
          />
        )}

        <Space orientation="vertical" style={{ width: "100%", marginBottom: 24 }} size="middle">
          <Select
            placeholder="Select academic session"
            loading={loadingSessions}
            value={selectedSessionId}
            onChange={handleSessionChange}
            style={{ width: 300 }}
            options={sessions.map((session) => ({
              value: session.id,
              label: `${session.name}${session.current ? " (Current)" : ""}`,
            }))}
          />

          {selectedSessionId && (
            <Select
              placeholder="Select class"
              loading={loadingClasses}
              value={selectedClassId}
              onChange={handleClassChange}
              style={{ width: 300 }}
              options={classes.map((cls) => ({
                value: cls.class_id,
                label: cls.class_name,
              }))}
            />
          )}
          <Input
            placeholder="Search timetable"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
        </Space>

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={timetable}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            scroll={{ x: true }}
            locale={{ emptyText: "No results found" }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
