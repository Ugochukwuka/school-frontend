"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button, Space } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Session {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  current: boolean;
}

export default function ViewAllSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Session[] | { data: Session[] }>("/viewAllSessions");
      let sessionsData: Session[] = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
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
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/session/view-single?id=${id}`);
  };

  const columns = [
    {
      title: "ID",
      key: "id",
      render: (_: any, __: any, index: number) => {
        // Calculate sequential ID based on pagination (1, 2, 3...)
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
    },
    {
      title: "Current",
      dataIndex: "current",
      key: "current",
      render: (current: boolean) => (current ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Session) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Space style={{ marginBottom: 24 }} wrap>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Space>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View All Sessions
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
          />
        )}

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={sessions}
            rowKey="id"
            pagination={{ 
              pageSize: pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page)
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
