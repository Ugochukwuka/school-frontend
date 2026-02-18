"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
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

export default function ViewAllBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Blog[] | { data: Blog[] }>("/viewAllBlogs");
      let blogsData: Blog[] = [];
      if (Array.isArray(response.data)) {
        blogsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        blogsData = response.data.data;
      } else if (response.data?.status && response.data?.data && Array.isArray(response.data.data)) {
        blogsData = response.data.data;
      }
      setBlogs(blogsData);
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Failed to load blogs. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      // Add more context for debugging
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view blogs.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later or contact support.";
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/viewSingleBlog?id=${id}`);
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
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Author",
      dataIndex: "author_name",
      key: "author_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Published At",
      dataIndex: "published_at",
      key: "published_at",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Blog) => (
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
          View All Blogs
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 24 }}
            action={
              <Button size="small" onClick={fetchBlogs}>
                Retry
              </Button>
            }
          />
        )}

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: 50 }} />
        ) : blogs.length === 0 && !error ? (
          <Alert
            title="No blogs found"
            description="There are no blogs available. Create a new blog to get started."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
            action={
              <Button type="primary" onClick={() => router.push("/admin/createBlog")}>
                Create Blog
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={blogs}
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
