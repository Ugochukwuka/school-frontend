"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, message, Typography } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

export default function AddTeacherPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/admin/teachers/add", values);
      
      console.log("Teacher added successfully:", response.data);

      if (response.data && response.data.message) {
        message.success(response.data.message);
      } else {
        message.success("Teacher added successfully!");
      }
      
      form.resetFields();
      
      // Redirect to teachers list after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/teachers");
      }, 1500);
    } catch (err: any) {
      console.error("Error adding teacher:", err);
      console.error("Error response:", err.response?.data);
      
      // Handle validation errors (422 status)
      let errorMessage = "Failed to add teacher. Please try again.";
      
      if (err.response?.data) {
        // Laravel validation errors
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat() as string[];
          errorMessage = errorMessages.join(", ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
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
        <Title level={1} style={{ marginBottom: "24px" }}>Add Teacher</Title>
        
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
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter teacher name" }]}
          >
            <Input placeholder="Enter teacher name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input 
              type="email" 
              placeholder="Enter email" 
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Teacher
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}

