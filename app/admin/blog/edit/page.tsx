"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
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
}

export default function EditBlogPage() {
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
      }
      setBlogs(blogsData);
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      setError(err.response?.data?.message || "Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/blog/update?id=${id}`);
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
      title: "Action",
      key: "action",
      render: (_: any, record: Blog) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record.id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Edit Blog
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
            dataSource={blogs}
            rowKey="id"
            pagination={{ 
              pageSize: pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page)
            }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
