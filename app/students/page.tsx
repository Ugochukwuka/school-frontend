"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Spin, Alert, Card, Empty, Button, Select, Input } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import api from "@/app/lib/api";

interface Student {
  id: number;
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
  per_page?: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (classId) {
        params.append("class_id", classId.toString());
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      params.append("page", currentPage.toString());
      
      const url = `/admin/viewstudents${params.toString() ? `?${params.toString()}` : ""}`;
      
      console.log("Fetching students from URL:", url, "Current page:", currentPage);
      
      const response = await api.get<ApiResponse>(url);
      
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setStudents(response.data);
        setTotal(response.data.length);
        setTotalPages(1);
      } else if (response.data.data) {
        setStudents(response.data.data);
        const apiLastPage = response.data.last_page || 1;
        const apiTotal = response.data.total || response.data.data.length;
        const apiPageSize = response.data.per_page || 10;
        
        // Don't update currentPage from API response - only update from user interaction
        // This prevents conflicts when user clicks pagination
        setTotalPages(apiLastPage);
        setTotal(apiTotal);
        setPageSize(apiPageSize);
        
        console.log("Pagination state:", {
          currentPage: currentPage,
          totalPages: apiLastPage,
          total: apiTotal,
          pageSize: apiPageSize
        });
      } else {
        setStudents([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      
      let errorMessage = "Failed to load students. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err.request) {
        // Request was made but no response received - network/connectivity issue
        const errorCode = err.code;
        
        if (errorCode === "ERR_NETWORK" || err.message === "Network Error") {
          errorMessage = "Network error: Unable to connect to the server. Please ensure the backend server is running at http://127.0.0.1:8000 and check for CORS issues.";
        } else if (errorCode === "ECONNREFUSED") {
          errorMessage = "Connection refused: The server at http://127.0.0.1:8000 is not running or not accessible. Please start the backend server and try again.";
        } else if (errorCode === "ETIMEDOUT" || err.message?.includes("timeout")) {
          errorMessage = "Request timed out: The server took too long to respond (10 seconds). Please verify that the backend server is running at http://127.0.0.1:8000 and try again. If the server is running, it may be overloaded or experiencing issues.";
        } else {
          errorMessage = "Unable to connect to server. The backend server may not be running. Please verify the server is running at http://127.0.0.1:8000 and check for CORS or network issues.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [classId, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const paginationConfig = useMemo(() => {
    if (total > 0) {
      return {
        current: currentPage,
        total: total,
        pageSize: pageSize,
        showSizeChanger: false,
        showTotal: (total: number) => `Total ${total} students`,
        responsive: true,
        onChange: (page: number) => {
          console.log("Pagination onChange called with page:", page);
          setCurrentPage(page);
        },
        showLessItems: false,
      };
    }
    return false;
  }, [currentPage, total, pageSize]);

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
    <div style={{ padding: "16px", maxWidth: "100%", overflowX: "auto" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 600 }}>All Students</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Select
              value={classId}
              onChange={(value) => {
                setClassId(value);
                setCurrentPage(1);
              }}
              style={{ width: 200 }}
              placeholder="Filter by Class"
              allowClear
              options={[
                { label: "Class 1", value: 1 },
                { label: "Class 2", value: 2 },
                { label: "Class 3", value: 3 },
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchStudents}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Input
          placeholder="Search students"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          allowClear
          style={{ maxWidth: 320, marginBottom: 16 }}
        />
        
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

        {/* Debug info - remove after testing */}
        <div style={{ marginBottom: 10, padding: 10, background: "#f0f0f0", borderRadius: 4, fontSize: "12px" }}>
          <strong>Debug Info:</strong> Current Page: {currentPage} | Total Pages: {totalPages} | Total: {total} | Page Size: {pageSize} | Students: {students.length}
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={students}
            columns={columns}
            rowKey="uuid"
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  description="No results found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={paginationConfig}
          />
        </div>
      </Card>
    </div>
  );
}
