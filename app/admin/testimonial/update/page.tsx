"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Alert, App, Typography, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";
import SimpleLayout from "@/app/components/SimpleLayout";

const { Title } = Typography;
const { TextArea } = Input;

interface TestimonialData {
  id: number;
  writeup: string;
  name: string;
  position: string;
}

export default function UpdateTestimonialPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testimonialId = searchParams.get("id");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [testimonialData, setTestimonialData] = useState<TestimonialData | null>(null);

  useEffect(() => {
    if (testimonialId) {
      fetchTestimonialData();
    } else {
      setError("Testimonial ID is required");
      setLoadingData(false);
    }
  }, [testimonialId]);

  useEffect(() => {
    if (testimonialData && !loadingData) {
      form.setFieldsValue({
        writeup: testimonialData.writeup,
      });
    }
  }, [testimonialData, loadingData, form]);

  const fetchTestimonialData = async () => {
    if (!testimonialId) return;
    setLoadingData(true);
    setError("");
    try {
      const response = await api.get<TestimonialData>(`/editTestimonial/${testimonialId}`);
      setTestimonialData(response.data);
    } catch (err: any) {
      console.error("Error fetching testimonial data:", err);
      setError(err.response?.data?.message || "Failed to load testimonial data. Please try again.");
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

      await api.put(`/updateTestimonial/${testimonialId}`, payload);
      message.success("Testimonial updated successfully!");
      setTimeout(() => {
        router.push("/admin/testimonial/view-all");
      }, 5000);
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

  return (
    <SimpleLayout>
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Update Testimonial
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

        {loadingData ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            Loading...
          </div>
        ) : (
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
        )}
      </Card>
    </SimpleLayout>
  );
}
