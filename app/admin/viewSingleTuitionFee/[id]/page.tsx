"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface TuitionFee {
  id: number;
  class_category: string;
  amount: number | string;
  billing_cycle: string;
}

interface ViewSingleResponse {
  message?: string;
  data?: TuitionFee;
}

export default function ViewSingleTuitionFeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [fee, setFee] = useState<TuitionFee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFee = async (feeId: string) => {
    if (!feeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<ViewSingleResponse | TuitionFee>(`/viewSingleTuitionFee/${feeId}`);
      const data = response.data as ViewSingleResponse | TuitionFee;
      const feeData = data && typeof data === "object" && "data" in data && data.data
        ? data.data
        : (data as TuitionFee);
      setFee(feeData);
    } catch (err: any) {
      console.error("Error fetching tuition fee:", err);
      setError(err.response?.data?.message || "Failed to load tuition fee. Please try again.");
      setFee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFee(id);
    }
  }, [id]);

  const amountDisplay = fee
    ? typeof fee.amount === "string"
      ? parseFloat(fee.amount)
      : fee.amount
    : 0;

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Tuition Fee
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
        ) : fee ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{fee.id}</Descriptions.Item>
              <Descriptions.Item label="Class Category">{fee.class_category}</Descriptions.Item>
              <Descriptions.Item label="Amount">₦{amountDisplay.toLocaleString()}</Descriptions.Item>
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
        ) : !loading && id ? (
          <Alert title="Tuition fee not found." type="info" />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
