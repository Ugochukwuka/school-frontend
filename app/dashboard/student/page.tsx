"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Typography, Tag } from "antd";
import { UserOutlined, BookOutlined, CalendarOutlined, TrophyOutlined, ClockCircleOutlined, BellOutlined } from "@ant-design/icons";
import Link from "next/link";
import api from "@/app/lib/api";
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
      const response = await api.get<TomorrowClassesResponse>(
        `/notifications/next-daysubjects?uuid=${studentUuid}`
      );

      const data = response.data;
      if (data.status === "success" && Array.isArray(data.notifications)) {
        setTomorrowClasses(data.notifications);
      } else if (data.message) {
        setError(data.message);
        setTomorrowClasses([]);
      } else {
        setTomorrowClasses([]);
      }
    } catch (err: any) {
      // Handle 500 and other errors gracefully - don't break dashboard
      setTomorrowClasses([]);
      if (process.env.NODE_ENV === "development" && err.response?.status === 500) {
        console.warn("Tomorrow's classes could not be loaded:", err.response?.data?.message || err.message);
      }
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
      <div
        style={{
          paddingTop: isMobile ? 8 : 0,
          paddingBottom: isMobile ? 24 : 0,
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "visible",
        }}
      >
        <Title
          level={1}
          style={{
            marginBottom: isMobile ? 16 : 24,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
            fontSize: isMobile ? "22px" : "28px",
            lineHeight: 1.3,
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          Student Dashboard
        </Title>

        {/* Tomorrow's Classes Section */}
        {tomorrowClasses.length > 0 && (
          <Card
            style={{
              marginBottom: isMobile ? 16 : 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <BellOutlined style={{ fontSize: isMobile ? 20 : 24, color: "#fff", flexShrink: 0 }} />
              <Title level={4} style={{ margin: 0, color: "#fff", fontSize: isMobile ? "16px" : undefined }}>
                Tomorrow&apos;s Classes
              </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tomorrowClasses.map((notification, index) => (
                <Card
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <ClockCircleOutlined style={{ fontSize: 18, color: "#667eea", marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 14 : 15 }}>
                        {notification.title}
                      </Text>
                      <Text style={{ color: "#666", fontSize: isMobile ? 13 : 14, wordBreak: "break-word" }}>
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
        <Title level={4} style={{ marginBottom: isMobile ? 12 : 16, fontSize: isMobile ? 16 : 18 }}>
          Quick Links
        </Title>

        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/student/class-members" style={{ display: "block" }}>
              <Card hoverable style={{ borderRadius: 8, height: "100%", minHeight: isMobile ? 100 : undefined }}>
                <div style={{ textAlign: "center", padding: isMobile ? "12px 8px" : undefined }}>
                  <UserOutlined style={{ fontSize: isMobile ? 28 : 32, color: "#1890ff", marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0, marginBottom: 4, fontSize: isMobile ? 14 : undefined }}>
                    Class Members
                  </Title>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>View your classmates</Text>
                </div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/student/subjects" style={{ display: "block" }}>
              <Card hoverable style={{ borderRadius: 8, height: "100%", minHeight: isMobile ? 100 : undefined }}>
                <div style={{ textAlign: "center", padding: isMobile ? "12px 8px" : undefined }}>
                  <BookOutlined style={{ fontSize: isMobile ? 28 : 32, color: "#52c41a", marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0, marginBottom: 4, fontSize: isMobile ? 14 : undefined }}>
                    Subjects
                  </Title>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>View your subjects</Text>
                </div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/student/timetable" style={{ display: "block" }}>
              <Card hoverable style={{ borderRadius: 8, height: "100%", minHeight: isMobile ? 100 : undefined }}>
                <div style={{ textAlign: "center", padding: isMobile ? "12px 8px" : undefined }}>
                  <CalendarOutlined style={{ fontSize: isMobile ? 28 : 32, color: "#faad14", marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0, marginBottom: 4, fontSize: isMobile ? 14 : undefined }}>
                    Timetable
                  </Title>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>View your schedule</Text>
                </div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/student/results" style={{ display: "block" }}>
              <Card hoverable style={{ borderRadius: 8, height: "100%", minHeight: isMobile ? 100 : undefined }}>
                <div style={{ textAlign: "center", padding: isMobile ? "12px 8px" : undefined }}>
                  <TrophyOutlined style={{ fontSize: isMobile ? 28 : 32, color: "#f5222d", marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0, marginBottom: 4, fontSize: isMobile ? 14 : undefined }}>
                    Results
                  </Title>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>View your results</Text>
                </div>
              </Card>
            </Link>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
