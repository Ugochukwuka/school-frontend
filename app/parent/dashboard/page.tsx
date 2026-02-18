"use client";

import { useState } from "react";
import { Card, Row, Col, Typography, Statistic, Tag } from "antd";
import {
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
  CalendarOutlined,
  BookOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title, Text } = Typography;

interface DashboardStats {
  total_children: number;
  total_fee_obligations: number;
  total_paid_fees: number;
  recent_results: number;
  attendance_rate: number;
  announcements: number;
}

// Static data - will be replaced with API endpoint later
const staticStats: DashboardStats = {
  total_children: 2,
  total_fee_obligations: 3,
  total_paid_fees: 45000,
  recent_results: 5,
  attendance_rate: 85,
  announcements: 2,
};

export default function ParentDashboard() {
  const { isMobile } = useResponsive();
  const [stats] = useState<DashboardStats>(staticStats);

  // TODO: Replace with API call
  // useEffect(() => {
  //   fetchDashboardStats();
  // }, []);
  //
  // const fetchDashboardStats = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://127.0.0.1:8000/api/parent/dashboard/stats`,
  //       getAuthHeaders()
  //     );
  //     if (response.data.status && response.data.data) {
  //       setStats(response.data.data);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching dashboard stats:", err);
  //   }
  // };

  const statCards = [
    {
      title: "Total Children",
      value: stats.total_children,
      icon: <TeamOutlined style={{ fontSize: "32px", color: "#1890ff" }} />,
      color: "#1890ff",
      link: "/parent/children",
    },
    {
      title: "Fee Obligations",
      value: stats.total_fee_obligations,
      icon: <DollarOutlined style={{ fontSize: "32px", color: "#f5222d" }} />,
      color: "#f5222d",
      link: "/parent/fees/obligations",
    },
    {
      title: "Total Paid Fees",
      value: stats.total_paid_fees.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      icon: <DollarOutlined style={{ fontSize: "32px", color: "#52c41a" }} />,
      color: "#52c41a",
      link: "/parent/fees",
      prefix: "₦",
    },
    {
      title: "Recent Results",
      value: stats.recent_results,
      icon: <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1" }} />,
      color: "#722ed1",
      link: "/parent/academic/results",
    },
    {
      title: "Attendance Rate",
      value: stats.attendance_rate,
      icon: <CalendarOutlined style={{ fontSize: "32px", color: "#faad14" }} />,
      color: "#faad14",
      link: "/parent/attendance",
      suffix: "%",
    },
    {
      title: "Announcements",
      value: stats.announcements,
      icon: <BellOutlined style={{ fontSize: "32px", color: "#13c2c2" }} />,
      color: "#13c2c2",
      link: "#",
    },
  ];

  return (
    <DashboardLayout role="parent">
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
          Parent Dashboard
        </Title>

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
                        prefix={stat.prefix}
                        suffix={stat.suffix}
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
          <Link href="/parent/children">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <TeamOutlined style={{ fontSize: "32px", color: "#1890ff", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                My Children
              </Title>
              <Text type="secondary">View all your children</Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/parent/academic/results">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                View Results
              </Title>
              <Text type="secondary">Check academic results</Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/parent/attendance">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <CalendarOutlined style={{ fontSize: "32px", color: "#faad14", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                Attendance
              </Title>
              <Text type="secondary">View attendance records</Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Link href="/parent/fees/pay">
            <Card hoverable style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
              <DollarOutlined style={{ fontSize: "32px", color: "#52c41a", marginBottom: "12px" }} />
              <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                Pay Fees
              </Title>
              <Text type="secondary">Make fee payments</Text>
            </Card>
          </Link>
        </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
