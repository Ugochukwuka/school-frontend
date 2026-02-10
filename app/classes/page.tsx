"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card, Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";

interface Class {
  id: number;
  name: string;
  level?: number;
  capacity?: number;
  [key: string]: any;
}

interface ApiResponse {
  data: Class[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError("");

    try {
      // Get classes from students data
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/admin/viewstudents`,
        getAuthHeaders()
      );

      let studentsData: any[] = [];
      if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      }

      // Extract unique classes from students
      const classMap = new Map<number, Class>();
      studentsData.forEach((item: any) => {
        if (item.class && item.class.id) {
          const classId = item.class.id;
          if (!classMap.has(classId)) {
            classMap.set(classId, {
              id: classId,
              name: item.class.name,
              level: item.class.level || "",
              capacity: item.class.capacity || 0,
            });
          }
        } else if (item.class_id && item.class_name) {
          const classId = item.class_id;
          if (!classMap.has(classId)) {
            classMap.set(classId, {
              id: classId,
              name: item.class_name,
              level: "",
              capacity: 0,
            });
          }
        }
      });

      const classesData = Array.from(classMap.values());
      setClasses(classesData);
      setTotal(classesData.length);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(
        err.response?.data?.message || "Failed to load classes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Class Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
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
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 600 }}>Classes</h1>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchClasses}
            loading={loading}
          >
            Refresh
          </Button>
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
            dataSource={classes}
            columns={columns}
            rowKey="id"
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  description="No classes found"
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
                    showTotal: (total) => `Total ${total} classes`,
                    responsive: true,
                  }
                : classes.length > 0
            }
          />
        </div>
      </Card>
    </div>
  );
}

