"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import SimpleLayout from "@/app/components/SimpleLayout";

const { Title } = Typography;

interface Leader {
  id: number;
  name: string;
  position: string;
  photo_path: string;
  bio: string;
}

export default function EditLeaderPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Leader[] | { data: Leader[] }>("/viewAllLeaders");
      let leadersData: Leader[] = [];
      if (Array.isArray(response.data)) {
        leadersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        leadersData = response.data.data;
      }
      setLeaders(leadersData);
    } catch (err: any) {
      console.error("Error fetching leaders:", err);
      setError(err.response?.data?.message || "Failed to load leaders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/leadership/update?id=${id}`);
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
      title: "Photo Path",
      dataIndex: "photo_path",
      key: "photo_path",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Leader) => (
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
    <SimpleLayout>
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Edit Leader
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
            dataSource={leaders}
            rowKey="id"
            pagination={{ 
              pageSize: pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page)
            }}
          />
        )}
      </Card>
    </SimpleLayout>
  );
}
