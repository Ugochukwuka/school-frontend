"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Testimonial {
  id: number;
  writeup: string;
  name: string;
  position: string;
}

export default function ViewAllTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Testimonial[] | { data: Testimonial[] }>("/viewAllTestimonials");
      let testimonialsData: Testimonial[] = [];
      if (Array.isArray(response.data)) {
        testimonialsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        testimonialsData = response.data.data;
      }
      setTestimonials(testimonialsData);
    } catch (err: any) {
      console.error("Error fetching testimonials:", err);
      setError(err.response?.data?.message || "Failed to load testimonials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/testimonial/view-single?id=${id}`);
  };

  const columns = [
    {
      title: "ID",
      key: "id",
      render: (_: any, __: any, index: number) => {
        // Calculate sequential ID based on pagination (1, 2, 3...)
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Testimonial",
      dataIndex: "writeup",
      key: "writeup",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Testimonial) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View All Testimonials
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

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={testimonials}
            rowKey="id"
            pagination={{ 
              pageSize: pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page)
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
