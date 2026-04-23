"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Input } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Class {
  id: number;
  name: string;
  arm: string;
  full_name: string;
}

interface Child {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class?: Class | null;
  class_name?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Child[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchChildren(currentPage);
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchChildren = async (page: number = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children?${params.toString()}`,
        getAuthHeaders()
      );

      // Handle paginated response: { data, current_page, last_page, total, per_page }
      let childrenData: Child[] = [];
      if (Array.isArray(response.data)) {
        childrenData = response.data;
        setTotal(response.data.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        childrenData = response.data.data;
        setCurrentPage(response.data.current_page ?? page);
        setTotalPages(response.data.last_page ?? 1);
        setTotal(response.data.total ?? childrenData.length);
        if (response.data.per_page) setPageSize(response.data.per_page);
      } else if ((response.data as any).children && Array.isArray((response.data as any).children)) {
        childrenData = (response.data as any).children;
        setTotal((response.data as any).children.length);
      }

      const mappedChildren = childrenData.map((child: any) => ({
        ...child,
        class_name: child.class?.full_name || child.class_name || "N/A",
      }));

      setChildren(mappedChildren);
    } catch (err: any) {
      console.error("Error fetching children:", err);
      setError(
        err.response?.data?.message || "Failed to load children. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Class",
      key: "class",
      render: (_: any, record: Child) => {
        // Use class.full_name if available, otherwise fallback to class_name or "N/A"
        return record.class?.full_name || record.class_name || "N/A";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Child) => (
        <a onClick={() => router.push(`/parent/children/${record.uuid}`)}>
          View Details
        </a>
      ),
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
    <DashboardLayout role="parent">
      <Card>
        <h1 style={{ marginBottom: "24px" }}>My Children</h1>
        
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
        <Input
          placeholder="Search children"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 320, marginBottom: 16 }}
        />

        <Table
          dataSource={children}
          columns={columns}
          rowKey="uuid"
          pagination={
            total > pageSize || totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: pageSize,
                  showSizeChanger: false,
                  showTotal: (t) => `${t} children total`,
                  ...(totalPages > 1 ? { onChange: (page: number) => setCurrentPage(page) } : {}),
                }
              : false
          }
          locale={{ emptyText: "No results found" }}
        />
      </Card>
    </DashboardLayout>
  );
}

