"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, Space, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;
const { TextArea } = Input;

interface TestimonialData {
  id: number;
  writeup: string;
  name: string;
  position: string;
}

export default function EditTestimonialByIdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [testimonialData, setTestimonialData] = useState<TestimonialData | null>(null);

  useEffect(() => {
    if (id) {
      fetchTestimonialData();
    } else {
      setError("Testimonial ID is required");
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    if (testimonialData && !loadingData) {
      form.setFieldsValue({
        writeup: testimonialData.writeup,
      });
    }
  }, [testimonialData, loadingData, form]);

  const fetchTestimonialData = async () => {
    if (!id) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<TestimonialData | { data: TestimonialData }>(`/editTestimonial/${id}`);
      const data = response.data as TestimonialData | { data: TestimonialData };
      const testimonial = data && typeof data === "object" && "data" in data && data.data
        ? data.data
        : (data as TestimonialData);
      setTestimonialData(testimonial);
    } catch (err: any) {
      console.error("Error fetching testimonial data:", err);
      setError(err.response?.data?.message || "Failed to load testimonial data. Please try again.");
      setTestimonialData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        writeup: values.writeup,
      };

      await api.put(`/updateTestimonial/${id}`, payload);
      message.success("Testimonial updated successfully!");
      setTimeout(() => {
        router.push("/admin/viewAllTestimonials");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating testimonial:", err);
      let errorMessage = "Failed to update testimonial. Please try again.";
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
          Edit Testimonial
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

        {testimonialData ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Name">{testimonialData.name}</Descriptions.Item>
              <Descriptions.Item label="Position">{testimonialData.position}</Descriptions.Item>
            </Descriptions>
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
                  Update Testimonial
                </Button>
              </Space>
            </Form.Item>
            </Form>
          </>
        ) : (
          id ? (
            <Alert title="Testimonial not found." type="info" />
          ) : null
        )}
      </Card>
    </DashboardLayout>
  );
}
