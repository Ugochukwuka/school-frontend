"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import api, { getApiErrorMessage } from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

interface Subject {
  id: number;
  name: string;
  code: string;
  teacher_id: number;
  teacher_name: string;
}

interface ApiResponse {
  status: string;
  subjects: Subject[];
  message?: string;
}

export default function SubjectsPage() {
  const { isMobile } = useResponsive();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (studentUuid) {
      fetchSubjects();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoading(false);
    }
  }, [studentUuid]);

  const fetchSubjects = async () => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get<ApiResponse>(`/student/subjects?uuid=${studentUuid}`);

      console.log("Subjects response:", response.data);

      // Handle the actual API response structure: { status, subjects }
      if (response.data.status === "success" && Array.isArray(response.data.subjects)) {
        setSubjects(response.data.subjects);
      } else if (response.data.message) {
        // Handle error message from API
        setError(response.data.message);
        setSubjects([]);
      } else {
        // Fallback: check if response.data is directly the subjects array
        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          setSubjects([]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
      });

      setError(getApiErrorMessage(err, "Failed to load subjects. Please try again."));
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Subject Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Subject, b: Subject) => a.name.localeCompare(b.name),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a: Subject, b: Subject) => (a.code || "").localeCompare(b.code || ""),
    },
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher_name",
      render: (teacherName: string) => teacherName || "N/A",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "16px" }}>
          <Spin size="large" />
          <div style={{ color: "#666", fontSize: "14px" }}>Loading subjects...</div>
        </div>
      </DashboardLayout>
    );
  }

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
          <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 600 }}>My Subjects</h1>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSubjects}
            loading={loading}
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

        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={subjects}
            columns={columns}
            rowKey="id"
            scroll={{ x: "max-content" }}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  description="No subjects found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={
              subjects.length > 0
                ? {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} ${total === 1 ? "subject" : "subjects"}`,
                    responsive: true,
                    showQuickJumper: subjects.length > 50,
                  }
                : false
            }
          />
        </div>
      </Card>
    </DashboardLayout>
  );
}
