"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Testimonial {
  id: number;
  writeup: string;
  name: string;
  position: string;
}

export default function ViewSingleTestimonialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testimonialId = searchParams.get("id");
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(testimonialId || "");

  const fetchTestimonial = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Testimonial>(`/viewSingleTestimonial/${id}`);
      setTestimonial(response.data);
    } catch (err: any) {
      console.error("Error fetching testimonial:", err);
      setError(err.response?.data?.message || "Failed to load testimonial. Please try again.");
      setTestimonial(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testimonialId) {
      fetchTestimonial(testimonialId);
    }
  }, [testimonialId]);

  const handleView = () => {
    if (inputId) {
      fetchTestimonial(inputId);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Testimonial
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

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Enter Testimonial ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onPressEnter={handleView}
            style={{ width: 300, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleView}>
            View
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : testimonial ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{testimonial.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{testimonial.name}</Descriptions.Item>
              <Descriptions.Item label="Position">{testimonial.position}</Descriptions.Item>
              <Descriptions.Item label="Testimonial">
                <div style={{ whiteSpace: "pre-wrap" }}>{testimonial.writeup}</div>
              </Descriptions.Item>
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
                onClick={() => router.push(`/admin/testimonial/update?id=${testimonial.id}`)}
              >
                Edit
              </Button>
            </Space>
          </>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
