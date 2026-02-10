"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card } from "antd";
import { useParams } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Attendance {
  id: number;
  date: string;
  status: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Attendance[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ChildAttendancePage() {
  const params = useParams();
  const childUuid = params.uuid as string;
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (childUuid) {
      fetchAttendance();
    }
  }, [childUuid]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children/${childUuid}/attendance`,
        getAuthHeaders()
      );

      console.log("Attendance response:", response.data);

      // Handle different response structures
      if (Array.isArray(response.data)) {
        setAttendance(response.data);
        setTotal(response.data.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setAttendance(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else if ((response.data as any).attendance && Array.isArray((response.data as any).attendance)) {
        // Handle case where attendance is nested
        setAttendance((response.data as any).attendance);
        setTotal((response.data as any).attendance.length);
      } else {
        setAttendance([]);
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message || "Failed to load attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === "present" ? "green" : "red" }}>
          {status?.toUpperCase() || "N/A"}
        </span>
      ),
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
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Child Attendance</h1>
        
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
          dataSource={attendance}
          columns={columns}
          rowKey="id"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} records`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

