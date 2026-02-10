"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Empty, Button, Select, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

interface ClassMember {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
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
  student: {
    uuid: string;
    name: string;
  };
  classes: Class[];
}

interface ClassMembersResponse {
  status: string;
  student: {
    uuid: string;
    name: string;
  };
  classmates: ClassMember[];
  message?: string;
}

export default function ClassMembersPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [error, setError] = useState("");

  // Get UUID from localStorage (stored during login)
  const getStudentUuid = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.uuid || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const studentUuid = getStudentUuid();

  // Fetch sessions on mount
  useEffect(() => {
    if (studentUuid) {
      fetchSessions();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoadingSessions(false);
    }
  }, [studentUuid]);

  // Auto-select current session and fetch classes when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
        fetchClasses(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch class members when both session and class are selected
  useEffect(() => {
    if (selectedSessionId && selectedClassId && studentUuid) {
      fetchClassMembers(selectedSessionId, selectedClassId);
    } else {
      setMembers([]);
    }
  }, [selectedSessionId, selectedClassId, studentUuid]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await axios.get<SessionsResponse | Session[]>(
        "http://127.0.0.1:8000/api/viewsessions",
        getAuthHeaders()
      );

      // Handle both array response and object with data property
      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      } else if (response.data?.status === "error") {
        throw new Error(response.data.message || "Failed to fetch sessions");
      }

      // Sort: current session first, then by name descending (newest first)
      sessionsData.sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        return b.name.localeCompare(a.name);
      });

      setSessions(sessionsData);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      let errorMessage = "Failed to load sessions. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchClasses = async (sessionId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingClasses(true);
    setError("");
    setClasses([]);
    setSelectedClassId(null); // Reset class selection
    setMembers([]); // Clear members

    try {
      const response = await axios.get<ClassesResponse>(
        `http://127.0.0.1:8000/api/users/${studentUuid}/classes/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.classes && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else {
        setClasses([]);
        setError("No classes found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      let errorMessage = "Failed to load classes. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No classes found for this session.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchClassMembers = async (sessionId: number, classId: number) => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoadingMembers(true);
    setError("");

    try {
      const response = await axios.get<ClassMembersResponse>(
        `http://127.0.0.1:8000/api/users/${studentUuid}/class-members?session_id=${sessionId}&class_id=${classId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.classmates)) {
        setMembers(response.data.classmates);
      } else if (response.data.message) {
        setError(response.data.message);
        setMembers([]);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error("Error fetching class members:", err);
      let errorMessage = "Failed to load class members. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "session_id and class_id are required";
      } else if (err.response?.status === 403) {
        errorMessage = err.response?.data?.message || "You are not in this class for this session";
      } else if (err.response?.status === 404) {
        errorMessage = err.response?.data?.message || "Student not found or not assigned to any class";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    fetchClasses(sessionId);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedClassId) {
      fetchClassMembers(selectedSessionId, selectedClassId);
    } else if (selectedSessionId) {
      fetchClasses(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: ClassMember, b: ClassMember) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: ClassMember, b: ClassMember) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "N/A",
    },
  ];

  const isLoading = loadingSessions || loadingClasses || loadingMembers;

  return (
    <DashboardLayout role="student">
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
            Class Members
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
              onChange={handleSessionChange}
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
              Class
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingClasses ? "Loading classes..." : "Select Class"}
              value={selectedClassId}
              onChange={handleClassChange}
              loading={loadingClasses}
              disabled={loadingClasses || !selectedSessionId || classes.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={classes.map((cls) => ({
                value: cls.class_id,
                label: cls.class_name,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !members.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingClasses ? "Loading classes..." : "Loading class members..."}
            </div>
          </div>
        )}

        {/* Class Members Table */}
        {!isLoading && selectedSessionId && selectedClassId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={members}
              columns={columns}
              rowKey="uuid"
              scroll={{ x: "max-content" }}
              loading={loadingMembers}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedClassId 
                        ? "Please select a class to view members"
                        : "No class members found for this class"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                members.length > 0
                  ? {
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "member" : "members"}`,
                      responsive: true,
                      showQuickJumper: members.length > 50,
                    }
                  : false
              }
            />
          </div>
        )}

        {/* Initial State Message */}
        {!isLoading && !selectedSessionId && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="Please select a session to view classes and members"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && !selectedClassId && classes.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No classes available for the selected session"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
