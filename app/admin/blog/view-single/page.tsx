"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Alert, Spin, Typography, Input, Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  author_name: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function ViewSingleBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputId, setInputId] = useState(blogId || "");

  const fetchBlog = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Blog>(`/viewSingleBlog/${id}`);
      setBlog(response.data);
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setError(err.response?.data?.message || "Failed to load blog. Please try again.");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlog(blogId);
    }
  }, [blogId]);

  const handleView = () => {
    if (inputId) {
      fetchBlog(inputId);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View Single Blog
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
            placeholder="Enter Blog ID"
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
        ) : blog ? (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{blog.id}</Descriptions.Item>
              <Descriptions.Item label="Title">{blog.title}</Descriptions.Item>
              <Descriptions.Item label="Content">
                <div style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
                  {blog.content}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Image">{blog.image}</Descriptions.Item>
              <Descriptions.Item label="Author">{blog.author_name}</Descriptions.Item>
              <Descriptions.Item label="Status">{blog.status}</Descriptions.Item>
              <Descriptions.Item label="Published At">{blog.published_at}</Descriptions.Item>
              <Descriptions.Item label="Created At">{blog.created_at}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{blog.updated_at}</Descriptions.Item>
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
                onClick={() => router.push(`/admin/blog/update?id=${blog.id}`)}
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
