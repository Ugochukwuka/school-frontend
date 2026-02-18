"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
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

export default function ViewSingleSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(sessionId || "");

  const fetchSession = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Session | { data: Session }>(`/viewSingleSession/${id}`);
      const data = response.data as Session | { data: Session };
      const sessionData = data && typeof data === "object" && "data" in data && data.data
        ? data.data
        : (data as Session);
      setSession(sessionData);
    } catch (err: any) {
      console.error("Error fetching session:", err);
      setError(err.response?.data?.message || "Failed to load session. Please try again.");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  const handleView = () => {
    if (inputId) {
      fetchSession(inputId);
    }
  };

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
          View Single Session
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

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Enter Session ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onPressEnter={handleView}
            style={{ width: 300, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleView}>
            View
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : session ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{session.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{session.name}</Descriptions.Item>
              <Descriptions.Item label="Start Date">{session.start_date}</Descriptions.Item>
              <Descriptions.Item label="End Date">{session.end_date}</Descriptions.Item>
              <Descriptions.Item label="Current">{session.current ? "Yes" : "No"}</Descriptions.Item>
            </Descriptions>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/session/update?id=${session.id}`)}
              >
                Edit
              </Button>
            </Space>
          </>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
