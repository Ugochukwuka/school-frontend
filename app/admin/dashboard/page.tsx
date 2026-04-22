"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card, Row, Col, Spin, Alert, Typography, Statistic, Button, Input, message } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TrophyOutlined,
  BellOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useResponsive } from "@/app/lib/responsive";

const { Title } = Typography;

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_fees: string;
  total_results: number;
  announcements: number;
}

interface DashboardStatsResponse {
  status: boolean;
  data: DashboardStats;
  message?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("Admin Dashboard");
  const [quickActionsTitle, setQuickActionsTitle] = useState("Quick Actions");
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    total_fees: "0.00",
    total_results: 0,
    announcements: 0,
  });

  useEffect(() => {
    fetchAllStats();
  }, []);

  type QuickAction = {
    title: string;
    link: string;
    icon: ReactNode;
    color: string;
  };

  const defaultQuickActions: QuickAction[] = [
    {
      title: "Add Student",
      link: "/admin/students/add",
      icon: <FileTextOutlined style={{ fontSize: "32px", color: "#1890ff", marginBottom: "12px" }} />,
      color: "#1890ff",
    },
    {
      title: "Add Teacher",
      link: "/admin/teachers/add",
      icon: <UserOutlined style={{ fontSize: "32px", color: "#52c41a", marginBottom: "12px" }} />,
      color: "#52c41a",
    },
    {
      title: "Enter Results",
      link: "/admin/results/enter",
      icon: <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1", marginBottom: "12px" }} />,
      color: "#722ed1",
    },
    {
      title: "Add Fees",
      link: "/admin/fees/add",
      icon: <DollarOutlined style={{ fontSize: "32px", color: "#f5222d", marginBottom: "12px" }} />,
      color: "#f5222d",
    },
  ];

  const [quickActions, setQuickActions] = useState<QuickAction[]>(defaultQuickActions);
  const [draftTitle, setDraftTitle] = useState("Admin Dashboard");
  const [draftQuickActionsTitle, setDraftQuickActionsTitle] = useState("Quick Actions");
  const [draftQuickActions, setDraftQuickActions] = useState<QuickAction[]>(defaultQuickActions);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTitle = localStorage.getItem("adminDashboardTitle");
    const savedQuickActionsTitle = localStorage.getItem("adminQuickActionsTitle");
    const savedQuickActions = localStorage.getItem("adminQuickActions");

    if (savedTitle) {
      setDashboardTitle(savedTitle);
      setDraftTitle(savedTitle);
    }
    if (savedQuickActionsTitle) {
      setQuickActionsTitle(savedQuickActionsTitle);
      setDraftQuickActionsTitle(savedQuickActionsTitle);
    }
    if (savedQuickActions) {
      try {
        const parsed = JSON.parse(savedQuickActions) as Array<{ title: string; link: string }>;
        if (Array.isArray(parsed) && parsed.length === defaultQuickActions.length) {
          const merged = defaultQuickActions.map((item, index) => ({
            ...item,
            title: parsed[index]?.title || item.title,
            link: parsed[index]?.link || item.link,
          }));
          setQuickActions(merged);
          setDraftQuickActions(merged);
        }
      } catch {
        // Ignore malformed localStorage values
      }
    }
  }, []);

  const startEditing = () => {
    setDraftTitle(dashboardTitle);
    setDraftQuickActionsTitle(quickActionsTitle);
    setDraftQuickActions(quickActions);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraftTitle(dashboardTitle);
    setDraftQuickActionsTitle(quickActionsTitle);
    setDraftQuickActions(quickActions);
  };

  const saveEdits = () => {
    const cleanTitle = draftTitle.trim() || "Admin Dashboard";
    const cleanQuickTitle = draftQuickActionsTitle.trim() || "Quick Actions";
    const cleanQuickActions = draftQuickActions.map((item) => ({
      ...item,
      title: item.title.trim() || "Action",
      link: item.link.trim() || "#",
    }));

    setDashboardTitle(cleanTitle);
    setQuickActionsTitle(cleanQuickTitle);
    setQuickActions(cleanQuickActions);
    setIsEditing(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("adminDashboardTitle", cleanTitle);
      localStorage.setItem("adminQuickActionsTitle", cleanQuickTitle);
      localStorage.setItem(
        "adminQuickActions",
        JSON.stringify(cleanQuickActions.map(({ title, link }) => ({ title, link })))
      );
    }
    message.success("Dashboard updated successfully.");
  };

  const fetchAllStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<DashboardStatsResponse>("/admin/dashboard/stats", {
        timeout: 30000, // 30 seconds timeout for dashboard stats
      });

      if (response.data.status && response.data.data) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || "Failed to load dashboard statistics.");
      }
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      let errorMessage = "Failed to load dashboard statistics. Please try again.";
      
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMessage = "Request timed out. The server may be slow. Please try again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    if (!path || path === "#") return;
    router.push(path);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
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
      link: "/admin/students",
    },
    {
      title: "Total Teachers",
      value: stats.total_teachers,
      icon: <UserOutlined style={{ fontSize: "32px", color: "#52c41a" }} />,
      color: "#52c41a",
      link: "/admin/teachers",
    },
    {
      title: "Total Classes",
      value: stats.total_classes,
      icon: <BookOutlined style={{ fontSize: "32px", color: "#faad14" }} />,
      color: "#faad14",
      link: "/classes",
    },
    {
      title: "Total Fees",
      value: parseFloat(stats.total_fees).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      icon: <DollarOutlined style={{ fontSize: "32px", color: "#f5222d" }} />,
      color: "#f5222d",
      link: "/admin/fees",
      prefix: "₦",
    },
    {
      title: "Total Results",
      value: stats.total_results,
      icon: <TrophyOutlined style={{ fontSize: "32px", color: "#722ed1" }} />,
      color: "#722ed1",
      link: "/admin/results",
    },
    {
      title: "Announcements",
      value: stats.announcements,
      icon: <BellOutlined style={{ fontSize: "32px", color: "#13c2c2" }} />,
      color: "#13c2c2",
      link: "/admin/announcements",
    },
  ];

  return (
    <DashboardLayout role="admin">
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
          {isEditing ? (
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Dashboard title"
              style={{ maxWidth: 320 }}
            />
          ) : (
            dashboardTitle
          )}
        </Title>

        <div style={{ marginBottom: isMobile ? 12 : 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!isEditing ? (
            <Button onClick={startEditing}>Edit Dashboard</Button>
          ) : (
            <>
              <Button type="primary" onClick={saveEdits}>
                Save
              </Button>
              <Button onClick={cancelEditing}>Cancel</Button>
            </>
          )}
        </div>

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
        {statCards.map((stat) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={stat.title}>
            <Card
              hoverable
              onClick={() => navigateTo(stat.link)}
              style={{
                borderRadius: "12px",
                height: "100%",
                border: `1px solid ${stat.color}20`,
                background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                transition: "all 0.3s ease",
                boxShadow: "none",
                cursor: "pointer",
              }}
              styles={{ body: { padding: isMobile ? "16px" : "24px" } }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: isMobile ? "100%" : "auto" }}>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    styles={{ 
                      content: { 
                        color: stat.color, 
                        fontSize: isMobile ? "20px" : "28px", 
                        fontWeight: "bold" 
                      },
                      title: {
                        fontSize: isMobile ? "12px" : "14px"
                      }
                    }}
                  />
                </div>
                <div style={{ marginLeft: isMobile ? "0" : "16px", flexShrink: 0 }}>
                  <div style={{ fontSize: isMobile ? "24px" : "32px" }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

        {/* Quick Links Section */}
        <Title level={4} style={{ marginBottom: isMobile ? 12 : 16, fontSize: isMobile ? 16 : 18 }}>
          {isEditing ? (
            <Input
              value={draftQuickActionsTitle}
              onChange={(e) => setDraftQuickActionsTitle(e.target.value)}
              placeholder="Quick actions title"
              style={{ maxWidth: 320 }}
            />
          ) : (
            quickActionsTitle
          )}
        </Title>

        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={`${action.title}-${index}`}>
            {isEditing ? (
              <Card style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none" }}>
                {action.icon}
                <Input
                  value={draftQuickActions[index]?.title}
                  onChange={(e) => {
                    const updated = [...draftQuickActions];
                    updated[index] = { ...updated[index], title: e.target.value };
                    setDraftQuickActions(updated);
                  }}
                  placeholder="Action title"
                  style={{ marginBottom: 8 }}
                />
                <Input
                  value={draftQuickActions[index]?.link}
                  onChange={(e) => {
                    const updated = [...draftQuickActions];
                    updated[index] = { ...updated[index], link: e.target.value };
                    setDraftQuickActions(updated);
                  }}
                  placeholder="Action link"
                />
              </Card>
            ) : (
              <Card
                hoverable
                onClick={() => navigateTo(action.link)}
                style={{ borderRadius: "8px", height: "100%", textAlign: "center", boxShadow: "none", cursor: "pointer" }}
              >
                {action.icon}
                <Title level={5} style={{ margin: 0, marginBottom: "8px", color: action.color }}>
                  {action.title}
                </Title>
              </Card>
            )}
          </Col>
        ))}
        </Row>
      </div>
    </DashboardLayout>
  );
}
