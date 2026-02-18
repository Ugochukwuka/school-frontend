"use client";

import { useEffect, useState } from "react";
import { Card, Table, Select, Alert, Spin, Typography, Space, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
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

interface TimetableEntry {
  id: number;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
  teacher_name?: string;
}

export default function ViewWeeklyTimetablePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable();
    } else {
      setTimetable([]);
    }
  }, [selectedClassId]);

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
      const response = await api.get<TimetableEntry[] | { data: TimetableEntry[] }>(
        `/students/viewtimetable?class_id=${selectedClassId}`
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
    router.push(`/admin/timetable/weekly/single?id=${id}`);
  };

  const columns = [
    {
      title: "Day",
      dataIndex: "day_of_week",
      key: "day_of_week",
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
    },
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: TimetableEntry) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
        >
          View
        </Button>
      ),
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
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
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
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
