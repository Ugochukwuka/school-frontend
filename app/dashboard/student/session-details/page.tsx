"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Alert, Descriptions, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

interface SessionDetailsResponse {
  status: string;
  current_session: string;
  class: string;
  form_teacher: string;
  message?: string;
}

export default function SessionDetailsPage() {
  const { isMobile } = useResponsive();
  const [details, setDetails] = useState<SessionDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get UUID from localStorage (stored during login)
  const getStudentUuid = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.uuid || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const studentUuid = getStudentUuid();

  useEffect(() => {
    if (studentUuid) {
      fetchSessionDetails();
    } else {
      setError("Student UUID not found. Please login again.");
      setLoading(false);
    }
  }, [studentUuid]);

  const fetchSessionDetails = async () => {
    if (!studentUuid) {
      setError("Student UUID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<SessionDetailsResponse>(
        `http://127.0.0.1:8000/api/student/sessiondetails?uuid=${studentUuid}`,
        getAuthHeaders()
      );

      console.log("Session details response:", response.data);

      if (response.data.status === "success") {
        setDetails(response.data);
      } else if (response.data.message) {
        setError(response.data.message);
        setDetails(null);
      } else {
        setDetails(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching session details:", err);
      let errorMessage = "Failed to load session details. Please try again.";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Please check if the backend server is running at http://127.0.0.1:8000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "Session details not found.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "16px" }}>
          <Spin size="large" />
          <div style={{ color: "#666", fontSize: "14px" }}>Loading session details...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Card>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          marginBottom: "24px",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "16px" : "0"
        }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 600 }}>Session Details</h1>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSessionDetails}
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

        {details && (
          <Descriptions 
            bordered 
            column={1}
            style={{ maxWidth: "800px" }}
          >
            <Descriptions.Item label="Current Session">
              {details.current_session || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Class">
              {details.class || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Form Teacher">
              {details.form_teacher || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}

        {!details && !error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <p>No session details available.</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
