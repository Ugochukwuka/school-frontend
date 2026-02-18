"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Alert, Typography, Statistic } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

interface TeacherDashboardStats {
  total_students: number;
  total_classes: number;
  total_subjects: number;
  attendance_marked_today: number;
  results_entered: number;
  upcoming_classes: number;
}

export default function TeacherDashboard() {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<TeacherDashboardStats>({
    total_students: 0,
    total_classes: 0,
    total_subjects: 0,
    attendance_marked_today: 0,
    results_entered: 0,
    upcoming_classes: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API call when endpoint is ready
    // For now, use default values
    setTimeout(() => {
      setStats({
        total_students: 45,
        total_classes: 3,
        total_subjects: 5,
        attendance_marked_today: 42,
        results_entered: 12,
        upcoming_classes: 2,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.total_students,
      icon: <TeamOutlined style={{ fontSize: "32px", color: "#1890ff" }} />,
      color: "#1890ff",
      link: "/teachers/attendance",
    },
    {
      title: "Total Classes",
      value: stats.total_classes,
      icon: <BookOutlined style={{ fontSize: "32px", color: "#52c41a" }} />,
      color: "#52c41a",
      link: "/teachers/class-subject-management",
    },
    {
      title: "Total Subjects",
      value: stats.total_subjects,
      icon: <FileTextOutlined style={{ fontSize: "32px", color: "#faad14" }} />,
      color: "#faad14",
      link: "/teachers/class-subject-management",
    },
    {
      title: "Attendance Marked Today",
      value: stats.attendance_marked_today,
      icon: <CheckCircleOutlined style={{ fontSize: "32px", color: "#13c2c2" }} />,
      color: "#13c2c2",
      link: "/teachers/attendance",
    },
    {
      title: "Results Entered",
      value: stats.results_entered,
      icon: <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1" }} />,
      color: "#722ed1",
      link: "/teachers/results/view",
    },
    {
      title: "Upcoming Classes",
      value: stats.upcoming_classes,
      icon: <CalendarOutlined style={{ fontSize: "32px", color: "#f5222d" }} />,
      color: "#f5222d",
      link: "/teachers/attendance",
    },
  ];

  return (
    <DashboardLayout role="teacher">
      <div style={{ minWidth: 0, maxWidth: "100%", overflowX: "visible" }}>
        <Title
          level={1}
          style={{
            marginBottom: isMobile ? 16 : 24,
            marginLeft: 0,
            paddingLeft: 0,
            fontSize: isMobile ? "22px" : "28px",
            lineHeight: 1.3,
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          Teacher Dashboard
        </Title>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: isMobile ? 16 : 24 }}
          />
        )}

        {/* Statistics Cards */}
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          {statCards.map((stat, index) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={8} key={index}>
              <Link href={stat.link} style={{ display: "block" }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "12px",
                    height: "100%",
                    border: `1px solid ${stat.color}20`,
                    background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                    transition: "all 0.3s ease",
                    boxShadow: "none",
                  }}
                  styles={{ body: { padding: isMobile ? 16 : 24 } }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        styles={{
                          content: { color: stat.color, fontSize: isMobile ? 20 : 28, fontWeight: "bold" },
                          title: { fontSize: isMobile ? 12 : 14 },
                        }}
                      />
                    </div>
                    <div style={{ marginLeft: isMobile ? 0 : 16, flexShrink: 0 }}>
                      <span style={{ fontSize: isMobile ? 24 : 32 }}>{stat.icon}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Quick Links Section */}
        <Title level={4} style={{ marginBottom: isMobile ? 12 : 16, fontSize: isMobile ? 16 : 18 }}>
          Quick Actions
        </Title>

        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/teachers/attendance">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <TeamOutlined style={{ fontSize: "32px", color: "#1890ff", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                Mark Attendance
              </Title>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/teachers/results/enter">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                Enter Results
              </Title>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/teachers/attendance/summary">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <FileTextOutlined style={{ fontSize: "32px", color: "#13c2c2", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                Attendance Summary
              </Title>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/teachers/results/view">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <TrophyOutlined style={{ fontSize: "32px", color: "#faad14", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                View Results
              </Title>
            </Card>
          </Link>
        </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
