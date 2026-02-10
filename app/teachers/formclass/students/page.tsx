"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class_name?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Student[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function FormClassStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(1);
  const [classId, setClassId] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [sessionId, classId]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/teacher/formclass/students?session_id=${sessionId}&per_page=20&class_id=${classId}`,
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
      console.error("Error fetching form class students:", err);
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0 }}>Form Class Students</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              value={sessionId}
              onChange={setSessionId}
              style={{ width: 150 }}
              options={[
                { label: "Session 1", value: 1 },
                { label: "Session 2", value: 2 },
              ]}
            />
            <Select
              value={classId}
              onChange={setClassId}
              style={{ width: 150 }}
              options={[
                { label: "Class 1", value: 1 },
                { label: "Class 2", value: 2 },
              ]}
            />
          </div>
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
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

