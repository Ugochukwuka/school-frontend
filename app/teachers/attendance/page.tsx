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
  Checkbox,
  Input,
  App,
  DatePicker
} from "antd";
import { ReloadOutlined, SaveOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";
import dayjs, { Dayjs } from "dayjs";

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

interface AttendanceMarkResponse {
  status: boolean;
  message: string;
  data: Array<{
    student_id: number;
    action: string;
  }>;
}

interface AttendanceUpdateResponse {
  status: boolean;
  message: string;
  data: Array<{
    student_id: number;
    uuid?: string;
    action: string;
  }>;
}

export default function AttendancePage() {
  const { message } = App.useApp();
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, "present" | "absent">>({});
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  
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
      setStudents([]);
    }
  }, [selectedSessionId]);

  // Fetch students when session, term, and class are selected
  useEffect(() => {
    if (selectedSessionId && selectedTermId && selectedClassId) {
      fetchStudents(selectedSessionId, selectedClassId);
    } else {
      setStudents([]);
      setAttendanceStatus({});
    }
  }, [selectedSessionId, selectedTermId, selectedClassId]);

  // Initialize attendance status when students are loaded
  useEffect(() => {
    if (students.length > 0) {
      const initialStatus: Record<string, "present" | "absent"> = {};
      students.forEach((student) => {
        initialStatus[student.student.uuid] = "present"; // Default to present
      });
      setAttendanceStatus(initialStatus);
    }
  }, [students]);

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
      const response = await axios.get<TermsResponse>(
        `http://127.0.0.1:8000/api/users/term/${sessionId}`,
        getAuthHeaders()
      );

      if (response.data.status === "success" && Array.isArray(response.data.terms)) {
        setTerms(response.data.terms);
        // Auto-select first term
        if (response.data.terms.length > 0) {
          setSelectedTermId(response.data.terms[0].id);
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
    setStudents([]);

    try {
      console.log("🔍 Fetching classes for session_id:", sessionId);
      const url = `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}`;
      console.log("📡 API URL:", url);
      
      const response = await axios.get<TeacherClassesResponse>(
        url,
        getAuthHeaders()
      );

      console.log("✅ Full API Response:", JSON.stringify(response.data, null, 2));

      // Handle different response structures
      let studentsData: Student[] = [];
      
      if (response.data.status && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          studentsData = response.data.data.data;
          console.log("📊 Found students in response.data.data.data:", studentsData.length);
        } else if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
          console.log("📊 Found students in response.data.data:", studentsData.length);
        }
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
        console.log("📊 Found students in response.data (array):", studentsData.length);
      } else if ((response.data as any)?.data && Array.isArray((response.data as any).data)) {
        studentsData = (response.data as any).data;
        console.log("📊 Found students in response.data.data (nested):", studentsData.length);
      }

      console.log("👥 Extracted students data:", studentsData);

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
          setSelectedClassId(uniqueClasses[0].id);
        } else {
          setClasses([]);
          setError("No classes found in the response data.");
        }
      } else {
        console.warn("⚠️ No students data found in response");
        setClasses([]);
        setError("No classes found for this session. The teacher may not be assigned to any classes for this session.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching classes:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
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

  const fetchStudents = async (sessionId: number, classId: number) => {
    setLoadingStudents(true);
    setError("");

    try {
      console.log("🔍 Fetching students for session_id:", sessionId, "class_id:", classId);
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}&class_id=${classId}`,
        getAuthHeaders()
      );

      console.log("✅ Students response:", response.data);

      let studentsData: Student[] = [];
      
      if (response.data.status && response.data.data && Array.isArray(response.data.data.data)) {
        // Filter students by the selected class
        studentsData = response.data.data.data.filter(
          (student: Student) => student.class.id === classId
        );
      } else if (response.data.status && response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data.filter(
          (student: Student) => student.class.id === classId
        );
      } else if (Array.isArray(response.data)) {
        studentsData = response.data.filter(
          (student: Student) => student.class.id === classId
        );
      }

      console.log("👥 Filtered students:", studentsData);
      setStudents(studentsData);
    } catch (err: any) {
      console.error("❌ Error fetching students:", err);
      let errorMessage = "Failed to load students. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "No students found for this class.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSessionChange = (sessionId: number) => {
    console.log("🔄 Session changed to:", sessionId);
    setSelectedSessionId(sessionId);
    setSelectedTermId(null);
    setSelectedClassId(null);
    setStudents([]);
    setAttendanceStatus({});
  };

  const handleTermChange = (termId: number) => {
    console.log("🔄 Term changed to:", termId);
    setSelectedTermId(termId);
  };

  const handleClassChange = (classId: number) => {
    console.log("🔄 Class changed to:", classId);
    setSelectedClassId(classId);
    setAttendanceStatus({});
  };

  const handleAttendanceChange = (studentUuid: string, checked: boolean) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentUuid]: checked ? "present" : "absent",
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedSessionId || !selectedTermId || !selectedClassId) {
      message.error("Please select session, term, and class");
      return;
    }

    if (students.length === 0) {
      message.error("No students to mark attendance for");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const attendanceData = students.map((student) => ({
        uuid: student.student.uuid,
        status: attendanceStatus[student.student.uuid] || "present",
      }));

      const payload = {
        class_id: selectedClassId,
        term_id: selectedTermId,
        session_id: selectedSessionId,
        date: selectedDate.format('YYYY-MM-DD'),
        attendance: attendanceData,
      };

      console.log("📤 Submitting attendance:", payload);

      const response = await axios.post<AttendanceMarkResponse>(
        "http://127.0.0.1:8000/api/teacher/attendance/mark",
        payload,
        getAuthHeaders()
      );

      console.log("✅ Attendance response:", response.data);

      if (response.data.status) {
        message.success(response.data.message || "Attendance marked successfully");
        // Optionally refresh the students list
        fetchStudents(selectedSessionId, selectedClassId);
      } else {
        throw new Error(response.data.message || "Failed to mark attendance");
      }
    } catch (err: any) {
      console.error("❌ Error marking attendance:", err);
      let errorMessage = "Failed to mark attendance. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (!selectedSessionId || !selectedTermId || !selectedClassId) {
      message.error("Please select session, term, and class");
      return;
    }

    if (students.length === 0) {
      message.error("No students to update attendance for");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      const attendanceData = students.map((student) => ({
        uuid: student.student.uuid,
        status: attendanceStatus[student.student.uuid] || "present",
      }));

      const payload = {
        class_id: selectedClassId,
        term_id: selectedTermId,
        session_id: selectedSessionId,
        date: selectedDate.format('YYYY-MM-DD'),
        attendance: attendanceData,
      };

      console.log("📤 Updating attendance:", payload);

      const response = await axios.put<AttendanceUpdateResponse>(
        "http://127.0.0.1:8000/api/teacher/attendance/update",
        payload,
        getAuthHeaders()
      );

      console.log("✅ Attendance update response:", response.data);

      if (response.data.status) {
        message.success(response.data.message || "Attendance updated successfully");
        // Optionally refresh the students list
        fetchStudents(selectedSessionId, selectedClassId);
      } else {
        throw new Error(response.data.message || "Failed to update attendance");
      }
    } catch (err: any) {
      console.error("❌ Error updating attendance:", err);
      let errorMessage = "Failed to update attendance. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId && selectedTermId && selectedClassId) {
      fetchStudents(selectedSessionId, selectedClassId);
    } else if (selectedSessionId) {
      fetchTerms(selectedSessionId);
      fetchClasses(selectedSessionId);
    } else {
      fetchSessions();
    }
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: ["student", "name"],
      key: "name",
      sorter: (a: Student, b: Student) => a.student.name.localeCompare(b.student.name),
    },
    {
      title: "Present",
      key: "attendance",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Student) => (
        <Checkbox
          checked={attendanceStatus[record.student.uuid] === "present"}
          onChange={(e) => handleAttendanceChange(record.student.uuid, e.target.checked)}
        />
      ),
    },
  ];

  const isLoading = loadingSessions || loadingTerms || loadingClasses || loadingStudents;

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
            Mark Attendance
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            {selectedSessionId && selectedTermId && selectedClassId && students.length > 0 && (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmitAttendance}
                  loading={submitting}
                  disabled={updating}
                >
                  Mark Attendance
                </Button>
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={handleUpdateAttendance}
                  loading={updating}
                  disabled={submitting}
                >
                  Update Attendance
                </Button>
              </>
            )}
          </Space>
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

          <div style={{ minWidth: isMobile ? "100%" : "200px", flex: isMobile ? "none" : "1" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
              Date
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="YYYY-MM-DD"
              placeholder="Select Date"
            />
          </div>
        </Space>

        {/* Loading Spinner */}
        {isLoading && !students.length && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "16px" }}>
            <Spin size="large" />
            <div style={{ color: "#666", fontSize: "14px" }}>
              {loadingSessions ? "Loading sessions..." : loadingTerms ? "Loading terms..." : loadingClasses ? "Loading classes..." : "Loading students..."}
            </div>
          </div>
        )}

        {/* Students Table */}
        {!isLoading && selectedSessionId && selectedTermId && selectedClassId && (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={students}
              columns={columns}
              rowKey={(record) => record.student.uuid}
              scroll={{ x: "max-content" }}
              loading={loadingStudents}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      !selectedClassId 
                        ? "Please select a class to view students"
                        : "No students found for this class"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={
                students.length > 0
                  ? {
                      pageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ${total === 1 ? "student" : "students"}`,
                      responsive: true,
                      showQuickJumper: students.length > 50,
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
              description="Please select a session to view terms and classes"
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
