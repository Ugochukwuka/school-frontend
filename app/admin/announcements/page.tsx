"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Tag } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Announcement {
  id: number;
  title: string;
  description: string;
  target_role: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<Announcement[]>(
        `http://127.0.0.1:8000/api/announcements`,
        getAuthHeaders()
      );

      console.log("Announcements response:", response.data);

      if (Array.isArray(response.data)) {
        setAnnouncements(response.data);
      } else {
        setAnnouncements([]);
      }
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.response?.data?.message || "Failed to load announcements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getTargetRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "all":
        return "blue";
      case "parent":
        return "green";
      case "student":
        return "orange";
      case "teacher":
        return "purple";
      case "admin":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "ID",
      key: "id",
      width: 80,
      render: (_: any, __: any, index: number) => {
        // Calculate sequential ID based on pagination (1, 2, 3...)
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span style={{ maxWidth: "300px", display: "inline-block" }}>
          {text?.substring(0, 100)}
          {text?.length > 100 ? "..." : ""}
        </span>
      ),
    },
    {
      title: "Target Role",
      dataIndex: "target_role",
      key: "target_role",
      render: (role: string) => (
        <Tag color={getTargetRoleColor(role)}>{role?.toUpperCase() || "N/A"}</Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string) => formatDate(date),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Announcements</h1>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={announcements}
            columns={columns}
            rowKey="id"
            pagination={
              announcements.length > 10
                ? {
                    pageSize: pageSize,
                    current: currentPage,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} announcements`,
                  }
                : false
            }
          />
        )}
      </Card>
    </DashboardLayout>
  );
}

