"use client";

import { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Alert, App, Typography, Space, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

const CLASS_CATEGORIES = [
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
  { value: "Nursery", label: "Nursery" },
];

const BILLING_CYCLES = ["term", "monthly", "yearly", "semester"];

interface TuitionFeeData {
  id: number;
  class_category: string;
  amount: number | string;
  billing_cycle: string;
}

interface EditTuitionFeeResponse {
  message?: string;
  data?: TuitionFeeData;
}

export default function UpdateTuitionFeePage() {
  const router = useRouter();
  const params = useParams();
  const feeId = params?.id as string;
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [feeData, setFeeData] = useState<TuitionFeeData | null>(null);

  useEffect(() => {
    if (feeId) {
      fetchFeeData();
    } else {
      setError("Tuition Fee ID is required");
      setLoadingData(false);
    }
  }, [feeId]);

  useEffect(() => {
    if (feeData && !loadingData) {
      const amount = typeof feeData.amount === "string" ? parseFloat(feeData.amount) : feeData.amount;
      form.setFieldsValue({
        class_category: feeData.class_category,
        billing_cycle: feeData.billing_cycle,
        amount: amount,
      });
    }
  }, [feeData, loadingData, form]);

  const fetchFeeData = async () => {
    if (!feeId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<EditTuitionFeeResponse>(`/editTuitionFee/${feeId}`);
      const body = response.data;
      const fee = body && typeof body === "object" && "data" in body && body.data ? body.data : (body as TuitionFeeData);
      setFeeData(fee);
    } catch (err: any) {
      console.error("Error fetching tuition fee data:", err);
      setError(err.response?.data?.message || "Failed to load tuition fee data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        class_category: values.class_category,
        billing_cycle: values.billing_cycle,
        amount: values.amount,
      };

      await api.put(`/updateTuitionFee/${feeId}`, payload);
      message.success("Tuition fee updated successfully!");
      setTimeout(() => {
        router.push("/admin/tuitionfee/viewall");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating tuition fee:", err);
      let errorMessage = "Failed to update tuition fee. Please try again.";
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
          Update Tuition Fee
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="class_category"
            label="Class Category"
            rules={[{ required: true, message: "Please select class category" }]}
          >
            <Select
              placeholder="Select class category"
              options={CLASS_CATEGORIES}
            />
          </Form.Item>

          <Form.Item
            name="billing_cycle"
            label="Billing Cycle"
            rules={[{ required: true, message: "Please select billing cycle" }]}
          >
            <Select
              placeholder="Select billing cycle"
              options={BILLING_CYCLES.map((cycle) => ({
                value: cycle,
                label: cycle.charAt(0).toUpperCase() + cycle.slice(1),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter amount"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
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
                Update Tuition Fee
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
