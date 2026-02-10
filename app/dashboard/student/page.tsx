"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Alert, Typography, Tag, Empty } from "antd";
import { UserOutlined, BookOutlined, CalendarOutlined, TrophyOutlined, ClockCircleOutlined, BellOutlined } from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";
import { getAuthHeaders } from "@/app/lib/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title, Text } = Typography;

interface DashboardStats {
  totalSubjects: number;
  totalClassMembers: number;
  upcomingClasses: number;
  recentResults: number;
}

interface TomorrowClassNotification {
  title: string;
  message: string;
  read_at: string | null;
}

interface TomorrowClassesResponse {
  status: string;
  notifications: TomorrowClassNotification[];
  message?: string;
}

export default function StudentDashboard() {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [loadingTomorrow, setLoadingTomorrow] = useState(true);
  const [error, setError] = useState("");
  const [tomorrowClasses, setTomorrowClasses] = useState<TomorrowClassNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalClassMembers: 0,
    upcomingClasses: 0,
    recentResults: 0,
  });

  // Get UUID from localStorage
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
    // Fetch tomorrow's classes
    if (studentUuid) {
      fetchTomorrowClasses();
    } else {
      setLoadingTomorrow(false);
    }
    // Fetch dashboard stats if needed
    setLoading(false);
  }, [studentUuid]);

  const fetchTomorrowClasses = async () => {
    if (!studentUuid) {
      setLoadingTomorrow(false);
      return;
    }

    setLoadingTomorrow(true);
    setError("");

    try {
      const response = await axios.get<TomorrowClassesResponse>(
        `http://127.0.0.1:8000/api/notifications/next-daysubjects?uuid=${studentUuid}`,
        getAuthHeaders()
      );

      console.log("Tomorrow classes response:", response.data);

      if (response.data.status === "success" && Array.isArray(response.data.notifications)) {
        setTomorrowClasses(response.data.notifications);
      } else if (response.data.message) {
        setError(response.data.message);
        setTomorrowClasses([]);
      } else {
        setTomorrowClasses([]);
      }
    } catch (err: any) {
      console.error("Error fetching tomorrow classes:", err);
      // Don't show error for tomorrow classes, just log it
      setTomorrowClasses([]);
    } finally {
      setLoadingTomorrow(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Title level={1} style={{ marginBottom: "24px", fontSize: isMobile ? "24px" : "28px" }}>
        Student Dashboard
      </Title>

      {/* Tomorrow's Classes Section */}
      {tomorrowClasses.length > 0 && (
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <BellOutlined style={{ fontSize: "24px", color: "#fff" }} />
            <Title level={4} style={{ margin: 0, color: "#fff" }}>
              Tomorrow's Classes
            </Title>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tomorrowClasses.map((notification, index) => (
              <Card
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <ClockCircleOutlined style={{ fontSize: "18px", color: "#667eea", marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: "block", marginBottom: "4px", fontSize: "15px" }}>
                      {notification.title}
                    </Text>
                    <Text style={{ color: "#666", fontSize: "14px" }}>
                      {notification.message}
                    </Text>
                  </div>
                  {notification.read_at === null && (
                    <Tag color="blue" style={{ margin: 0 }}>
                      New
                    </Tag>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Links Section */}
      <Title level={4} style={{ marginBottom: "16px", fontSize: "18px" }}>
        Quick Links
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Link href="/dashboard/student/class-members">
            <Card hoverable style={{ borderRadius: "8px", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <UserOutlined style={{ fontSize: "32px", color: "#1890ff", marginBottom: "12px" }} />
                <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                  Class Members
                </Title>
                <Text type="secondary">View your classmates</Text>
              </div>
            </Card>
          </Link>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Link href="/dashboard/student/subjects">
            <Card hoverable style={{ borderRadius: "8px", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <BookOutlined style={{ fontSize: "32px", color: "#52c41a", marginBottom: "12px" }} />
                <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                  Subjects
                </Title>
                <Text type="secondary">View your subjects</Text>
              </div>
            </Card>
          </Link>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Link href="/dashboard/student/timetable">
            <Card hoverable style={{ borderRadius: "8px", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <CalendarOutlined style={{ fontSize: "32px", color: "#faad14", marginBottom: "12px" }} />
                <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                  Timetable
                </Title>
                <Text type="secondary">View your schedule</Text>
              </div>
            </Card>
          </Link>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Link href="/dashboard/student/results">
            <Card hoverable style={{ borderRadius: "8px", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <TrophyOutlined style={{ fontSize: "32px", color: "#f5222d", marginBottom: "12px" }} />
                <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                  Results
                </Title>
                <Text type="secondary">View your results</Text>
              </div>
            </Card>
          </Link>
        </Col>
      </Row>
    </DashboardLayout>
  );
}
