"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography } from "antd";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title, Text } = Typography;

interface ResetPasswordFormValues {
  user_uuid: string;
  new_password: string;
  confirm_password: string;
}

export default function ResetUserPasswordPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getErrorMessage = (err: any): string => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 401) {
      return data?.message || "Unauthorized. Please login again.";
    }

    if (status === 403) {
      return data?.message || "Only admin can reset user passwords.";
    }

    if (status === 404) {
      return data?.message || "User not found for the provided UUID.";
    }

    if (status === 422) {
      if (data?.errors && typeof data.errors === "object") {
        const validationMessages = Object.values(data.errors).flat().filter(Boolean) as string[];
        if (validationMessages.length > 0) {
          return validationMessages.join(", ");
        }
      }
      return data?.message || "Validation failed. Please check your entries.";
    }

    return data?.message || err?.message || "Failed to reset password. Please try again.";
  };

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.put(`/admin/users/${values.user_uuid}/password`, {
        password: values.new_password,
        password_confirmation: values.confirm_password,
      });

      const backendMessage = response?.data?.message || "Password updated successfully";
      setSuccessMessage(backendMessage);
      message.success(backendMessage);

      form.setFieldsValue({
        user_uuid: values.user_uuid,
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: 8 }}>
          Reset User Password
        </Title>
        <Text type="secondary">
          Enter a user UUID and set a new password. This action is restricted to admin accounts.
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        )}

        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            closable
            onClose={() => setSuccessMessage("")}
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        )}

        <Form<ResetPasswordFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600, marginTop: 24 }}
        >
          <Form.Item
            name="user_uuid"
            label="User UUID"
            rules={[
              { required: true, message: "Please enter user UUID" },
              { whitespace: true, message: "User UUID cannot be empty" },
            ]}
          >
            <Input placeholder="e.g. 2cf8f4a7-16f7-4f9d-a77a-2f177c8c907f" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={["new_password"]}
            rules={[
              { required: true, message: "Please confirm new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password confirmation does not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
