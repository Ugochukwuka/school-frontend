"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface TuitionFee {
  id: number;
  class_category: string;
  amount: number;
  billing_cycle: string;
}

export default function ViewSingleTuitionFeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feeId = searchParams.get("id");
  const [fee, setFee] = useState<TuitionFee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(feeId || "");

  const fetchFee = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<TuitionFee>(`/viewSingleTuitionFee/${id}`);
      setFee(response.data);
    } catch (err: any) {
      console.error("Error fetching tuition fee:", err);
      setError(err.response?.data?.message || "Failed to load tuition fee. Please try again.");
      setFee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feeId) {
      fetchFee(feeId);
    }
  }, [feeId]);

  const handleView = () => {
    if (inputId) {
      fetchFee(inputId);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Tuition Fee
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
            placeholder="Enter Tuition Fee ID"
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
        ) : fee ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{fee.id}</Descriptions.Item>
              <Descriptions.Item label="Class Category">{fee.class_category}</Descriptions.Item>
              <Descriptions.Item label="Amount">₦{fee.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Billing Cycle">{fee.billing_cycle}</Descriptions.Item>
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
                onClick={() => router.push(`/admin/updateTuitionFee/${fee.id}`)}
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
