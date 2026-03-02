"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Select, Alert, App } from "antd";
import { DatePicker } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";

const { TextArea } = Input;

interface AnnouncementCreateResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    target_role: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
  };
}

export default function AddAnnouncementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: {
    title: string;
    description: string;
    target_role: string;
    start_date: Dayjs;
    end_date: Dayjs;
  }) => {
    setLoading(true);
    setError("");

    try {
      // Format dates as YYYY-MM-DD
      const payload = {
        title: values.title,
        description: values.description,
        target_role: values.target_role,
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      };

      const response = await axios.post<AnnouncementCreateResponse>(
        "http://127.0.0.1:8000/api/admin/announcements",
        payload,
        getAuthHeaders()
      );

      if (response.data.status) {
        message.success(response.data.message || "Announcement created successfully");
        
        // Wait 5 seconds then redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 5000);
      } else {
        setError("Failed to create announcement. Please try again.");
      }
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setError(
        err.response?.data?.message || "Failed to create announcement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Add Announcement</h1>

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

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the announcement title" }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the announcement description" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter announcement description"
            />
          </Form.Item>

          <Form.Item
            name="target_role"
            label="Target Role"
            rules={[{ required: true, message: "Please select target role" }]}
          >
            <Select placeholder="Select target role">
              <Select.Option value="student">Student</Select.Option>
              <Select.Option value="parent">Parent</Select.Option>
              <Select.Option value="teacher">Teacher</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="all">All</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select start date"
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select end date"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Announcement
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
