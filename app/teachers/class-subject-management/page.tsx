"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Alert, 
  Card, 
  Select, 
  Tabs,
  Typography,
  Space,
  Button
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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

interface Class {
  id: number;
  name: string;
  arm: string;
  displayName: string;
}

interface FormTeacherClass {
  id: number;
  name: string;
}

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class_name?: string;
  class?: {
    id: number;
    name: string;
    arm: string;
  };
  [key: string]: any;
}

interface Subject {
  id: number;
  name: string;
  code?: string;
  class_name?: string;
  class_id?: number;
  subject?: {
    id: number;
    name: string;
    code?: string;
  };
  subject_id?: number;
  [key: string]: any;
}

interface SessionsResponse {
  status?: string;
  data?: Session[];
  message?: string;
}

interface TeacherClassesResponse {
  status: boolean;
  data: {
    current_page: number;
    data: any[];
    total: number;
    last_page: number;
  };
}

interface ApiResponse {
  status?: boolean;
  data: Student[] | Subject[] | {
    current_page: number;
    data: any[];
    total: number;
    last_page: number;
  };
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ClassSubjectManagementPage() {
  const { isMobile } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formTeacherClasses, setFormTeacherClasses] = useState<FormTeacherClass[]>([]);
  const [loadingFormTeacherClasses, setLoadingFormTeacherClasses] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  // Tab 1: Students in Classes Taught
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  
  // Tab 2: Subjects Assigned Per Session
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Tab 3: Form Class Students
  const [formClassStudents, setFormClassStudents] = useState<Student[]>([]);
  const [loadingFormClassStudents, setLoadingFormClassStudents] = useState(false);
  
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-select current session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const currentSession = sessions.find((s) => s.current);
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
      }
    }
  }, [sessions]);

  // Fetch classes when session changes (for tab 1)
  useEffect(() => {
    if (selectedSessionId && activeTab === "1") {
      fetchClasses(selectedSessionId);
    } else {
      setClasses([]);
    }
  }, [selectedSessionId, activeTab]);

  // Fetch form teacher classes when tab 3 is active
  useEffect(() => {
    if (activeTab === "3") {
      fetchFormTeacherClasses();
    } else {
      setFormTeacherClasses([]);
      setSelectedClassId(null);
    }
  }, [activeTab]);

  // Fetch data when session or class changes based on active tab
  useEffect(() => {
    if (selectedSessionId) {
      if (activeTab === "1") {
        fetchClassStudents();
      } else if (activeTab === "2") {
        fetchSubjects();
      } else if (activeTab === "3" && selectedClassId) {
        fetchFormClassStudents();
      }
    }
  }, [selectedSessionId, selectedClassId, activeTab]);

  const fetchSessions = async () => {
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
    }
  };

  const fetchClasses = async (sessionId: number) => {
    setError("");

    try {
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${sessionId}`,
        getAuthHeaders()
      );

      let studentsData: any[] = [];
      
      if (response.data.status && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          studentsData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }

      if (studentsData.length > 0) {
        const classMap = new Map<number, Class>();
        
        studentsData.forEach((student: any) => {
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
        setClasses(uniqueClasses);
        
        if (uniqueClasses.length > 0 && !selectedClassId) {
          setSelectedClassId(uniqueClasses[0].id);
        }
      } else {
        setClasses([]);
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes. Please try again.");
      setClasses([]);
    }
  };

  const fetchClassStudents = async () => {
    if (!selectedSessionId) return;

    setLoadingClassStudents(true);
    setError("");

    try {
      const response = await axios.get<TeacherClassesResponse>(
        `http://127.0.0.1:8000/api/teacher/classes/students?session_id=${selectedSessionId}&per_page=20`,
        getAuthHeaders()
      );

      console.log("Class students response:", response.data);

      let studentsData: Student[] = [];
      
      // Handle the nested structure: { status: true, data: { data: [...] } }
      if (response.data.status && response.data.data && Array.isArray(response.data.data.data)) {
        studentsData = response.data.data.data.map((item: any) => ({
          uuid: item.student?.uuid || item.uuid,
          name: item.student?.name || item.name,
          email: item.student?.email || item.email,
          phone: item.student?.phone || item.phone,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class: item.class,
        }));
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Fallback: direct array in data
        studentsData = response.data.data.map((item: any) => ({
          uuid: item.student?.uuid || item.uuid,
          name: item.student?.name || item.name,
          email: item.student?.email || item.email,
          phone: item.student?.phone || item.phone,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class: item.class,
        }));
      } else if (Array.isArray(response.data)) {
        // Fallback: direct array response
        studentsData = response.data.map((item: any) => ({
          uuid: item.student?.uuid || item.uuid,
          name: item.student?.name || item.name,
          email: item.student?.email || item.email,
          phone: item.student?.phone || item.phone,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class: item.class,
        }));
      }

      console.log("Processed students data:", studentsData);
      setClassStudents(studentsData);
    } catch (err: any) {
      console.error("Error fetching class students:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setClassStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const fetchSubjects = async () => {
    if (!selectedSessionId) return;

    setLoadingSubjects(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/teacher/subjects?session_id=${selectedSessionId}&per_page=20`,
        getAuthHeaders()
      );

      let subjectsData: Subject[] = [];
      
      if (Array.isArray(response.data)) {
        subjectsData = response.data.map((item: any) => ({
          id: item.subject_id || item.id,
          name: item.subject?.name || item.name,
          code: item.subject?.code || item.code,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class_id: item.class_id || item.class?.id,
          subject: item.subject,
          subject_id: item.subject_id || item.id,
        }));
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data.map((item: any) => ({
          id: item.subject_id || item.id,
          name: item.subject?.name || item.name,
          code: item.subject?.code || item.code,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class_id: item.class_id || item.class?.id,
          subject: item.subject,
          subject_id: item.subject_id || item.id,
        }));
      }

      setSubjects(subjectsData);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects. Please try again.");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchFormTeacherClasses = async () => {
    setLoadingFormTeacherClasses(true);
    setError("");

    try {
      const response = await axios.get<FormTeacherClass[]>(
        `http://127.0.0.1:8000/api/form-teacher/classes`,
        getAuthHeaders()
      );

      console.log("Form teacher classes response:", response.data);

      let classesData: FormTeacherClass[] = [];
      
      if (Array.isArray(response.data)) {
        classesData = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        classesData = (response.data as any).data || [];
      }

      console.log("Processed form teacher classes:", classesData);
      setFormTeacherClasses(classesData);
      
      // Auto-select first class if available
      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching form teacher classes:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to load form teacher classes. Please try again.");
      setFormTeacherClasses([]);
    } finally {
      setLoadingFormTeacherClasses(false);
    }
  };

  const fetchFormClassStudents = async () => {
    if (!selectedSessionId || !selectedClassId) return;

    setLoadingFormClassStudents(true);
    setError("");

    try {
      const response = await axios.get<any>(
        `http://127.0.0.1:8000/api/teacher/formclass/students?session_id=${selectedSessionId}&per_page=20&class_id=${selectedClassId}`,
        getAuthHeaders()
      );

      console.log("Form class students response:", response.data);

      let studentsData: Student[] = [];
      
      // Handle the response structure: { data: [...], current_page: 1, ... }
      if (response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data.map((item: any) => ({
          uuid: item.student?.uuid || item.uuid,
          name: item.student?.name || item.name,
          email: item.student?.email || item.email,
          phone: item.student?.phone || item.phone,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class: item.class,
        }));
      } else if (Array.isArray(response.data)) {
        // Fallback: direct array response
        studentsData = response.data.map((item: any) => ({
          uuid: item.student?.uuid || item.uuid,
          name: item.student?.name || item.name,
          email: item.student?.email || item.email,
          phone: item.student?.phone || item.phone,
          class_name: item.class?.name ? `${item.class.name}${item.class.arm || ""}` : item.class_name,
          class: item.class,
        }));
      }

      console.log("Processed form class students data:", studentsData);
      setFormClassStudents(studentsData);
    } catch (err: any) {
      console.error("Error fetching form class students:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to load students. Please try again.");
      setFormClassStudents([]);
    } finally {
      setLoadingFormClassStudents(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId) {
      fetchSessions();
      if (activeTab === "1") {
        fetchClasses(selectedSessionId);
        fetchClassStudents();
      } else if (activeTab === "2") {
        fetchSubjects();
      } else if (activeTab === "3") {
        fetchFormTeacherClasses();
        if (selectedClassId) {
          fetchFormClassStudents();
        }
      }
    }
  };

  const studentColumns = [
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
      render: (phone: string) => phone || "-",
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
    },
  ];

  const subjectColumns = [
    {
      title: "Subject Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => code || "-",
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: "Students in Classes Taught",
      children: (
        <Table
          dataSource={classStudents}
          columns={studentColumns}
          rowKey="uuid"
          loading={loadingClassStudents}
          pagination={false}
        />
      ),
    },
    {
      key: "2",
      label: "My Assigned Subjects",
      children: (
        <Table
          dataSource={subjects}
          columns={subjectColumns}
          rowKey="id"
          loading={loadingSubjects}
          pagination={false}
        />
      ),
    },
    {
      key: "3",
      label: "Form Class Students",
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Select Class
            </label>
            <Select
              style={{ width: "100%", maxWidth: 300 }}
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="Select a class"
              loading={loadingFormTeacherClasses}
              disabled={loadingFormTeacherClasses || formTeacherClasses.length === 0}
              options={formTeacherClasses.map((cls) => ({
                value: cls.id,
                label: cls.name,
              }))}
            />
          </div>
          <Table
            dataSource={formClassStudents}
            columns={studentColumns}
            rowKey="uuid"
            loading={loadingFormClassStudents}
            pagination={false}
          />
        </>
      ),
    },
  ];

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
            Class & Subject Management
          </Title>
          <Space>
            <Select
              style={{ width: isMobile ? "100%" : 200 }}
              value={selectedSessionId}
              onChange={(value) => {
                setSelectedSessionId(value);
                setSelectedClassId(null);
              }}
              placeholder="Select Session"
              loading={sessions.length === 0}
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.name}${session.current ? " (Current)" : ""}`,
              }))}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loadingClassStudents || loadingSubjects || loadingFormClassStudents}
            >
              Refresh
            </Button>
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

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type={isMobile ? "card" : "line"}
        />
      </Card>
    </DashboardLayout>
  );
}

