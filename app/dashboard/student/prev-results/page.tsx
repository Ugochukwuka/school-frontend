"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Select, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Result {
  id: number;
  subject_name: string;
  ca1?: number;
  ca2?: number;
  exam_score?: number;
  total?: number;
  grade?: string;
  teacher_comment?: string;
  term_name?: string;
  session_name?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: Result[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function PreviousResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [termId, setTermId] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Hardcoded UUID - replace with actual user UUID from auth
  const studentUuid = "b46777c1-71ee-49d3-a3ee-18631310c822";

  useEffect(() => {
    fetchPreviousResults();
  }, [termId]);

  const fetchPreviousResults = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/student/prevresults?uuid=${studentUuid}&term_id=${termId}`,
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
      console.error("Error fetching previous results:", err);
      setError(
        err.response?.data?.message || "Failed to load previous results. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/student/downloadresult?uuid=${studentUuid}&selected_term=${termId}`,
        {
          responseType: "blob",
          ...getAuthHeaders(),
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `previous_result_term_${termId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error("Error downloading result:", err);
      setError("Failed to download result. Please try again.");
    }
  };

  const columns = [
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
    {
      title: "Comment",
      dataIndex: "teacher_comment",
      key: "teacher_comment",
    },
    {
      title: "Term",
      dataIndex: "term_name",
      key: "term_name",
    },
    {
      title: "Session",
      dataIndex: "session_name",
      key: "session_name",
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
    <DashboardLayout role="student">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: 0 }}>Previous Session Results</h1>
          <div style={{ display: "flex", gap: "10px" }}>
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
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Download PDF
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

        <Table
          dataSource={results}
          columns={columns}
          rowKey="id"
          pagination={
            totalPages > 1
              ? {
                  current: currentPage,
                  total: total,
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} results`,
                }
              : false
          }
        />
      </Card>
    </DashboardLayout>
  );
}

