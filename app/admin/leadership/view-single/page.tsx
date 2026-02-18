"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Leader {
  id: number;
  name: string;
  position: string;
  photo_path: string;
  bio: string;
}

export default function ViewSingleLeaderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leaderId = searchParams.get("id");
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(leaderId || "");

  const fetchLeader = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Leader>(`/viewSingleLeader/${id}`);
      setLeader(response.data);
    } catch (err: any) {
      console.error("Error fetching leader:", err);
      setError(err.response?.data?.message || "Failed to load leader. Please try again.");
      setLeader(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leaderId) {
      fetchLeader(leaderId);
    }
  }, [leaderId]);

  const handleView = () => {
    if (inputId) {
      fetchLeader(inputId);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Leader
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
          />
        )}

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Enter Leader ID"
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
        ) : leader ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{leader.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{leader.name}</Descriptions.Item>
              <Descriptions.Item label="Position">{leader.position}</Descriptions.Item>
              <Descriptions.Item label="Photo Path">{leader.photo_path}</Descriptions.Item>
              <Descriptions.Item label="Biography">
                <div style={{ whiteSpace: "pre-wrap" }}>{leader.bio}</div>
              </Descriptions.Item>
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
                onClick={() => router.push(`/admin/leadership/update?id=${leader.id}`)}
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
