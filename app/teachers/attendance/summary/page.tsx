"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Alert, 
  Card, 
  Empty, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Statistic,
  Row,
  Col
} from "antd";
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

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
  displayName: string; // name + arm like "SS1A"
}

interface Student {
  id: number;
  student_id: number;
  class_id: number;
  session_id: number;
  student: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone?: string;
  };
  class: {
    id: number;
    name: string;
    arm: string;
  };
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  term_id: number;
  session_id: number;
  date: string;
  status: "present" | "absent" | "late";
  teacher_id: number;
  created_at: string;
  updated_at: string;
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

interface TeacherClassesResponse {
  status: boolean;
  data: {
    current_page: number;
    data: Student[];
    total: number;
    last_page: number;
  };
}

interface AttendanceSummaryResponse {
  status: boolean;
  message: string;
  data: {
    records: AttendanceRecord[];
    summary: {
      present: number;
      absent: number;
      late: number;
      total: number;
    };
  };
}

export default function AttendanceSummaryPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<{ present: number; absent: number; late: number; total: number } | null>(null);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [error, setError] = useState("");

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-select current session and fetch terms/classes when sessions are loaded
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

  // Fetch terms when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchTerms(selectedSessionId);
    } else {
      setTerms([]);
      setSelectedTermId(null);
    }
  }, [selectedSessionId]);

  // Fetch classes when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchClasses(selectedSessionId);
    } else {
      setClasses([]);
      setSelectedClassId(null);
      setAttendanceRecords([]);
      setSummary(null);
    }
  }, [selectedSessionId]);

  // Fetch attendance summary when session, term, and class are selected
  useEffect(() => {
    console.log("🔄 useEffect triggered - Selected values:", {
      sessionId: selectedSessionId,
      termId: selectedTermId,
      classId: selectedClassId,
    });
    
    if (selectedSessionId && selectedTermId && selectedClassId) {
      console.log("✅ All selections complete, fetching attendance summary...");
      fetchAttendanceSummary(selectedSessionId, selectedTermId, selectedClassId);
    } else {
      console.log("⏳ Waiting for all selections...");
      setAttendanceRecords([]);
      setSummary(null);
    }
  }, [selectedSessionId, selectedTermId, selectedClassId]);

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

  const fetchTerms = async (sessionId: number) => {
    setLoadingTerms(true);
    setError("");
    setTerms([]);
    setSelectedTermId(null);

    try {
      console.log("🔍 Fetching terms for session_id:", sessionId);
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      console.log("✅ Terms response:", response.data);

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        // Auto-select first term
        if (response.data.terms.length > 0) {
          const firstTermId = response.data.terms[0].id;
          console.log("📝 Auto-selecting first term:", firstTermId);
          setSelectedTermId(firstTermId);
        }
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        setTerms([]);
        setError("No terms found for this session.");
      }
    } catch (err: any) {
      console.error("Error fetching terms:", err);
      let errorMessage = "Failed to load terms. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No terms found for this session.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
    setAttendanceRecords([]);
    setSummary(null);

    try {
      console.log("🔍 Fetching classes for session_id:", sessionId);
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}`,
        getAuthHeaders()
      );

      console.log("✅ Classes response:", response.data);

      // Handle different response structures
      let studentsData: Student[] = [];
      
      if (response.data.status && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          studentsData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if ((response.data as any)?.data && Array.isArray((response.data as any).data)) {
        studentsData = (response.data as any).data;
      }

      console.log("👥 Students data extracted:", studentsData.length, "students");

      if (studentsData.length > 0) {
        // Extract unique classes from the response
        const classMap = new Map<number, Class>();
        
        studentsData.forEach((student: Student) => {
          if (student.class && student.class.id) {
            const classId = student.class.id;
            if (!classMap.has(classId)) {
              classMap.set(classId, {
                id: classId,
                name: student.class.name,
                arm: student.class.arm || "",
                displayName: `${student.class.name}${student.class.arm || ""}`,
              });
            }
          }
        });

        const uniqueClasses = Array.from(classMap.values());
        console.log("🏫 Unique classes extracted:", uniqueClasses);
        setClasses(uniqueClasses);
        
        // Auto-select first class
        if (uniqueClasses.length > 0) {
          const firstClassId = uniqueClasses[0].id;
          console.log("📝 Auto-selecting first class:", firstClassId, uniqueClasses[0].displayName);
          setSelectedClassId(firstClassId);
        }
      } else {
        console.warn("⚠️ No students data found");
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

  const fetchAttendanceSummary = async (sessionId: number, termId: number, classId: number) => {
    setLoadingSummary(true);
    setError("");

    try {
      const payload = {
        session_id: sessionId,
        term_id: termId,
        class_id: classId,
        student_uuids: [],
      };
      
      console.log("🔍 Fetching attendance summary with:", payload);
      console.log("📡 API URL: http://127.0.0.1:8000/api/attendance/summary");
      
      const response = await axios.post<AttendanceSummaryResponse>(
        "http://127.0.0.1:8000/api/attendance/summary",
        payload,
        getAuthHeaders()
      );

      console.log("✅ Full API Response:", JSON.stringify(response.data, null, 2));
      console.log("📊 Response status:", response.data.status);
      console.log("📊 Response data:", response.data.data);

      if (response.data.status && response.data.data) {
        const records = response.data.data.records || [];
        const summaryData = response.data.data.summary || null;
        
        console.log("📝 Records found:", records.length);
        console.log("📝 Records data:", records);
        console.log("📈 Summary data:", summaryData);
        
        setAttendanceRecords(records);
        setSummary(summaryData);
        
        if (records.length === 0) {
          console.warn("⚠️ No attendance records found in response");
        }
      } else {
        console.warn("⚠️ Response status is false or data is missing");
        console.warn("⚠️ Response message:", response.data.message);
        setAttendanceRecords([]);
        setSummary(null);
        setError(response.data.message || "No attendance data found.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching attendance summary:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      let errorMessage = "Failed to load attendance summary. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No attendance records found.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setAttendanceRecords([]);
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    console.log("🔄 Session changed to:", sessionId);
    setSelectedSessionId(sessionId);
    setSelectedTermId(null);
    setSelectedClassId(null);
    setAttendanceRecords([]);
    setSummary(null);
  };

  const handleTermChange = (termId: number) => {
    console.log("🔄 Term changed to:", termId);
    setSelectedTermId(termId);
  };

  const handleClassChange = (classId: number) => {
    console.log("🔄 Class changed to:", classId);
    setSelectedClassId(classId);
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && selectedClassId) {
      fetchAttendanceSummary(selectedSessionId, selectedTermId, selectedClassId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClasses(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "#52c41a";
      case "absent":
        return "#ff4d4f";
      case "late":
        return "#faad14";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "absent":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "late":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => 
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: getStatusColor(status), fontWeight: 500 }}>
          {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      filters: [
        { text: "Present", value: "present" },
        { text: "Absent", value: "absent" },
        { text: "Late", value: "late" },
      ],
      onFilter: (value: any, record: AttendanceRecord) => record.status === value,
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingSummary;

  return (
    <DashboardLayout role="teacher">
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
            Attendance Summary
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
              Term
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={loadingTerms ? "Loading terms..." : "Select Term"}
              value={selectedTermId}
              onChange={handleTermChange}
              loading={loadingTerms}
              disabled={loadingTerms || !selectedSessionId || terms.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={terms.map((term) => ({
                value: term.id,
                label: term.name,
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
                value: cls.id,
                label: cls.displayName,
              }))}
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !summary && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : "Loading attendance summary..."}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {!isLoading && summary && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Records"
                  value={summary.total}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Present"
                  value={summary.present}
                  styles={{ content: { color: "#52c41a" } }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Absent"
                  value={summary.absent}
                  styles={{ content: { color: "#ff4d4f" } }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Late"
                  value={summary.late}
                  styles={{ content: { color: "#faad14" } }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Attendance Records Table */}
        {!isLoading && selectedSessionId && selectedTermId && selectedClassId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={attendanceRecords}
              columns={columns}
              rowKey="id"
              scroll={{ x: "max-content" }}
              loading={loadingSummary}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedClassId 
                        ? "Please select a class to view attendance summary"
                        : "No attendance records found for this selection"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                attendanceRecords.length > 0
                  ? {
                      pageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "record" : "records"}`,
                      responsive: true,
                      showQuickJumper: attendanceRecords.length > 50,
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
              description="Please select a session to view attendance summary"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!isLoading && selectedSessionId && !selectedTermId && terms.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <Empty
              description="No terms available for the selected session"
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

