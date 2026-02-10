"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card } from "antd";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  parent_id: number;
  created_at: string;
  updated_at: string;
}

interface Book {
  id: number;
  branch_id: number;
  uuid: string;
  book_name: string;
  class_level_id: number;
  term_id: number;
  quantity: number;
  initial_quantity: number;
  cost_price: string;
  selling_price: string;
  created_at: string;
  updated_at: string;
}

interface BookSale {
  id: number;
  student_id: number;
  book_id: number;
  branch_id: number;
  quantity: number;
  total_price: string;
  purchased_at: string;
  created_at: string;
  updated_at: string;
  student: Student;
  book: Book;
}

export default function ViewAllBookSalesPage() {
  const [sales, setSales] = useState<BookSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<BookSale[]>(
        "http://127.0.0.1:8000/api/bookshop/viewallbooksales",
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setSales(response.data);
      } else {
        setSales([]);
        setError("Unexpected response format from server");
      }
    } catch (err: any) {
      console.error("Error fetching sales:", err);
      setError(
        err.response?.data?.message || "Failed to load sales records. Please try again."
      );
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₦${numPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Student Name",
      dataIndex: ["student", "name"],
      key: "student_name",
      width: 150,
    },
    {
      title: "Student Email",
      dataIndex: ["student", "email"],
      key: "student_email",
      width: 200,
    },
    {
      title: "Book Name",
      dataIndex: ["book", "book_name"],
      key: "book_name",
      width: 200,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Unit Price",
      dataIndex: ["book", "selling_price"],
      key: "unit_price",
      width: 120,
      align: "right" as const,
      render: (price: string) => formatPrice(price),
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      width: 120,
      align: "right" as const,
      render: (price: string) => formatPrice(price),
    },
    {
      title: "Purchase Date",
      dataIndex: "purchased_at",
      key: "purchased_at",
      width: 180,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>View all Book sold</h1>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: 20 }}
          />
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={sales}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sales records`,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: "No sales records found",
            }}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
