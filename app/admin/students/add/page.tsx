"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, message } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function AddStudentPage() {
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
      await axios.post(
        `http://127.0.0.1:8000/api/admin/students`,
        {
          ...values,
          role: "student",
        },
        getAuthHeaders()
      );

      message.success("Student added successfully!");
      form.resetFields();
    } catch (err: any) {
      console.error("Error adding student:", err);
      setError(err.response?.data?.message || "Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Add Student</h1>
        
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
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
            rules={[{ required: true, message: "Please enter student name" }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input type="email" placeholder="Enter email" />
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
              Add Student
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}

