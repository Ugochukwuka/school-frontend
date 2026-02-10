"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";

interface Result {
  id: number;
  student_name: string;
  subject_name: string;
  ca1?: number;
  ca2?: number;
  exam_score?: number;
  total?: number;
  grade?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Result[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [termId, setTermId] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchResults();
  }, [termId]);

  const fetchResults = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<ApiResponse>(
        `http://127.0.0.1:8000/api/results/view`,
        {
          term_id: termId,
        },
        getAuthHeaders()
      );

      if (Array.isArray(response.data)) {
        setResults(response.data);
        setTotal(response.data.length);
      } else if (response.data.data) {
        setResults(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(
        err.response?.data?.message || "Failed to load results. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "CA1",
      dataIndex: "ca1",
      key: "ca1",
    },
    {
      title: "CA2",
      dataIndex: "ca2",
      key: "ca2",
    },
    {
      title: "Exam",
      dataIndex: "exam_score",
      key: "exam_score",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
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
    <div style={{ padding: "16px", maxWidth: "100%", overflowX: "auto" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 600 }}>Results</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Select
              value={termId}
              onChange={setTermId}
              style={{ width: 200 }}
              options={[
                { label: "First Term", value: 1 },
                { label: "Second Term", value: 2 },
                { label: "Third Term", value: 3 },
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchResults}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
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

        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={results}
            columns={columns}
            rowKey="id"
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  description="No results found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={
              totalPages > 1
                ? {
                    current: currentPage,
                    total: total,
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} results`,
                    responsive: true,
                  }
                : results.length > 0
            }
          />
        </div>
      </Card>
    </div>
  );
}

