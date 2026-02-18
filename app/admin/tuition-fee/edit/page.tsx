"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Spin, Typography, Button, Space } from "antd";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

interface TuitionFee {
  id: number;
  class_category: string;
  amount: number;
  billing_cycle: string;
}

export default function EditTuitionFeePage() {
  const router = useRouter();
  const [fees, setFees] = useState<TuitionFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<TuitionFee[] | { data: TuitionFee[] }>("/viewAllTuitionFees");
      let feesData: TuitionFee[] = [];
      if (Array.isArray(response.data)) {
        feesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        feesData = response.data.data;
      }
      setFees(feesData);
    } catch (err: any) {
      console.error("Error fetching tuition fees:", err);
      setError(err.response?.data?.message || "Failed to load tuition fees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/updateTuitionFee/${id}`);
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
      title: "Class Category",
      dataIndex: "class_category",
      key: "class_category",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₦${amount.toLocaleString()}`,
    },
    {
      title: "Billing Cycle",
      dataIndex: "billing_cycle",
      key: "billing_cycle",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: TuitionFee) => (
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
        <Space style={{ marginBottom: 24 }} wrap>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Space>
        <Title level={1} style={{ marginBottom: "24px" }}>
          Edit Tuition Fee
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
            dataSource={fees}
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
