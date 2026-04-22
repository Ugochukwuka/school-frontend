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
import api from "@/app/lib/api";

const { Title } = Typography;

interface TeacherDashboardStats {
  total_students: number;
  total_classes: number;
  total_subjects: number;
  attendance_marked_today: number;
  results_entered: number;
  upcoming_classes: number;
}

type AnyRecord = Record<string, unknown>;

const METRIC_KEYS: (keyof TeacherDashboardStats)[] = [
  "total_students",
  "total_classes",
  "total_subjects",
  "attendance_marked_today",
  "results_entered",
  "upcoming_classes",
];

const defaultStats: TeacherDashboardStats = {
  total_students: 0,
  total_classes: 0,
  total_subjects: 0,
  attendance_marked_today: 0,
  results_entered: 0,
  upcoming_classes: 0,
};

function asRecord(value: unknown): AnyRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function extractMetricValue(source: AnyRecord | null, key: keyof TeacherDashboardStats): number | null {
  if (!source) return null;
  const snakeKey = key as string;
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return (
    asNumber(source[snakeKey]) ??
    asNumber(source[camelKey]) ??
    asNumber(source.value) ??
    asNumber(source.count) ??
    asNumber(source.total)
  );
}

function parseDashboardStats(payload: unknown): TeacherDashboardStats {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const metrics = asRecord(root?.metrics);
  const dataMetrics = asRecord(data?.metrics);
  const cards = asRecord(root?.cards);
  const dataCards = asRecord(data?.cards);
  const primarySources: (AnyRecord | null)[] = [root, data, metrics, dataMetrics, cards, dataCards];

  const parsed: TeacherDashboardStats = { ...defaultStats };
  for (const key of METRIC_KEYS) {
    for (const source of primarySources) {
      const directValue = extractMetricValue(source, key);
      if (directValue !== null) {
        parsed[key] = directValue;
        break;
      }
      const nested = asRecord(source?.[key as string]) ?? asRecord(source?.[key.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase())]);
      const nestedValue = extractMetricValue(nested, key);
      if (nestedValue !== null) {
        parsed[key] = nestedValue;
        break;
      }
    }
  }
  return parsed;
}

async function fetchTeacherDashboardStats(): Promise<TeacherDashboardStats> {
  try {
    const cardsResponse = await api.get("/teacher/dashboard/cards");
    const parsedCards = parseDashboardStats(cardsResponse.data);
    return parsedCards;
  } catch {
    // Fall back to individual metrics endpoints when aggregate endpoint is unavailable.
  }

  const metricEndpoints: Record<keyof TeacherDashboardStats, string> = {
    total_students: "/teacher/dashboard/metrics/student-class-totals",
    total_classes: "/teacher/dashboard/metrics/student-class-totals",
    total_subjects: "/teacher/dashboard/metrics/total-subjects",
    attendance_marked_today: "/teacher/dashboard/metrics/attendance-marked-today",
    results_entered: "/teacher/dashboard/metrics/results-entered",
    upcoming_classes: "/teacher/dashboard/metrics/upcoming-classes",
  };

  const entries = await Promise.all(
    METRIC_KEYS.map(async (key) => {
      try {
        const response = await api.get(metricEndpoints[key]);
        const parsed = parseDashboardStats(response.data);
        return [key, parsed[key]] as const;
      } catch {
        return [key, 0] as const;
      }
    })
  );

  return entries.reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    { ...defaultStats }
  );
}

export default function TeacherDashboard() {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<TeacherDashboardStats>(defaultStats);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError("");
      try {
        const dashboardStats = await fetchTeacherDashboardStats();
        if (!isMounted) return;
        setStats(dashboardStats);
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load dashboard statistics.";
        setError(errorMessage);
        setStats(defaultStats);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
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
