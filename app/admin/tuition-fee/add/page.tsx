"use client";

import { useState } from "react";
import { Card, Form, InputNumber, Button, Alert, App, Typography, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

const BILLING_CYCLES = ["term", "monthly", "yearly", "semester"];

export default function AddTuitionFeePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        class_category: values.class_category,
        amount: values.amount,
        billing_cycle: values.billing_cycle,
      };

      await api.post("/addTuitionFee", payload);
      message.success("Tuition fee added successfully!");
      form.resetFields();
      setTimeout(() => {
        router.push("/admin/tuitionfee/viewall");
      }, 5000);
    } catch (err: any) {
      console.error("Error adding tuition fee:", err);
      let errorMessage = "Failed to add tuition fee. Please try again.";
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
          Add Tuition Fee
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="class_category"
            label="Class Category"
            rules={[{ required: true, message: "Please enter class category" }]}
          >
            <Select
              placeholder="Select class category"
              options={[
                { value: "Primary", label: "Primary" },
                { value: "Secondary", label: "Secondary" },
                { value: "Nursery", label: "Nursery" },
              ]}
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Add Tuition Fee
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
