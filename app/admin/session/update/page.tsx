"use client";

import { useEffect, useState } from "react";
import { Card, Form, Switch, Button, Alert, App, Typography, Space, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface SessionData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  current: boolean;
}

export default function UpdateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    } else {
      setError("Session ID is required");
      setLoadingData(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionData && !loadingData) {
      form.setFieldsValue({
        current: sessionData.current,
      });
    }
  }, [sessionData, loadingData, form]);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<SessionData | { data: SessionData }>(`/editSession/${sessionId}`);
      const data = response.data as SessionData | { data: SessionData };
      const session = data && typeof data === "object" && "data" in data && data.data
        ? data.data
        : (data as SessionData);
      setSessionData(session);
    } catch (err: any) {
      console.error("Error fetching session data:", err);
      setError(err.response?.data?.message || "Failed to load session data. Please try again.");
      setSessionData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        current: values.current || false,
      };

      await api.put(`/updateSession/${sessionId}`, payload);
      message.success("Session updated successfully!");
      setTimeout(() => {
        router.push("/admin/session/view-all");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating session:", err);
      let errorMessage = "Failed to update session. Please try again.";
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat() as string[];
        errorMessage = errorMessages.join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout role="admin">
        <Card style={{ boxShadow: "none" }}>
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Space style={{ marginBottom: 24 }} wrap>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            size="large"
          >
            Go Back
          </Button>
        </Space>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Update Session
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

        {sessionData ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Session Name">{sessionData.name}</Descriptions.Item>
              <Descriptions.Item label="Start Date">{sessionData.start_date}</Descriptions.Item>
              <Descriptions.Item label="End Date">{sessionData.end_date}</Descriptions.Item>
            </Descriptions>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                name="current"
                label="Set as Current Session"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    size="large"
                  >
                    Go Back
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    Update Session
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        ) : (
          sessionId ? (
            <Alert title="Session not found." type="info" />
          ) : null
        )}
      </Card>
    </DashboardLayout>
  );
}
