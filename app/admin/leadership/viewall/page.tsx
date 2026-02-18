"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button, Dropdown, App } from "antd";
import { EyeOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface Leader {
  id: number;
  name: string;
  position: string;
  photo_path: string;
  bio: string;
}

export default function ViewAllLeadersPage() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleView = (id: number) => {
    router.push(`/admin/leadership/view-single?id=${id}`);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Delete Leader",
      content: "Are you sure you want to delete this leadership team member? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(true);
        setError("");
        try {
          const response = await api.delete(`/admin/leadership/delete/${id}`);
          const data = response.data as { status?: boolean; message?: string };
          if (data.status === true) {
            message.success(data.message || "Leadership team member deleted successfully.");
            await fetchLeaders();
          } else {
            message.error(data.message || "Failed to delete.");
            setError(data.message || "Failed to delete.");
          }
        } catch (err: any) {
          console.error("Error deleting leader:", err);
          const data = err.response?.data as { status?: boolean; message?: string } | undefined;
          const errorMessage = data?.message || "Failed to delete leader. Please try again.";
          setError(errorMessage);
          message.error(errorMessage);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "ID",
      key: "id",
      render: (_: unknown, __: Leader, index: number) => {
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
      title: "Biography",
      dataIndex: "bio",
      key: "bio",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: unknown, record: Leader) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "View",
            icon: <EyeOutlined />,
            onClick: () => handleView(record.id),
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]} disabled={deleting}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card style={{ boxShadow: "none" }}>
        <Title level={1} style={{ marginBottom: "24px" }}>
          View All Leaders
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
              pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
