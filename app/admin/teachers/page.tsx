"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Input } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Teacher {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Teacher[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTeachers(currentPage);
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchTeachers = async (page: number = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/admin/teachers?${params.toString()}`,
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setTeachers(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setTeachers(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setTeachers([]);
      }
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(
        err.response?.data?.message || "Failed to load teachers. Please try again."
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
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>All Teachers</h1>
        
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

        <Input
          placeholder="Search teachers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 320, marginBottom: 16 }}
        />

        <Table
          dataSource={teachers}
          columns={columns}
          rowKey="uuid"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} teachers`,
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

