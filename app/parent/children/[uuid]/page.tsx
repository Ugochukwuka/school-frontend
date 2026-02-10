"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Descriptions, Tabs } from "antd";
import { useParams } from "next/navigation";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Class {
  id: number;
  name: string;
  arm: string;
  full_name: string;
}

interface ChildDetails {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  class?: Class | null;
  class_name?: string;
  [key: string]: any;
}

interface ApiResponse {
  status: boolean;
  student: ChildDetails;
  message?: string;
}

export default function ChildDetailsPage() {
  const params = useParams();
  const childUuid = params.uuid as string;
  const [child, setChild] = useState<ChildDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (childUuid) {
      fetchChildDetails();
    }
  }, [childUuid]);

  const fetchChildDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ApiResponse>(
        `http://127.0.0.1:8000/api/parent/children/${childUuid}`,
        getAuthHeaders()
      );

      console.log("Child details response:", response.data);

      // Handle the API response structure: { status: true, student: {...} }
      if (response.data.status && response.data.student) {
        setChild(response.data.student);
      } else if ((response.data as any).data) {
        // Fallback for different response structure
        setChild((response.data as any).data);
      } else if ((response.data as any).student) {
        // Another fallback
        setChild((response.data as any).student);
      } else {
        setError("No student data found in response");
      }
    } catch (err: any) {
      console.error("Error fetching child details:", err);
      setError(
        err.response?.data?.message || "Failed to load child details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <h1 style={{ marginBottom: "24px" }}>Child Details</h1>
        
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

        {child && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{child.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{child.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{child.phone || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Class">
              {child.class?.full_name || child.class_name || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Tabs
          style={{ marginTop: 24 }}
          items={[
            {
              key: "results",
              label: "Results",
              children: (
                <div>
                  <a href={`/parent/children/${childUuid}/results`}>View Results</a>
                </div>
              ),
            },
            {
              key: "attendance",
              label: "Attendance",
              children: (
                <div>
                  <a href={`/parent/children/${childUuid}/attendance`}>View Attendance</a>
                </div>
              ),
            },
            {
              key: "fees",
              label: "Fees",
              children: (
                <div>
                  <a href={`/parent/children/${childUuid}/fees`}>View Fees</a>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
}

