"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;
const { TextArea } = Input;

export default function AddTestimonialPage() {
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
        writeup: values.writeup,
        name: values.name,
        position: values.position,
      };

      await api.post("/addTestimonial", payload);
      message.success("Testimonial added successfully!");
      form.resetFields();
      setTimeout(() => {
        router.push("/admin/testimonial/view-all");
      }, 5000);
    } catch (err: any) {
      console.error("Error adding testimonial:", err);
      let errorMessage = "Failed to add testimonial. Please try again.";
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
        <Title level={1} style={{ marginBottom: "24px" }}>
          Add Testimonial
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
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="writeup"
            label="Testimonial"
            rules={[{ required: true, message: "Please enter testimonial" }]}
          >
            <TextArea rows={6} placeholder="Enter testimonial message" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Please enter position" }]}
          >
            <Input placeholder="e.g., Parent, Student, etc." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Add Testimonial
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
