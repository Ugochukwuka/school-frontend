"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Tabs } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Fee {
  id: number;
  fee_type: string;
  amount_due: number;
  student_name?: string;
  class_name?: string;
  status?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Fee[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function AdminFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sessionId, setSessionId] = useState(1);
  const [termId, setTermId] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchFees();
  }, [activeTab, sessionId, termId]);

  const fetchFees = async () => {
    setLoading(true);
    setError("");

    try {
      let url = "";
      if (activeTab === "all") {
        url = `http://127.0.0.1:8000/api/admin/fees/view`;
      } else if (activeTab === "paid") {
        url = `http://127.0.0.1:8000/api/admin/fees/paid?session_id=${sessionId}&term_id=${termId}`;
      } else if (activeTab === "part") {
        url = `http://127.0.0.1:8000/api/admin/fees/part/paid?session_id=${sessionId}&term_id=${termId}`;
      } else if (activeTab === "unpaid") {
        url = `http://127.0.0.1:8000/api/admin/fees/unpaid?session_id=${sessionId}&term_id=${termId}`;
      }

      const response = await axios.get<ApiResponse>(url, getAuthHeaders());

      if (Array.isArray(response.data)) {
        setFees(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setFees(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setFees([]);
      }
    } catch (err: any) {
      console.error("Error fetching fees:", err);
      setError(
        err.response?.data?.message || "Failed to load fees. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Fee Type",
      dataIndex: "fee_type",
      key: "fee_type",
    },
    {
      title: "Amount Due",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount: number) => `₦${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0 }}>Fees Management</h1>
          {activeTab !== "all" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Select
                value={sessionId}
                onChange={setSessionId}
                style={{ width: 150 }}
                options={[
                  { label: "Session 1", value: 1 },
                  { label: "Session 2", value: 2 },
                ]}
              />
              <Select
                value={termId}
                onChange={setTermId}
                style={{ width: 150 }}
                options={[
                  { label: "First Term", value: 1 },
                  { label: "Second Term", value: 2 },
                  { label: "Third Term", value: 3 },
                ]}
              />
            </div>
          )}
        </div>
        
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: "All Fees" },
            { key: "paid", label: "Paid" },
            { key: "part", label: "Part Paid" },
            { key: "unpaid", label: "Unpaid" },
          ]}
        />

        <Table
          dataSource={fees}
          columns={columns}
          rowKey="id"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} fees`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

